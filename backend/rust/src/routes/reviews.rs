use crate::routes::auth::{require_auth, UserId};
use crate::services::reviews::{ReviewError, ReviewsService};
use crate::services::tokens::TokenService;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Extension, Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

type Service = State<Arc<ReviewsService>>;
type Failure = (StatusCode, Json<Value>);

/// Routes under /api/reviews: reading is public, posting a review is behind `require_auth`.
pub fn router(service: Arc<ReviewsService>, tokens: Arc<TokenService>) -> Router {
    let write = Router::new().route("/api/reviews", post(add)).route_layer(middleware::from_fn_with_state(tokens, require_auth));
    Router::new().route("/api/reviews", get(list)).merge(write).with_state(service)
}

fn fail(err: ReviewError) -> Failure {
    match err {
        ReviewError::Refused(status, message) => (StatusCode::from_u16(status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR), Json(json!({ "error": message }))),
        ReviewError::Internal(message) => {
            eprintln!("reviews: {message}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Value::Null))
        }
    }
}

async fn list(State(service): Service, Query(query): Query<std::collections::HashMap<String, String>>) -> Result<Json<Value>, Failure> {
    let game_id = query.get("game_id").and_then(|id| id.parse().ok());
    Ok(Json(service.list(game_id).await.map_err(fail)?))
}

async fn add(State(service): Service, Extension(UserId(user)): Extension<UserId>, Json(body): Json<Value>) -> Result<(StatusCode, Json<Value>), Failure> {
    let Some(game_id) = body.get("game_id").and_then(Value::as_i64) else {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "game_id must be an integer" }))));
    };
    Ok((StatusCode::CREATED, Json(service.add(game_id, user, &body).await.map_err(fail)?)))
}
