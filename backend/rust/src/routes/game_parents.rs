use crate::services::game_parents::GameParentsService;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::Value;
use std::sync::Arc;

type Service = State<Arc<GameParentsService>>;
type Reply = Result<Json<Value>, StatusCode>;

pub fn router(service: Arc<GameParentsService>) -> Router {
    Router::new()
        .route("/api/games_parents", get(list).post(create))
        .route("/api/games_parents/{id}", get(read).put(update).delete(remove))
        .with_state(service)
}

fn fail<E>(_: E) -> StatusCode {
    StatusCode::INTERNAL_SERVER_ERROR
}

async fn list(State(service): Service) -> Reply {
    Ok(Json(Value::Array(service.list().await.map_err(fail)?)))
}

async fn read(State(service): Service, Path(id): Path<i64>) -> Reply {
    service.get(id).await.map_err(fail)?.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn create(State(service): Service, Json(body): Json<Value>) -> Result<(StatusCode, Json<Value>), StatusCode> {
    Ok((StatusCode::CREATED, Json(service.create(&body).await.map_err(fail)?)))
}

async fn update(State(service): Service, Path(id): Path<i64>, Json(body): Json<Value>) -> Reply {
    service.update(id, &body).await.map_err(fail)?.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn remove(State(service): Service, Path(id): Path<i64>) -> StatusCode {
    match service.delete(id).await {
        Ok(true) => StatusCode::NO_CONTENT,
        Ok(false) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}
