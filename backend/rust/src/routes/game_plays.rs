use crate::routes::auth::{require_auth, UserId};
use crate::services::game_plays::{GamePlaysService, PlayError};
use crate::services::tokens::TokenService;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Extension, Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

type Service = State<Arc<GamePlaysService>>;
type Failure = (StatusCode, Json<Value>);
type Reply = Result<Json<Value>, Failure>;

/// Routes under /api/game_plays, all behind `require_auth`.
pub fn router(service: Arc<GamePlaysService>, tokens: Arc<TokenService>) -> Router {
    Router::new()
        .route("/api/game_plays", post(start).get(unfinished))
        .route("/api/game_plays/{id}/action", post(action))
        .route("/api/game_plays/{id}/state", get(state))
        .route("/api/game_plays/{id}/actions", get(actions))
        .route("/api/game_plays/{id}/finish", post(finish))
        .with_state(service)
        .route_layer(middleware::from_fn_with_state(tokens, require_auth))
}

fn fail(err: PlayError) -> Failure {
    match err {
        PlayError::Game(err) => (StatusCode::from_u16(err.status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR), Json(json!({ "error": err.message }))),
        PlayError::Internal(message) => {
            eprintln!("game_plays: {message}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Value::Null))
        }
    }
}

async fn start(State(service): Service, Extension(UserId(user)): Extension<UserId>, Json(body): Json<Value>) -> Result<(StatusCode, Json<Value>), Failure> {
    let Some(game_id) = body.get("game_id").and_then(Value::as_i64) else {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "game_id must be an integer" }))));
    };
    Ok((StatusCode::CREATED, Json(service.start(game_id, user).await.map_err(fail)?)))
}

async fn unfinished(State(service): Service, Extension(UserId(user)): Extension<UserId>, Query(query): Query<std::collections::HashMap<String, String>>) -> Reply {
    let finished = match query.get("finished").map(String::as_str) {
        Some("true") => true,
        Some("false") => false,
        _ => return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "finished must be true or false" })))),
    };
    Ok(Json(service.list(user, finished).await.map_err(fail)?))
}

async fn action(State(service): Service, Extension(UserId(user)): Extension<UserId>, Path(id): Path<i64>, Json(body): Json<Value>) -> Reply {
    Ok(Json(service.action(id, user, &body).await.map_err(fail)?))
}

async fn state(State(service): Service, Extension(UserId(user)): Extension<UserId>, Path(id): Path<i64>) -> Reply {
    Ok(Json(service.state(id, user).await.map_err(fail)?))
}

async fn actions(State(service): Service, Extension(UserId(user)): Extension<UserId>, Path(id): Path<i64>) -> Reply {
    Ok(Json(service.action_list(id, user).await.map_err(fail)?))
}

async fn finish(State(service): Service, Extension(UserId(user)): Extension<UserId>, Path(id): Path<i64>) -> Reply {
    Ok(Json(service.finish(id, user).await.map_err(fail)?))
}
