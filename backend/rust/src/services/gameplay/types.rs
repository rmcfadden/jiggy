use serde_json::{json, Map, Value};
use std::collections::HashMap;

/// A refused request; `status` is the HTTP status the API answers with.
#[derive(Debug)]
pub struct GameError {
    pub status: u16,
    pub message: String,
}

pub type GameResult<T> = Result<T, GameError>;

pub fn refuse<T>(status: u16, message: impl Into<String>) -> GameResult<T> {
    Err(GameError { status, message: message.into() })
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Offset {
    pub x: f64,
    pub y: f64,
}

pub const HOME: Offset = Offset { x: 0.0, y: 0.0 };

/// What a game needs to start: the template grid and the game's designer config (the `config.config` part).
pub struct GameSetup {
    pub cols: i64,
    pub rows: i64,
    pub config: Map<String, Value>,
}

impl GameSetup {
    pub fn number(&self, key: &str, default: f64) -> f64 {
        self.config.get(key).and_then(Value::as_f64).unwrap_or(default)
    }
}

pub struct Grid {
    pub cols: usize,
    pub rows: usize,
    pub total: usize,
    pub seed: u32,
    /// One fresh GUID per piece, row-major.
    pub guids: Vec<String>,
}

/// The full state of a play. `matrix[row][col]` is the GUID of the piece whose solved cell that is; GUIDs are random per
/// play, so a player cannot guess one. Scrambled games keep every piece's offset from its solved cell in `pieces` (0,0
/// means placed). Tray games (`next-pieces`, `last-x`) use `queue` (GUIDs still to place) and `visible`; a cell is filled once its piece has left the queue.
#[derive(Clone, Debug, PartialEq)]
pub struct PuzzleState {
    pub kind: String,
    pub cols: usize,
    pub rows: usize,
    pub total: usize,
    pub mistakes: u64,
    pub solved: bool,
    pub free_build: Option<bool>,
    pub matrix: Vec<Vec<String>>,
    pub pieces: Option<HashMap<String, Offset>>,
    pub queue: Option<Vec<String>>,
    pub visible: Option<usize>,
}

impl PuzzleState {
    pub fn new(kind: &str, grid: &Grid) -> Self {
        let matrix = grid.guids.chunks(grid.cols).map(<[String]>::to_vec).collect();
        Self { kind: kind.into(), cols: grid.cols, rows: grid.rows, total: grid.total, mistakes: 0, solved: false, free_build: None, matrix, pieces: None, queue: None, visible: None }
    }

    /// The piece GUIDs row-major: index `i` is the piece whose solved cell is `i`.
    pub fn guids(&self) -> Vec<&str> {
        self.matrix.iter().flatten().map(String::as_str).collect()
    }

    pub fn piece_indexes(&self) -> HashMap<&str, usize> {
        self.guids().into_iter().enumerate().map(|(i, g)| (g, i)).collect()
    }

    /// The pieces' offsets in row-major order, the shape the shared puzzle rules work on.
    pub fn offsets(&self) -> Vec<Offset> {
        self.guids().into_iter().map(|g| self.pieces.as_ref().and_then(|p| p.get(g)).copied().unwrap_or(HOME)).collect()
    }

    /// Applies events to a copy of the state. This is the one place state changes are defined, for live play and replay alike.
    pub fn apply(&self, events: &[StateEvent]) -> GameResult<PuzzleState> {
        let mut next = self.clone();
        let index: HashMap<String, usize> = self.piece_indexes().into_iter().map(|(g, i)| (g.to_string(), i)).collect();
        for event in events {
            for guid in event.pieces() {
                if !index.contains_key(guid) { return refuse(409, format!("there is no piece {guid}"));
                }
                match event {
                    StateEvent::Added { .. } => {
                        if let Some(p) = next.pieces.as_mut() { p.insert(guid.clone(), HOME); }
                        if let Some(q) = next.queue.as_mut() { q.retain(|g| g != guid); }
                    }
                    StateEvent::Moved { x, y, .. } | StateEvent::Joined { x, y, .. } => {
                        if let Some(p) = next.pieces.as_mut() { p.insert(guid.clone(), Offset { x: *x, y: *y }); }
                    }
                }
            }
        }
        Ok(next)
    }

    pub fn to_json(&self) -> Value {
        let mut map = Map::new();
        map.insert("type".into(), json!(self.kind));
        map.insert("cols".into(), json!(self.cols));
        map.insert("rows".into(), json!(self.rows));
        map.insert("total".into(), json!(self.total));
        map.insert("mistakes".into(), json!(self.mistakes));
        map.insert("solved".into(), json!(self.solved));
        if let Some(v) = self.free_build { map.insert("freeBuild".into(), json!(v)); }
        map.insert("matrix".into(), json!(self.matrix));
        if let Some(pieces) = &self.pieces {
            map.insert("pieces".into(), Value::Object(pieces.iter().map(|(g, o)| (g.clone(), json!({ "x": o.x, "y": o.y }))).collect()));
        }
        if let Some(v) = &self.queue { map.insert("queue".into(), json!(v)); }
        if let Some(v) = self.visible { map.insert("visible".into(), json!(v)); }
        Value::Object(map)
    }

    /// Reads a state back from its JSON; 409 for a play stored before GUIDs, 500 when a row is not a state this server wrote.
    pub fn from_json(value: &Value) -> GameResult<Self> {
        if value.get("matrix").is_none() {
            return refuse(409, "the play was stored in an old format");
        }
        let bad = || GameError { status: 500, message: "stored game state is corrupt".into() };
        let uint = |key: &str| value.get(key).and_then(Value::as_u64).ok_or_else(bad);
        let list = |key: &str| value.get(key).and_then(Value::as_array);
        let text = |v: &Value| v.as_str().map(str::to_string);
        let matrix = value["matrix"]
            .as_array()
            .and_then(|rows| rows.iter().map(|r| r.as_array()?.iter().map(text).collect::<Option<Vec<_>>>()).collect::<Option<Vec<_>>>())
            .ok_or_else(bad)?;
        let pieces = match value.get("pieces").and_then(Value::as_object) {
            None => None,
            Some(map) => Some(
                map.iter()
                    .map(|(g, o)| Some((g.clone(), Offset { x: o.get("x")?.as_f64()?, y: o.get("y")?.as_f64()? })))
                    .collect::<Option<HashMap<_, _>>>()
                    .ok_or_else(bad)?,
            ),
        };
        Ok(Self {
            kind: value.get("type").and_then(Value::as_str).ok_or_else(bad)?.to_string(),
            cols: uint("cols")? as usize,
            rows: uint("rows")? as usize,
            total: uint("total")? as usize,
            mistakes: uint("mistakes")?,
            solved: value.get("solved").and_then(Value::as_bool).ok_or_else(bad)?,
            free_build: value.get("freeBuild").and_then(Value::as_bool),
            matrix,
            pieces,
            queue: list("queue").map(|a| a.iter().filter_map(text).collect()),
            visible: value.get("visible").and_then(Value::as_u64).map(|n| n as usize),
        })
    }
}

/// A change to the state. Each names every piece it affects, because joined pieces move as one.
#[derive(Clone, Debug, PartialEq)]
pub enum StateEvent {
    /// The pieces are at a new coordinate: the final, settled position, never the raw drop.
    Moved { pieces: Vec<String>, x: f64, y: f64 },
    /// The pieces entered the puzzle at their solved cell.
    Added { pieces: Vec<String> },
    /// These pieces now sit together as one group at (x, y).
    Joined { pieces: Vec<String>, x: f64, y: f64 },
}

impl StateEvent {
    pub fn pieces(&self) -> &[String] {
        match self {
            StateEvent::Moved { pieces, .. } | StateEvent::Added { pieces } | StateEvent::Joined { pieces, .. } => pieces,
        }
    }

    pub fn to_json(&self) -> Value {
        match self {
            StateEvent::Moved { pieces, x, y } => json!({ "type": "pieces_moved", "pieces": pieces, "x": x, "y": y }),
            StateEvent::Added { pieces } => json!({ "type": "pieces_added", "pieces": pieces }),
            StateEvent::Joined { pieces, x, y } => json!({ "type": "pieces_joined", "pieces": pieces, "x": x, "y": y }),
        }
    }

    pub fn from_json(value: &Value) -> GameResult<Self> {
        let bad = || GameError { status: 500, message: "stored game state is corrupt".into() };
        let pieces: Vec<String> = value["pieces"].as_array().ok_or_else(bad)?.iter().map(|p| p.as_str().map(str::to_string)).collect::<Option<_>>().ok_or_else(bad)?;
        let xy = || Some((value.get("x")?.as_f64()?, value.get("y")?.as_f64()?));
        match value["type"].as_str() {
            Some("pieces_moved") => xy().map(|(x, y)| StateEvent::Moved { pieces, x, y }).ok_or_else(bad),
            Some("pieces_added") => Ok(StateEvent::Added { pieces }),
            Some("pieces_joined") => xy().map(|(x, y)| StateEvent::Joined { pieces, x, y }).ok_or_else(bad),
            _ => Err(bad()),
        }
    }
}

/// A move a player asks for. Anything else is rejected before it reaches the rules.
#[derive(Clone, Debug, PartialEq)]
pub enum Action {
    Move { piece: String, x: f64, y: f64 },
    Place { piece: String, slot: usize },
}

impl Action {
    pub fn kind(&self) -> &'static str {
        match self {
            Action::Move { .. } => "move",
            Action::Place { .. } => "place",
        }
    }

    pub fn to_json(&self) -> Value {
        match self {
            Action::Move { piece, x, y } => json!({ "type": "move", "piece": piece, "x": x, "y": y }),
            Action::Place { piece, slot } => json!({ "type": "place", "piece": piece, "slot": slot }),
        }
    }
}

