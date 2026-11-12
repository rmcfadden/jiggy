use super::puzzle::{connected_pieces, is_solved, scatter_offsets, settle_group, snap_piece, Scatter, PIECE_SIZE};
use super::rng::Ids;
use super::service::PuzzleGameService;
use super::types::{move_result, refuse, Action, ActionResult, GameResult, GameSetup, Grid, Offset, PuzzleState, StateEvent, HOME};

/// Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours).
#[derive(Default)]
pub struct ScrambledGameService(pub Ids);

impl PuzzleGameService for ScrambledGameService {
    fn kind(&self) -> &'static str {
        "scrambled"
    }

    fn ids(&self) -> &Ids {
        &self.0
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
        state.pieces = Some(grid.guids.iter().cloned().zip(offsets).collect());
        state
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        is_solved(&state.offsets())
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        let Action::Move { piece: guid, x, y } = action else { return Err(self.unsupported(action)) };
        let (x, y) = (*x, *y);
        let Some(&piece) = state.piece_indexes().get(guid.as_str()) else { return refuse(409, format!("there is no piece {guid}")) };
        // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
        let limit = state.cols.max(state.rows) as f64 * PIECE_SIZE * 4.0;
        if x.abs() > limit || y.abs() > limit {
            return refuse(409, "the piece was moved off the board area");
        }
        let offsets = state.offsets();
        if offsets[piece] == HOME {
            return refuse(409, format!("piece {guid} is already placed"));
        }

        // Joined pieces move as one: the dragged piece's whole group takes the drop, then settles together.
        let free_build = state.free_build.unwrap_or(true);
        let group = if free_build { connected_pieces(&offsets, state.cols, piece) } else { vec![piece] };
        let moved: Vec<_> = offsets.iter().enumerate().map(|(i, o)| if group.contains(&i) { Offset { x, y } } else { *o }).collect();
        let next = if free_build {
            settle_group(&moved, state.cols, &group)
        } else {
            moved.iter().enumerate().map(|(i, o)| if i == piece { snap_piece(*o) } else { *o }).collect()
        };
        let at = next[piece];
        let guids = state.guids();
        let names = |indexes: &[usize]| indexes.iter().map(|&i| guids[i].to_string()).collect::<Vec<_>>();

        let placed = at == HOME;
        let mut events = vec![if placed { StateEvent::Added { pieces: names(&group) } } else { StateEvent::Moved { pieces: names(&group), x: at.x, y: at.y } }];
        // Landing against a neighbour makes a bigger group; say so with the whole new group.
        if !placed && free_build {
            let joined = connected_pieces(&next, state.cols, piece);
            if joined.len() > group.len() {
                events.push(StateEvent::Joined { pieces: names(&joined), x: at.x, y: at.y });
            }
        }
        let new_state = state.apply(&events)?;
        Ok(ActionResult { state: new_state, events, result: if placed { move_result::PLACED } else { move_result::MOVED }, correct: placed, reason: None })
    }
}
