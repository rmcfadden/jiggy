use crate::services::games::{GameError, GamesService};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::Value;
use std::sync::Arc;

type Service = State<Arc<GamesService>>;
type Reply = Result<Json<Value>, StatusCode>;

/// Puzzles by the slug of their name, public like the rest of the catalog.
pub fn router(service: Arc<GamesService>) -> Router {
    Router::new().route("/api/puzzles/{name}", get(read)).route("/api/category/{name}/puzzles", get(in_category)).with_state(service)
}

fn fail(err: GameError) -> StatusCode {
    eprintln!("puzzles: {err:?}");
    StatusCode::INTERNAL_SERVER_ERROR
}

async fn read(State(service): Service, Path(name): Path<String>) -> Reply {
    service.get_by_name(&name).await.map_err(fail)?.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn in_category(State(service): Service, Path(name): Path<String>) -> Reply {
    service.list_by_category_name(&name).await.map_err(fail)?.map(|list| Json(Value::Array(list))).ok_or(StatusCode::NOT_FOUND)
}
