use serde_json::{json, Map, Value};

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
}

/// The full state of a play. Tray games (`next-pieces`, `last-x`) use `placed`, `queue`, `visible`; scrambled uses
/// `offsets`, each piece's distance from its solved position (0,0 means placed).
#[derive(Clone, Debug, PartialEq)]
pub struct PuzzleState {
    pub kind: String,
    pub cols: usize,
    pub rows: usize,
    pub total: usize,
    pub mistakes: u64,
    pub solved: bool,
    pub free_build: Option<bool>,
    pub placed: Option<Vec<bool>>,
    pub queue: Option<Vec<usize>>,
    pub visible: Option<usize>,
    pub offsets: Option<Vec<Offset>>,
}

impl PuzzleState {
    pub fn new(kind: &str, grid: &Grid) -> Self {
        Self { kind: kind.into(), cols: grid.cols, rows: grid.rows, total: grid.total, mistakes: 0, solved: false, free_build: None, placed: None, queue: None, visible: None, offsets: None }
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
        if let Some(v) = &self.placed { map.insert("placed".into(), json!(v)); }
        if let Some(v) = &self.queue { map.insert("queue".into(), json!(v)); }
        if let Some(v) = self.visible { map.insert("visible".into(), json!(v)); }
        if let Some(v) = &self.offsets { map.insert("offsets".into(), offsets_json(v)); }
        Value::Object(map)
    }

    /// Reads a state back from its JSON; 500 when a stored row is not a state this server wrote.
    pub fn from_json(value: &Value) -> GameResult<Self> {
        let bad = || GameError { status: 500, message: "stored game state is corrupt".into() };
        let uint = |key: &str| value.get(key).and_then(Value::as_u64).ok_or_else(bad);
        let list = |key: &str| value.get(key).and_then(Value::as_array);
        let offsets = match list("offsets") {
            None => None,
            Some(items) => Some(
                items
                    .iter()
                    .map(|o| Some(Offset { x: o.get("x")?.as_f64()?, y: o.get("y")?.as_f64()? }))
                    .collect::<Option<Vec<_>>>()
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
            placed: list("placed").map(|a| a.iter().map(|v| v.as_bool().unwrap_or(false)).collect()),
            queue: list("queue").map(|a| a.iter().filter_map(|v| v.as_u64().map(|n| n as usize)).collect()),
            visible: value.get("visible").and_then(Value::as_u64).map(|n| n as usize),
            offsets,
        })
    }
}

pub fn offsets_json(offsets: &[Offset]) -> Value {
    Value::Array(offsets.iter().map(|o| json!({ "x": o.x, "y": o.y })).collect())
}

/// A move a player asks for. Anything else is rejected before it reaches the rules.
#[derive(Clone, Debug, PartialEq)]
pub enum Action {
    Move { piece: usize, x: f64, y: f64 },
    Place { piece: usize, slot: usize },
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

/// What applying an action gives back: the new state, the delta to store and whether the move was correct.
pub struct ActionResult {
    pub state: PuzzleState,
    pub delta: Map<String, Value>,
    pub correct: bool,
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
    let finite = |name: &str| match raw.get(name).and_then(Value::as_f64) {
        Some(v) if v.is_finite() => Ok(v),
        _ => refuse(400, format!("{name} must be a finite number")),
    };
    match raw.get("type").and_then(Value::as_str) {
        Some("move") => {
            only(&["type", "piece", "x", "y"])?;
            Ok(Action::Move { piece: int("piece")?, x: finite("x")?, y: finite("y")? })
        }
        Some("place") => {
            only(&["type", "piece", "slot"])?;
            Ok(Action::Place { piece: int("piece")?, slot: int("slot")? })
        }
        _ => refuse(400, "type must be \"move\" or \"place\""),
    }
}
