use super::rng::{shuffle, Ids, Rng};
use super::service::PuzzleGameService;
use super::types::{move_result, refuse, Action, ActionResult, GameResult, GameSetup, Grid, PuzzleState, StateEvent};

struct Layout {
    queue: Vec<usize>,
    visible: usize,
}

fn clamp(n: f64, total: usize) -> usize {
    (n.floor() as i64).clamp(1, total as i64) as usize
}

/// The initial tray state, shared by the games where the player drops pieces from a panel into slots.
fn initial(kind: &str, grid: &Grid, layout: Layout) -> PuzzleState {
    let mut state = PuzzleState::new(kind, grid);
    state.queue = Some(layout.queue.into_iter().map(|i| grid.guids[i].clone()).collect());
    state.visible = Some(layout.visible);
    state
}

/// A piece goes in its own slot or counts as a mistake; a piece outside the panel or a filled slot is refused.
fn apply(service: &dyn PuzzleGameService, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
    let Action::Place { piece, slot } = action else { return Err(service.unsupported(action)) };
    let slot = *slot;
    let Some(&index) = state.piece_indexes().get(piece.as_str()) else { return refuse(409, format!("there is no piece {piece}")) };
    if slot >= state.total {
        return refuse(409, format!("there is no slot {slot}"));
    }
    if !state.queue.iter().flatten().take(state.visible.unwrap_or(0)).any(|q| q == piece) {
        return refuse(409, format!("piece {piece} is not in the panel"));
    }
    if !state.queue.iter().flatten().any(|q| *q == state.guids()[slot]) {
        return refuse(409, format!("slot {slot} is already filled"));
    }
    if index != slot {
        // A wrong slot is a legal try that fails: it costs a mistake and changes nothing else.
        let mut next = state.clone();
        next.mistakes += 1;
        return Ok(ActionResult { state: next, events: vec![], result: move_result::DENIED, correct: false, reason: Some(format!("piece {piece} does not belong in slot {slot}")) });
    }
    let events = vec![StateEvent::Added { pieces: vec![piece.clone()] }];
    Ok(ActionResult { state: state.apply(&events)?, events, result: move_result::PLACED, correct: true, reason: None })
}

fn solved(state: &PuzzleState) -> bool {
    state.queue.as_ref().is_none_or(Vec::is_empty)
}

/// Next pieces in panel: the panel offers the next few pieces of the queue, in order or shuffled.
#[derive(Default)]
pub struct NextPiecesGameService(pub Ids);

impl PuzzleGameService for NextPiecesGameService {
    fn kind(&self) -> &'static str {
        "next-pieces"
    }

    fn ids(&self) -> &Ids {
        &self.0
    }

    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState {
        let all: Vec<usize> = (0..grid.total).collect();
        let random = setup.config.get("order").and_then(|v| v.as_str()) == Some("random");
        let queue = if random { shuffle(&all, &mut Rng::new(grid.seed)) } else { all };
        initial(self.kind(), grid, Layout { queue, visible: clamp(setup.number("panelSize", 3.0), grid.total) })
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        apply(self, state, action)
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        solved(state)
    }
}

/// Solve last X pieces: all but X random pieces start placed, the player places the rest.
#[derive(Default)]
pub struct LastXGameService(pub Ids);

impl PuzzleGameService for LastXGameService {
    fn kind(&self) -> &'static str {
        "last-x"
    }

    fn ids(&self) -> &Ids {
        &self.0
    }

    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState {
        let all: Vec<usize> = (0..grid.total).collect();
        let queue: Vec<usize> = shuffle(&all, &mut Rng::new(grid.seed)).into_iter().take(clamp(setup.number("remaining", 5.0), grid.total)).collect();
        let visible = queue.len();
        initial(self.kind(), grid, Layout { queue, visible })
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        apply(self, state, action)
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        solved(state)
    }
}