/// `placed`: pieces went into their solved cell. `moved`: pieces moved (maybe joined). `denied`: a legal try that failed (a wrong slot).
pub mod move_result {
    pub const MOVED: &str = "moved";
    pub const PLACED: &str = "placed";
    pub const DENIED: &str = "denied";
}

/// What applying an action gives back: the new state, the events to store, the outcome and whether the move was correct.
pub struct ActionResult {
    pub state: PuzzleState,
    pub events: Vec<StateEvent>,
    pub result: &'static str,
    pub correct: bool,
    pub reason: Option<String>,
}

/// One stored state row after the first: the events plus the counters they leave behind.
pub fn state_row(result: &ActionResult) -> Value {
    json!({ "events": result.events.iter().map(StateEvent::to_json).collect::<Vec<_>>(), "mistakes": result.state.mistakes, "solved": result.state.solved })
}

/// A GUID in its canonical 8-4-4-4-12 form, lower-cased; `None` for anything else.
fn parse_guid(text: &str) -> Option<String> {
    let ok = text.len() == 36 && text.char_indices().all(|(i, c)| if matches!(i, 8 | 13 | 18 | 23) { c == '-' } else { c.is_ascii_hexdigit() });
    ok.then(|| text.to_ascii_lowercase())
}

/// Parses an untrusted body into an [`Action`]; 400 for unknown types, extra fields or bad values.
pub fn parse_action(body: &Value) -> GameResult<Action> {
    let Some(raw) = body.as_object() else { return refuse(400, "action must be a JSON object") };
    let only = |allowed: &[&str]| match raw.keys().find(|k| !allowed.contains(&k.as_str())) {
        Some(extra) => refuse(400, format!("unknown field: {extra}")),
        None => Ok(()),
    };
    let int = |name: &str| match raw.get(name).and_then(Value::as_u64) {
        Some(v) => Ok(v as usize),
        None => refuse(400, format!("{name} must be a non-negative integer")),
    };
    let guid = |name: &str| match raw.get(name).and_then(Value::as_str).and_then(parse_guid) {
        Some(v) => Ok(v),
        None => refuse(400, format!("{name} must be a piece GUID")),
    };
    let finite = |name: &str| match raw.get(name).and_then(Value::as_f64) {
        Some(v) if v.is_finite() => Ok(v),
        _ => refuse(400, format!("{name} must be a finite number")),
    };
    match raw.get("type").and_then(Value::as_str) {
        Some("move") => {
            only(&["type", "piece", "x", "y"])?;
            Ok(Action::Move { piece: guid("piece")?, x: finite("x")?, y: finite("y")? })
        }
        Some("place") => {
            only(&["type", "piece", "slot"])?;
            Ok(Action::Place { piece: guid("piece")?, slot: int("slot")? })
        }
        _ => refuse(400, "type must be \"move\" or \"place\""),
    }
}
