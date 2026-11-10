use crate::services::games::{GameError, GamesService};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

type Service = State<Arc<GamesService>>;
type Failure = (StatusCode, Json<Value>);
type Reply = Result<Json<Value>, Failure>;

pub fn router(service: Arc<GamesService>) -> Router {
    Router::new()
        .route("/api/games", get(list).post(create))
        .route("/api/games/{id}", get(read).put(update).delete(remove))
        .with_state(service)
}

fn fail(err: GameError) -> Failure {
    match err {
        GameError::Invalid(message) => (StatusCode::BAD_REQUEST, Json(json!({ "error": message }))),
        GameError::Datasource(err) => {
            eprintln!("games: {err:?}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Value::Null))
        }
    }
}

fn not_found() -> Failure {
    (StatusCode::NOT_FOUND, Json(Value::Null))
}

async fn list(State(service): Service) -> Reply {
    Ok(Json(Value::Array(service.list().await.map_err(fail)?)))
}

async fn read(State(service): Service, Path(id): Path<i64>) -> Reply {
    service.get(id).await.map_err(fail)?.map(Json).ok_or_else(not_found)
}

async fn create(State(service): Service, Json(body): Json<Value>) -> Result<(StatusCode, Json<Value>), Failure> {
    Ok((StatusCode::CREATED, Json(service.create(&body).await.map_err(fail)?)))
}

async fn update(State(service): Service, Path(id): Path<i64>, Json(body): Json<Value>) -> Reply {
    service.update(id, &body).await.map_err(fail)?.map(Json).ok_or_else(not_found)
}

async fn remove(State(service): Service, Path(id): Path<i64>) -> StatusCode {
    match service.delete(id).await {
        Ok(true) => StatusCode::NO_CONTENT,
        Ok(false) => StatusCode::NOT_FOUND,
        Err(err) => fail(err).0,
    }
}
