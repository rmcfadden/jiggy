use super::types::{refuse, Action, ActionResult, GameError, GameResult, GameSetup, Grid, PuzzleState};
use serde_json::{Map, Value};

/// Biggest puzzle the server will start; a guard against absurd templates.
const MAX_PIECES: i64 = 2_500;

/// The code that runs a puzzle game. The default methods are what the game types have in common: they build the
/// starting state, refuse anything that is not a legal move and decide when the game is solved. An implementation
/// supplies only the starting layout and the rules of one move kind. The state is never taken from a client: it is the
/// result of `start` plus every accepted `action`.
pub trait PuzzleGameService: Send + Sync {
    fn kind(&self) -> &'static str;
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
        let grid = Grid { cols: cols as usize, rows: rows as usize, total: (cols * rows) as usize, seed };
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
        let solved = self.is_solved(&result.state);
        result.state.solved = solved;
        if solved {
            result.delta.insert("solved".into(), Value::Bool(true));
        }
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

/// Rebuilds a state from its stored changes: the first row is the full state and each later row replaces the keys it
/// names. `offsets` is the exception, it is stored sparsely as `{ pieceIndex: {x, y} }` and patched in place.
pub fn fold_state(changes: &[Value]) -> GameResult<PuzzleState> {
    let Some(first) = changes.first() else { return refuse(404, "the play has no state") };
    let mut state: Map<String, Value> = first.as_object().cloned().unwrap_or_default();
    for change in &changes[1..] {
        let Some(change) = change.as_object() else { continue };
        for (key, value) in change {
            match (key.as_str(), value) {
                ("offsets", Value::Object(sparse)) => {
                    let mut offsets = state.get("offsets").and_then(Value::as_array).cloned().unwrap_or_default();
                    for (index, offset) in sparse {
                        if let Ok(i) = index.parse::<usize>() {
                            if i < offsets.len() {
                                offsets[i] = offset.clone();
                            }
                        }
                    }
                    state.insert("offsets".into(), Value::Array(offsets));
                }
                _ => {
                    state.insert(key.clone(), value.clone());
                }
            }
        }
    }
    PuzzleState::from_json(&Value::Object(state))
}
