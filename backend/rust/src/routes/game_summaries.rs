use crate::services::game_summaries::GameSummariesService;
use axum::{extract::State, http::StatusCode, routing::get, Json, Router};
use serde_json::Value;
use std::sync::Arc;

pub fn router(service: Arc<GameSummariesService>) -> Router {
    Router::new().route("/api/games_summaries", get(list)).with_state(service)
}

async fn list(State(service): State<Arc<GameSummariesService>>) -> Result<Json<Value>, StatusCode> {
    let rows = service.read().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(Value::Array(rows.iter().map(|s| s.to_json()).collect())))
}
