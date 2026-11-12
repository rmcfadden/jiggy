use super::puzzle::{connected_pieces, is_solved, scatter_offsets, settle_group, snap_piece, Scatter, PIECE_SIZE};
use super::service::PuzzleGameService;
use super::types::{refuse, Action, ActionResult, GameResult, GameSetup, Grid, PuzzleState, HOME};
use serde_json::{json, Map};

/// Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours).
pub struct ScrambledGameService;

impl PuzzleGameService for ScrambledGameService {
    fn kind(&self) -> &'static str {
        "scrambled"
    }

    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState {
        let side = ["top", "left", "right", "bottom"].into_iter().find(|s| setup.config.get("startSide").and_then(|v| v.as_str()) == Some(*s)).unwrap_or("random");
        let loose = setup.number("looseCount", 0.0).floor() as usize;
        let offsets = scatter_offsets(&Scatter {
            cols: grid.cols,
            rows: grid.rows,
            seed: grid.seed,
            side,
            count: if loose == 0 { grid.total } else { loose },
            view_percent: setup.number("viewPercent", 40.0),
            spread: setup.number("spread", 30.0),
        });
        let mut state = PuzzleState::new(self.kind(), grid);
        state.free_build = Some(setup.config.get("freeBuild").and_then(|v| v.as_bool()) != Some(false));
        state.offsets = Some(offsets);
        state
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        is_solved(state.offsets.as_deref().unwrap_or(&[]))
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        let Action::Move { piece, x, y } = *action else { return Err(self.unsupported(action)) };
        let offsets = state.offsets.clone().unwrap_or_default();
        if piece >= state.total {
            return refuse(409, format!("there is no piece {piece}"));
        }
        // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
        let limit = state.cols.max(state.rows) as f64 * PIECE_SIZE * 4.0;
        if x.abs() > limit || y.abs() > limit {
            return refuse(409, "the piece was moved off the board area");
        }
        if offsets[piece] == HOME {
            return refuse(409, format!("piece {piece} is already placed"));
        }
        let free_build = state.free_build.unwrap_or(true);
        let group = if free_build { connected_pieces(&offsets, state.cols, piece) } else { vec![piece] };
        let moved: Vec<_> = offsets.iter().enumerate().map(|(i, o)| if group.contains(&i) { super::types::Offset { x, y } } else { *o }).collect();
        let next = if free_build {
            settle_group(&moved, state.cols, &group)
        } else {
            moved.iter().enumerate().map(|(i, o)| if i == piece { snap_piece(*o) } else { *o }).collect()
        };

        let mut changes = Map::new();
        for (i, o) in next.iter().enumerate() {
            if *o != offsets[i] {
                changes.insert(i.to_string(), json!({ "x": o.x, "y": o.y }));
            }
        }
        let correct = next[piece] == HOME;
        let mut delta = Map::new();
        delta.insert("offsets".into(), serde_json::Value::Object(changes));
        let mut new_state = state.clone();
        new_state.offsets = Some(next);
        Ok(ActionResult { state: new_state, delta, correct })
    }
}
