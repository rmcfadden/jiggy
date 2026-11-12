use crate::generated::repositories::gamePlayActionsRepository::GamePlayActionsRepository;
use crate::generated::repositories::gamePlayStatesRepository::GamePlayStatesRepository;
use crate::generated::repositories::gamePlayUsersRepository::GamePlayUsersRepository;
use crate::generated::repositories::gamePlaysRepository::GamePlaysRepository;
use crate::generated::{GamePlay, GamePlayAction, GamePlayState, GamePlayUser};
use crate::services::gameplay::registry::GameServiceRegistry;
use crate::services::gameplay::service::fold_state;
use crate::services::gameplay::types::{parse_action, GameError, GameSetup, PuzzleState};
use crate::services::games::GamesService;
use crate::services::templates::TemplatesService;
use datasources::chrono::{DateTime, SecondsFormat, Utc};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;

type Locks = Arc<std::sync::Mutex<HashMap<i64, Arc<tokio::sync::Mutex<()>>>>>;

/// Holds a play's lock; on drop it releases it and forgets the map entry when nobody else waits on it.
struct PlayLock {
    guard: Option<tokio::sync::OwnedMutexGuard<()>>,
    mutex: Arc<tokio::sync::Mutex<()>>,
    locks: Locks,
    id: i64,
}

impl Drop for PlayLock {
    fn drop(&mut self) {
        self.guard.take();
        let mut locks = self.locks.lock().expect("locks");
        // The map and `self.mutex` are the only references left when no other request is waiting.
        if Arc::strong_count(&self.mutex) == 2 {
            locks.remove(&self.id);
        }
    }
}

/// A refused request (`Game`, with its HTTP status) or a failure of the datasource.
#[derive(Debug)]
pub enum PlayError {
    Game(GameError),
    Internal(String),
}

impl From<GameError> for PlayError {
    fn from(err: GameError) -> Self {
        Self::Game(err)
    }
}

impl From<datasources::DatasourceError> for PlayError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Internal(format!("{err:?}"))
    }
}

type Result<T> = std::result::Result<T, PlayError>;

fn refused<T>(status: u16, message: impl Into<String>) -> Result<T> {
    Err(PlayError::Game(GameError { status, message: message.into() }))
}

fn stamp(time: DateTime<Utc>) -> String {
    time.to_rfc3339_opts(SecondsFormat::Millis, true)
}

/// Runs game plays: `start` creates a play with its first state, `action` hands a player's move to the game service
/// and stores the accepted result, `finish` closes the play. A play is read through the `game_play` view, which brings
/// its participants, state changes and actions in one fetch; writes go to the base repositories. Only this service
/// writes `game_play_state`, so a client can never set the state, only ask for moves the rules accept.
pub struct GamePlaysService {
    plays: Arc<GamePlaysRepository>,
    states: Arc<GamePlayStatesRepository>,
    actions: Arc<GamePlayActionsRepository>,
    users: Arc<GamePlayUsersRepository>,
    games: Arc<GamesService>,
    templates: Arc<TemplatesService>,
    registry: GameServiceRegistry,
    /// Serialises writes per play so two moves cannot both be checked against the same state.
    locks: Locks,
}

impl GamePlaysService {
    pub fn new(
        plays: Arc<GamePlaysRepository>,
        states: Arc<GamePlayStatesRepository>,
        actions: Arc<GamePlayActionsRepository>,
        users: Arc<GamePlayUsersRepository>,
        games: Arc<GamesService>,
        templates: Arc<TemplatesService>,
    ) -> Self {
        Self { plays, states, actions, users, games, templates, registry: GameServiceRegistry::new(), locks: Default::default() }
    }

    /// Starts a play of `game_id` for `user_id`; the game's parent decides which game service runs it.
    pub async fn start(&self, game_id: i64, user_id: i64) -> Result<Value> {
        let game = self.games.get(game_id).await.map_err(|e| PlayError::Internal(format!("{e:?}")))?;
        let Some(game) = game else { return refused(404, format!("unknown game: {game_id}")) };
        let service = self.registry.for_parent(game["parent"].as_str().unwrap_or_default())?;
        let template = self.templates.get(game["templateId"].as_i64().unwrap_or_default()).await.map_err(|_| PlayError::Internal("templates".into()))?;
        let content = template.map(|t| t["content"].clone()).unwrap_or(Value::Null);
        let config = game["config"]["config"].as_object().cloned().unwrap_or_default();
        let setup = GameSetup { cols: content["cols"].as_i64().unwrap_or(0), rows: content["rows"].as_i64().unwrap_or(0), config };
        let state = service.start(&setup)?;

        let play = self.plays.create(GamePlay { game_id, user_id, finished: None, ..GamePlay::default() }).await?;
        self.users.create(GamePlayUser { game_play_id: play.id, user_id, ..GamePlayUser::default() }).await?;
        self.states.create(GamePlayState { game_play_id: play.id, state_change: state.to_json().to_string(), ..GamePlayState::default() }).await?;
        Ok(json!({ "id": play.id, "gameId": game_id, "finished": null, "state": state.to_json() }))
    }

