use super::rng::{shuffle, Rng};
use super::service::PuzzleGameService;
use super::types::{refuse, Action, ActionResult, GameResult, GameSetup, Grid, PuzzleState};
use serde_json::{json, Map};

struct Layout {
    queue: Vec<usize>,
    visible: usize,
    placed: Vec<bool>,
}

fn clamp(n: f64, total: usize) -> usize {
    (n.floor() as i64).clamp(1, total as i64) as usize
}

/// The initial tray state, shared by the games where the player drops pieces from a panel into slots.
fn initial(kind: &str, grid: &Grid, layout: Layout) -> PuzzleState {
    let mut state = PuzzleState::new(kind, grid);
    state.placed = Some(layout.placed);
    state.queue = Some(layout.queue);
    state.visible = Some(layout.visible);
    state
}

/// A piece goes in its own slot or counts as a mistake; a piece outside the panel or a filled slot is refused.
fn apply(service: &dyn PuzzleGameService, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
    let Action::Place { piece, slot } = *action else { return Err(service.unsupported(action)) };
    if slot >= state.total {
        return refuse(409, format!("there is no slot {slot}"));
    }
    let queue = state.queue.clone().unwrap_or_default();
    let placed = state.placed.clone().unwrap_or_default();
    if !queue.iter().take(state.visible.unwrap_or(0)).any(|q| *q == piece) {
        return refuse(409, format!("piece {piece} is not in the panel"));
    }
    if placed.get(slot).copied().unwrap_or(false) {
        return refuse(409, format!("slot {slot} is already filled"));
    }
    let mut next = state.clone();
    let mut delta = Map::new();
    if piece != slot {
        next.mistakes += 1;
        delta.insert("mistakes".into(), json!(next.mistakes));
        return Ok(ActionResult { state: next, delta, correct: false });
    }
    let placed: Vec<bool> = placed.iter().enumerate().map(|(i, p)| *p || i == slot).collect();
    let queue: Vec<usize> = queue.into_iter().filter(|q| *q != piece).collect();
    delta.insert("placed".into(), json!(placed));
    delta.insert("queue".into(), json!(queue));
    next.placed = Some(placed);
    next.queue = Some(queue);
    Ok(ActionResult { state: next, delta, correct: true })
}

fn solved(state: &PuzzleState) -> bool {
    state.queue.as_ref().is_none_or(Vec::is_empty)
}

/// Next pieces in panel: the panel offers the next few pieces of the queue, in order or shuffled.
pub struct NextPiecesGameService;

impl PuzzleGameService for NextPiecesGameService {
    fn kind(&self) -> &'static str {
        "next-pieces"
    }

    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState {
        let all: Vec<usize> = (0..grid.total).collect();
        let random = setup.config.get("order").and_then(|v| v.as_str()) == Some("random");
        let queue = if random { shuffle(&all, &mut Rng::new(grid.seed)) } else { all };
        initial(self.kind(), grid, Layout { queue, visible: clamp(setup.number("panelSize", 3.0), grid.total), placed: vec![false; grid.total] })
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        apply(self, state, action)
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        solved(state)
    }
}

/// Solve last X pieces: all but X random pieces start placed, the player places the rest.
pub struct LastXGameService;

impl PuzzleGameService for LastXGameService {
    fn kind(&self) -> &'static str {
        "last-x"
    }

    fn initial(&self, setup: &GameSetup, grid: &Grid) -> PuzzleState {
        let all: Vec<usize> = (0..grid.total).collect();
        let queue: Vec<usize> = shuffle(&all, &mut Rng::new(grid.seed)).into_iter().take(clamp(setup.number("remaining", 5.0), grid.total)).collect();
        let placed = all.iter().map(|i| !queue.contains(i)).collect();
        let visible = queue.len();
        initial(self.kind(), grid, Layout { queue, visible, placed })
    }

    fn apply(&self, state: &PuzzleState, action: &Action) -> GameResult<ActionResult> {
        apply(self, state, action)
    }

    fn is_solved(&self, state: &PuzzleState) -> bool {
        solved(state)
    }
}
