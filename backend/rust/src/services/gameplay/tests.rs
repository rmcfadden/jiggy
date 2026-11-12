use super::registry::GameServiceRegistry;
use super::rng::Ids;
use super::scrambled::ScrambledGameService;
use super::service::{fold_state, PuzzleGameService};
use super::tray::{LastXGameService, NextPiecesGameService};
use super::types::{move_result, parse_action, state_row, Action, ActionResult, GameResult, GameSetup, Offset, PuzzleState, StateEvent, HOME};
use serde_json::{json, Value};

const FORGED: &str = "ffffffff-ffff-4fff-8fff-ffffffffffff";

fn setup(cols: i64, rows: i64, config: Value) -> GameSetup {
    GameSetup { cols, rows, config: config.as_object().cloned().unwrap_or_default() }
}

/// A registry whose piece GUIDs count, so a test knows every GUID. Real plays use random v4 UUIDs.
fn registry() -> GameServiceRegistry {
    GameServiceRegistry::with(vec![
        Box::new(ScrambledGameService(Ids::counter())),
        Box::new(NextPiecesGameService(Ids::counter())),
        Box::new(LastXGameService(Ids::counter())),
    ])
}

fn status<T>(result: GameResult<T>) -> u16 {
    result.err().expect("expected a refusal").status
}

fn mv(piece: &str, x: f64, y: f64) -> Action {
    Action::Move { piece: piece.into(), x, y }
}

fn place(piece: &str, slot: usize) -> Action {
    Action::Place { piece: piece.into(), slot }
}

fn guid(state: &PuzzleState, i: usize) -> String {
    state.guids()[i].to_string()
}

fn at(state: &PuzzleState, i: usize) -> Offset {
    state.pieces.as_ref().unwrap()[&guid(state, i)]
}

fn sorted(pieces: &[String]) -> Vec<String> {
    let mut p = pieces.to_vec();
    p.sort();
    p
}

#[test]
fn parse_action_accepts_the_two_contracts_and_rejects_everything_else() {
    assert_eq!(parse_action(&json!({ "type": "place", "piece": FORGED, "slot": 2 })).unwrap(), place(FORGED, 2));
    assert_eq!(parse_action(&json!({ "type": "move", "piece": FORGED.to_uppercase(), "x": -3.5, "y": 4 })).unwrap(), mv(FORGED, -3.5, 4.0));
    for bad in [
        json!(null),
        json!([]),
        json!("x"),
        json!({}),
        json!({ "type": "fly" }),
        json!({ "type": "place", "piece": 1, "slot": 0 }),
        json!({ "type": "place", "piece": "not-a-guid", "slot": 0 }),
        json!({ "type": "place", "piece": FORGED, "slot": -1 }),
        json!({ "type": "place", "piece": FORGED, "slot": 0, "extra": 1 }),
        json!({ "type": "move", "piece": FORGED, "x": "1", "y": 0 }),
    ] {
        assert_eq!(status(parse_action(&bad)), 400, "{bad}");
    }
}

#[test]
fn an_unknown_parent_has_no_service_and_a_bad_grid_cannot_start() {
    let registry = registry();
    assert_eq!(status(registry.for_parent("chess")), 422);
    assert_eq!(status(registry.for_parent("scrambled").unwrap().start(&setup(0, 3, json!({})))), 422);
}

#[test]
fn the_matrix_holds_unique_guids_and_two_plays_never_share_one() {
    let registry = GameServiceRegistry::new(); // real random GUIDs
    let service = registry.for_parent("scrambled").unwrap();
    let a = service.start(&setup(4, 3, json!({ "seed": 1 }))).unwrap();
    let b = service.start(&setup(4, 3, json!({ "seed": 1 }))).unwrap();
    assert_eq!(a.matrix.len(), 3);
    assert!(a.matrix.iter().all(|row| row.len() == 4));
    let names: std::collections::HashSet<_> = a.guids().into_iter().collect();
    assert_eq!(names.len(), 12);
    assert!(b.guids().iter().all(|g| !names.contains(g)));
    // The same seed still lays pieces out the same way: only the names differ.
    assert_eq!(a.offsets(), b.offsets());
}