    /// Applies one action; 400 for a malformed one and 409 for one the rules refuse, storing nothing in both cases.
    pub async fn action(&self, play_id: i64, user_id: i64, body: &Value) -> Result<Value> {
        let action = parse_action(body)?;
        let _guard = self.lock(play_id).await;
        let play = self.load(play_id, user_id).await?;
        if play.finished.is_some() {
            return refused(409, "the play is finished");
        }
        let state = state_of(&play)?;
        let result = self.registry.for_parent(&state.kind)?.action(&state, &action)?;
        // The state row goes first: it is the truth. A failure before the action row leaves a state with no log entry, never a logged move that did not happen.
        self.states.create(GamePlayState { game_play_id: play_id, state_change: Value::Object(result.delta).to_string(), ..GamePlayState::default() }).await?;
        self.actions.create(GamePlayAction { game_play_id: play_id, user_id, action: action.to_json().to_string(), ..GamePlayAction::default() }).await?;
        // Solving the puzzle ends the play: `finished` is set by the game, not by the client.
        let finished = if result.state.solved { Some(self.mark_finished(play_id).await?) } else { play.finished };
        Ok(json!({ "accepted": true, "correct": result.correct, "solved": result.state.solved, "finished": finished.map(stamp), "state": result.state.to_json() }))
    }

    pub async fn state(&self, play_id: i64, user_id: i64) -> Result<Value> {
        let play = self.load(play_id, user_id).await?;
        let state = state_of(&play)?;
        Ok(json!({ "id": play_id, "gameId": play.game_id, "finished": play.finished.map(stamp), "state": state.to_json() }))
    }

    pub async fn action_list(&self, play_id: i64, user_id: i64) -> Result<Value> {
        let play = self.load(play_id, user_id).await?;
        let mut actions = play.actions.clone();
        actions.sort_by_key(|a| a.id);
        Ok(Value::Array(
            actions
                .iter()
                .map(|a| json!({ "id": a.id, "userId": a.user_id, "action": serde_json::from_str::<Value>(&a.action).unwrap_or(Value::Null), "created": stamp(a.created) }))
                .collect(),
        ))
    }

    /// Closes the play (a solved play is already closed). It may be finished early; `solved` in the result says which.
    pub async fn finish(&self, play_id: i64, user_id: i64) -> Result<Value> {
        let _guard = self.lock(play_id).await;
        let play = self.load(play_id, user_id).await?;
        let state = state_of(&play)?;
        let (solved, mistakes) = self.registry.for_parent(&state.kind)?.finish(&state);
        // A play that already ended (solved) just reports its result; finishing is idempotent.
        let finished = match play.finished {
            Some(time) => time,
            None => self.mark_finished(play_id).await?,
        };
        Ok(json!({ "id": play_id, "finished": stamp(finished), "solved": solved, "mistakes": mistakes, "state": state.to_json() }))
    }

    /// Sets `finished`. The play is read again first: updating the view repository also rewrites its child lists, so an
    /// update made with a list loaded before this request's new rows would delete those rows.
    async fn mark_finished(&self, play_id: i64) -> Result<DateTime<Utc>> {
        let Some(mut fresh) = self.plays.read_single_by_id(&datasources::Value::Int(play_id)).await? else { return refused(404, format!("unknown play: {play_id}")) };
        let now = Utc::now();
        fresh.finished = Some(now);
        self.plays.update(fresh, None).await?;
        Ok(now)
    }

    /// The play with its users, states and actions; 404 when missing, 403 when `user_id` is not a participant.
    async fn load(&self, play_id: i64, user_id: i64) -> Result<GamePlay> {
        let Some(play) = self.plays.read_single_by_id(&datasources::Value::Int(play_id)).await? else { return refused(404, format!("unknown play: {play_id}")) };
        if !play.users.iter().any(|u| u.id == user_id) {
            return refused(403, "you are not a player of this game");
        }
        Ok(play)
    }

    async fn lock(&self, play_id: i64) -> PlayLock {
        let mutex = self.locks.lock().expect("locks").entry(play_id).or_default().clone();
        let guard = mutex.clone().lock_owned().await;
        PlayLock { guard: Some(guard), mutex, locks: self.locks.clone(), id: play_id }
    }
}

fn state_of(play: &GamePlay) -> std::result::Result<PuzzleState, GameError> {
    let mut states = play.states.clone();
    states.sort_by_key(|s| s.id);
    let changes: Vec<Value> = states.iter().map(|s| serde_json::from_str(&s.state_change).unwrap_or(Value::Null)).collect();
    fold_state(&changes)
}
