use crate::services::categories::CategoriesService;
use axum::{extract::State, http::StatusCode, routing::get, Json, Router};
use serde_json::Value;
use std::sync::Arc;

pub fn router(service: Arc<CategoriesService>) -> Router {
    Router::new().route("/api/categories", get(list)).with_state(service)
}

async fn list(State(service): State<Arc<CategoriesService>>) -> Result<Json<Value>, StatusCode> {
    let tree = service.tree().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(Value::Array(tree)))
}