#[test]
fn next_pieces_panel_mistakes_and_solving() {
    let registry = registry();
    let service = registry.for_parent("next-pieces").unwrap();
    let mut state = service.start(&setup(2, 2, json!({ "panelSize": 2, "order": "sequential" }))).unwrap();
    let p: Vec<String> = (0..4).map(|i| guid(&state, i)).collect();
    assert_eq!(state.queue, Some(p.clone()));
    assert_eq!(state.visible, Some(2));
    assert_eq!(status(service.action(&state, &place(&p[3], 3))), 409); // not in the panel
    assert_eq!(status(service.action(&state, &place(FORGED, 0))), 409); // not a piece of this play
    assert_eq!(status(service.action(&state, &mv(&p[0], 0.0, 0.0))), 400); // wrong action kind
    let wrong = service.action(&state, &place(&p[0], 1)).unwrap();
    assert_eq!(wrong.result, move_result::DENIED);
    assert!(!wrong.correct);
    assert!(wrong.events.is_empty());
    assert_eq!(wrong.state.mistakes, 1);
    for slot in 0..4 {
        let result = service.action(&state, &place(&p[slot], slot)).unwrap();
        assert_eq!(result.result, move_result::PLACED);
        assert_eq!(result.events, vec![StateEvent::Added { pieces: vec![p[slot].clone()] }]);
        state = result.state;
    }
    assert!(state.solved);
    assert_eq!(status(service.action(&state, &place(&p[0], 0))), 409); // already solved
}

#[test]
fn a_filled_slot_is_refused() {
    let registry = registry();
    let service = registry.for_parent("next-pieces").unwrap();
    let state = service.start(&setup(2, 1, json!({ "panelSize": 2 }))).unwrap();
    let next = service.action(&state, &place(&guid(&state, 0), 0)).unwrap().state;
    assert_eq!(status(service.action(&next, &place(&guid(&state, 1), 0))), 409);
}

#[test]
fn last_x_leaves_exactly_x_pieces_and_the_same_seed_gives_the_same_game() {
    let service_registry = registry();
    let service = service_registry.for_parent("last-x").unwrap();
    let config = json!({ "remaining": 3, "seed": 7 });
    let a = service.start(&setup(3, 3, config.clone())).unwrap();
    assert_eq!(a.queue.as_ref().unwrap().len(), 3);
    assert_eq!(a, registry().for_parent("last-x").unwrap().start(&setup(3, 3, config)).unwrap()); // counter GUIDs repeat per registry
    let mut state = a.clone();
    for piece in a.queue.clone().unwrap() {
        let slot = a.guids().iter().position(|g| *g == piece).unwrap();
        state = service.action(&state, &place(&piece, slot)).unwrap().state;
    }
    assert!(state.solved);
}

#[test]
fn scrambled_pieces_start_loose_snap_home_and_placed_pieces_are_locked() {
    let registry = registry();
    let service = registry.for_parent("scrambled").unwrap();
    let start = service.start(&setup(3, 2, json!({ "seed": 5, "freeBuild": false }))).unwrap();
    assert_eq!(start.pieces.as_ref().unwrap().len(), 6);
    assert!(!start.solved);
    assert!(start.pieces.as_ref().unwrap().values().all(|o| *o != HOME));
    assert_eq!(status(service.action(&start, &mv(FORGED, 0.0, 0.0))), 409);
    assert_eq!(status(service.action(&start, &mv(&guid(&start, 0), 1e9, 0.0))), 409);
    assert_eq!(status(service.action(&start, &place(&guid(&start, 0), 0))), 400);

    let near = service.action(&start, &mv(&guid(&start, 0), 10.0, -10.0)).unwrap();
    assert_eq!(near.result, move_result::PLACED);
    assert!(near.correct);
    assert_eq!(near.events, vec![StateEvent::Added { pieces: vec![guid(&start, 0)] }]);
    assert_eq!(at(&near.state, 0), HOME);
    assert_eq!(status(service.action(&near.state, &mv(&guid(&start, 0), 50.0, 50.0))), 409);

    let far = service.action(&start, &mv(&guid(&start, 1), 500.0, 500.0)).unwrap();
    assert_eq!(far.result, move_result::MOVED);
    assert!(!far.correct);
    assert_eq!(far.events, vec![StateEvent::Moved { pieces: vec![guid(&start, 1)], x: 500.0, y: 500.0 }]);
    assert_eq!(at(&far.state, 1), Offset { x: 500.0, y: 500.0 });

    let mut state = start.clone();
    for i in 0..6 {
        state = service.action(&state, &mv(&guid(&start, i), 0.0, 0.0)).unwrap().state;
    }
    assert!(state.solved);
}

