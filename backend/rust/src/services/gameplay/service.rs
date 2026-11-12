use super::rng::Ids;
use super::types::{refuse, Action, ActionResult, GameError, GameResult, GameSetup, Grid, PuzzleState, StateEvent};
use serde_json::Value;

/// Biggest puzzle the server will start; a guard against absurd templates.
const MAX_PIECES: i64 = 2_500;

/// The code that runs a puzzle game. The default methods are what the game types have in common: they build the
/// starting state, refuse anything that is not a legal move and decide when the game is solved. An implementation
/// supplies only the starting layout and the rules of one move kind. The state is never taken from a client: it is the
/// result of `start` plus every accepted `action`.
pub trait PuzzleGameService: Send + Sync {
    fn kind(&self) -> &'static str;
    /// Makes the GUID of each piece of a new play.
    fn ids(&self) -> &Ids;
    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState;
    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult>;
    fn is_solved(&self, state: &PuzzleState) -> bool;

    /// The first state of a play; 422 when the template or config cannot make a game.
    fn start(&self, setup: &GameSetup) -> GameResult<PuzzleState> {
        let (cols, rows) = (setup.cols, setup.rows);
        if cols < 1 || rows < 1 || cols * rows > MAX_PIECES {
            return refuse(422, format!("the game's template has no usable grid ({cols}x{rows})"));
        }
        let seed = setup.number("seed", 1.0) as i64 as u32;
        let total = (cols * rows) as usize;
        let grid = Grid { cols: cols as usize, rows: rows as usize, total, seed, guids: (0..total).map(|_| self.ids().next()).collect() };
        let mut state = self.initial(setup, &grid);
        state.solved = self.is_solved(&state);
        Ok(state)
    }

    /// Applies one player action to `state`: 400 for a move this game type does not have, 409 for an illegal move.
    fn action(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        if state.solved {
            return refuse(409, "the game is already solved");
        }
        let mut result = self.apply(state, action)?;
        result.state.solved = self.is_solved(&result.state);
        Ok(result)
    }

    /// `(solved, mistakes)` of a play being finished. A play may be finished early; `solved` says if it was completed.
    fn finish(&self, state: &PuzzleState) -> (bool, u64) {
        (state.solved, state.mistakes)
    }

    fn unsupported(&self, action: &Action) -> GameError {
        GameError { status: 400, message: format!("a {} game has no \"{}\" action", self.kind(), action.kind()) }
    }
}

/// Rebuilds a state from its stored rows: the first is the full state, each later one is `{ events, mistakes, solved }`.
pub fn fold_state(rows: &[Value]) -> GameResult<PuzzleState> {
    Ok(fold_states(rows)?.pop().expect("fold_states returns at least one state"))
}

/// Every state of a play, in order: the first row's state, then the state after each later row.
pub fn fold_states(rows: &[Value]) -> GameResult<Vec<PuzzleState>> {
    let Some(first) = rows.first() else { return refuse(404, "the play has no state") };
    let mut state = PuzzleState::from_json(first)?;
    let mut states = vec![state.clone()];
    for row in &rows[1..] {
        let bad = || GameError { status: 500, message: "stored game state is corrupt".into() };
        let events = row["events"].as_array().ok_or_else(bad)?.iter().map(StateEvent::from_json).collect::<GameResult<Vec<_>>>()?;
        state = state.apply(&events)?;
        state.mistakes = row["mistakes"].as_u64().unwrap_or(state.mistakes);
        state.solved = row["solved"].as_bool().unwrap_or(state.solved);
        states.push(state.clone());
    }
    Ok(states)
}
