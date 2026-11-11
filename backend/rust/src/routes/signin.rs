use crate::services::signin::SigninService;
use axum::{extract::State, http::{header, StatusCode}, response::IntoResponse, routing::post, Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;

pub fn router(service: Arc<SigninService>) -> Router {
    Router::new().route("/api/signin", post(signin)).with_state(service)
}

async fn signin(State(service): State<Arc<SigninService>>, Json(body): Json<Value>) -> impl IntoResponse {
    let no_store = [(header::CACHE_CONTROL, "no-store")];
    let field = |key: &str| body.get(key).and_then(Value::as_str).filter(|v| !v.is_empty());
    let (Some(username), Some(password)) = (field("username"), field("password")) else {
        return (StatusCode::BAD_REQUEST, no_store, Json(json!({ "error": "username and password are required" })));
    };
    match service.signin(username, password).await {
        Ok(Some(issued)) => (StatusCode::OK, no_store, Json(json!({ "signin_token": issued.value, "expires_in": issued.expires_in }))),
        Ok(None) => (StatusCode::UNAUTHORIZED, no_store, Json(json!({ "error": "invalid username or password" }))),
        Err(error) => {
            eprintln!("signin: {error}");
            (StatusCode::INTERNAL_SERVER_ERROR, no_store, Json(json!({ "error": "internal error" })))
        }
    }
}