#[test]
fn scrambled_free_build_a_joined_group_moves_as_one_with_one_event_naming_every_piece() {
    let registry = registry();
    let service = registry.for_parent("scrambled").unwrap();
    let mut state = service.start(&setup(3, 1, json!({ "seed": 2, "freeBuild": true }))).unwrap();
    let (a, b, c) = (guid(&state, 0), guid(&state, 1), guid(&state, 2));
    state = service.action(&state, &mv(&b, 400.0, 400.0)).unwrap().state;
    // Piece 0 lands beside piece 1: it settles onto it and the two are joined.
    let join = service.action(&state, &mv(&a, 405.0, 398.0)).unwrap();
    assert_eq!(join.result, move_result::MOVED);
    assert_eq!(join.events.len(), 2);
    assert_eq!(join.events[0], StateEvent::Moved { pieces: vec![a.clone()], x: 400.0, y: 400.0 }); // the settled position, not the raw drop
    let StateEvent::Joined { pieces, .. } = &join.events[1] else { panic!("expected pieces_joined") };
    assert_eq!(sorted(pieces), sorted(&[a.clone(), b.clone()]));
    assert_eq!(at(&join.state, 0), at(&join.state, 1));

    // Dragging either member now moves both, as a single pieces_moved event.
    let moved = service.action(&join.state, &mv(&b, 300.0, 300.0)).unwrap();
    assert_eq!(moved.events.len(), 1);
    let StateEvent::Moved { pieces, .. } = &moved.events[0] else { panic!("expected pieces_moved") };
    assert_eq!(sorted(pieces), sorted(&[a.clone(), b.clone()]));
    assert_eq!(at(&moved.state, 0), Offset { x: 300.0, y: 300.0 });
    assert_eq!(at(&moved.state, 1), Offset { x: 300.0, y: 300.0 });
    assert_ne!(at(&moved.state, 2), Offset { x: 300.0, y: 300.0 }); // piece c is not part of the group
    assert!(!c.is_empty());

    // Dropping the whole group on the template places every member in one pieces_added event.
    let home = service.action(&moved.state, &mv(&a, 0.0, 0.0)).unwrap();
    assert_eq!(home.result, move_result::PLACED);
    assert_eq!(home.events.len(), 1);
    let StateEvent::Added { pieces } = &home.events[0] else { panic!("expected pieces_added") };
    assert_eq!(sorted(pieces), sorted(&[a.clone(), b.clone()]));
    assert_eq!(at(&home.state, 0), HOME);
    assert_eq!(at(&home.state, 1), HOME);
}

fn replay(service: &dyn PuzzleGameService, start: &PuzzleState, actions: &[Action]) -> (PuzzleState, Vec<Value>) {
    let mut state = start.clone();
    let mut rows = vec![start.to_json()];
    for action in actions {
        let result: ActionResult = service.action(&state, action).unwrap();
        rows.push(serde_json::from_str(&state_row(&result).to_string()).unwrap());
        state = result.state;
    }
    (state, rows)
}

#[test]
fn fold_state_replays_the_first_row_and_the_stored_event_rows() {
    let registry = registry();
    let service = registry.for_parent("scrambled").unwrap();
    let start = service.start(&setup(2, 2, json!({ "seed": 3, "freeBuild": false }))).unwrap();
    let (state, rows) = replay(service, &start, &[mv(&guid(&start, 0), 5.0, 5.0), mv(&guid(&start, 1), 400.0, 0.0)]);
    assert_eq!(fold_state(&rows).unwrap(), state);
    assert_eq!(status(fold_state(&[])), 404);
    assert_eq!(status(fold_state(&[json!({ "type": "scrambled", "offsets": [] })])), 409); // stored before GUIDs
}

#[test]
fn fold_state_replays_tray_games_mistakes_included() {
    let registry = registry();
    let service = registry.for_parent("next-pieces").unwrap();
    let start = service.start(&setup(2, 1, json!({ "panelSize": 2 }))).unwrap();
    let (p0, p1) = (guid(&start, 0), guid(&start, 1));
    let (state, rows) = replay(service, &start, &[place(&p0, 1), place(&p0, 0), place(&p1, 1)]);
    assert_eq!(state.mistakes, 1);
    assert!(state.solved);
    assert_eq!(fold_state(&rows).unwrap(), state);
}
