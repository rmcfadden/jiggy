use super::registry::GameServiceRegistry;
use super::service::fold_state;
use super::types::{parse_action, Action, GameResult, GameSetup, Offset, PuzzleState, HOME};
use serde_json::{json, Value};

fn setup(cols: i64, rows: i64, config: Value) -> GameSetup {
    GameSetup { cols, rows, config: config.as_object().cloned().unwrap_or_default() }
}

fn status<T>(result: GameResult<T>) -> u16 {
    result.err().expect("expected a refusal").status
}

fn mv(piece: usize, x: f64, y: f64) -> Action {
    Action::Move { piece, x, y }
}

fn place(piece: usize, slot: usize) -> Action {
    Action::Place { piece, slot }
}

#[test]
fn parse_action_accepts_the_two_contracts_and_rejects_everything_else() {
    assert_eq!(parse_action(&json!({ "type": "place", "piece": 1, "slot": 2 })).unwrap(), place(1, 2));
    assert_eq!(parse_action(&json!({ "type": "move", "piece": 1, "x": -3.5, "y": 4 })).unwrap(), mv(1, -3.5, 4.0));
    for bad in [
        json!(null),
        json!([]),
        json!("x"),
        json!({}),
        json!({ "type": "fly" }),
        json!({ "type": "place", "piece": -1, "slot": 0 }),
        json!({ "type": "place", "piece": 1.5, "slot": 0 }),
        json!({ "type": "place", "piece": 1, "slot": 0, "extra": 1 }),
        json!({ "type": "move", "piece": 0, "x": "1", "y": 0 }),
    ] {
        assert_eq!(status(parse_action(&bad)), 400, "{bad}");
    }
}

#[test]
fn an_unknown_parent_has_no_service_and_a_bad_grid_cannot_start() {
    let registry = GameServiceRegistry::new();
    assert_eq!(status(registry.for_parent("chess")), 422);
    assert_eq!(status(registry.for_parent("scrambled").unwrap().start(&setup(0, 3, json!({})))), 422);
}

#[test]
fn next_pieces_panel_mistakes_and_solving() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("next-pieces").unwrap();
    let mut state = service.start(&setup(2, 2, json!({ "panelSize": 2, "order": "sequential" }))).unwrap();
    assert_eq!(state.queue, Some(vec![0, 1, 2, 3]));
    assert_eq!(state.visible, Some(2));
    assert_eq!(status(service.action(&state, &place(3, 3))), 409); // not in the panel
    assert_eq!(status(service.action(&state, &mv(0, 0.0, 0.0))), 400); // wrong action kind
    let wrong = service.action(&state, &place(0, 1)).unwrap();
    assert!(!wrong.correct);
    assert_eq!(wrong.state.mistakes, 1);
    assert_eq!(Value::Object(wrong.delta), json!({ "mistakes": 1 }));
    for piece in 0..4 {
        let result = service.action(&state, &place(piece, piece)).unwrap();
        assert!(result.correct);
        state = result.state;
    }
    assert!(state.solved);
    assert_eq!(status(service.action(&state, &place(0, 0))), 409); // already solved
}

#[test]
fn a_filled_slot_is_refused() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("next-pieces").unwrap();
    let state = service.start(&setup(2, 1, json!({ "panelSize": 2 }))).unwrap();
    let next = service.action(&state, &place(0, 0)).unwrap().state;
    assert_eq!(status(service.action(&next, &place(1, 0))), 409);
}

#[test]
fn last_x_leaves_exactly_x_pieces_and_the_same_seed_gives_the_same_game() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("last-x").unwrap();
    let config = json!({ "remaining": 3, "seed": 7 });
    let a = service.start(&setup(3, 3, config.clone())).unwrap();
    assert_eq!(a.queue.as_ref().unwrap().len(), 3);
    assert_eq!(a.placed.as_ref().unwrap().iter().filter(|p| !**p).count(), 3);
    assert_eq!(a, service.start(&setup(3, 3, config)).unwrap());
    let mut state = a.clone();
    for piece in a.queue.clone().unwrap() {
        state = service.action(&state, &place(piece, piece)).unwrap().state;
    }
    assert!(state.solved);
}

#[test]
fn scrambled_pieces_start_loose_snap_home_and_placed_pieces_are_locked() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("scrambled").unwrap();
    let start = service.start(&setup(3, 2, json!({ "seed": 5, "freeBuild": false }))).unwrap();
    assert_eq!(start.offsets.as_ref().unwrap().len(), 6);
    assert!(!start.solved);
    assert!(start.offsets.as_ref().unwrap().iter().all(|o| *o != HOME));
    assert_eq!(status(service.action(&start, &mv(9, 0.0, 0.0))), 409);
    assert_eq!(status(service.action(&start, &mv(0, 1e9, 0.0))), 409);
    assert_eq!(status(service.action(&start, &place(0, 0))), 400);

    let near = service.action(&start, &mv(0, 10.0, -10.0)).unwrap();
    assert!(near.correct);
    assert_eq!(near.state.offsets.as_ref().unwrap()[0], HOME);
    assert_eq!(near.delta["offsets"].as_object().unwrap().keys().collect::<Vec<_>>(), ["0"]);
    assert_eq!(status(service.action(&near.state, &mv(0, 50.0, 50.0))), 409);

    let far = service.action(&start, &mv(1, 500.0, 500.0)).unwrap();
    assert!(!far.correct);
    assert_eq!(far.state.offsets.as_ref().unwrap()[1], Offset { x: 500.0, y: 500.0 });

    let mut state = start;
    for i in 0..6 {
        state = service.action(&state, &mv(i, 0.0, 0.0)).unwrap().state;
    }
    assert!(state.solved);
}

#[test]
fn scrambled_free_build_moves_joined_pieces_together() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("scrambled").unwrap();
    let mut state = service.start(&setup(3, 1, json!({ "seed": 2, "freeBuild": true }))).unwrap();
    state = service.action(&state, &mv(1, 400.0, 400.0)).unwrap().state;
    state = service.action(&state, &mv(0, 405.0, 398.0)).unwrap().state;
    assert_eq!(state.offsets.as_ref().unwrap()[0], state.offsets.as_ref().unwrap()[1]); // piece 0 locked onto its neighbour
    let moved = service.action(&state, &mv(0, 300.0, 300.0)).unwrap();
    assert_eq!(moved.state.offsets.as_ref().unwrap()[0], Offset { x: 300.0, y: 300.0 });
    assert_eq!(moved.state.offsets.as_ref().unwrap()[1], Offset { x: 300.0, y: 300.0 });
}

#[test]
fn fold_state_replays_the_first_row_and_the_later_deltas() {
    let registry = GameServiceRegistry::new();
    let service = registry.for_parent("scrambled").unwrap();
    let start = service.start(&setup(2, 2, json!({ "seed": 3, "freeBuild": false }))).unwrap();
    let mut state: PuzzleState = start.clone();
    let mut rows = vec![start.to_json()];
    for action in [mv(0, 5.0, 5.0), mv(1, 400.0, 0.0)] {
        let result = service.action(&state, &action).unwrap();
        rows.push(Value::Object(result.delta));
        state = result.state;
    }
    assert_eq!(fold_state(&rows).unwrap(), state);
    assert_eq!(status(fold_state(&[])), 404);
}
