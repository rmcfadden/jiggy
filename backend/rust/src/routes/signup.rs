use crate::services::signup::{SignupError, SignupInput, SignupService};
use axum::{extract::State, http::{header, StatusCode}, response::IntoResponse, routing::post, Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;

pub fn router(service: Arc<SignupService>) -> Router {
    Router::new().route("/api/signup", post(signup)).with_state(service)
}

async fn signup(State(service): State<Arc<SignupService>>, Json(body): Json<Value>) -> impl IntoResponse {
    let no_store = [(header::CACHE_CONTROL, "no-store")];
    // Absent or null is fine for username/email; anything else must be a string.
    let optional = |key: &str| match body.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(Value::String(value)) => Ok(Some(value.clone())),
        Some(_) => Err(()),
    };
    let password = body.get("password").and_then(Value::as_str).filter(|p| !p.is_empty());
    let (Some(password), Ok(username), Ok(email)) = (password, optional("username"), optional("email")) else {
        return (StatusCode::BAD_REQUEST, no_store, Json(json!({ "error": "password is required; username and email must be strings" })));
    };
    match service.signup(SignupInput { username, email, password: password.to_string() }).await {
        Ok(result) => (
            StatusCode::CREATED,
            no_store,
            Json(json!({ "username": result.username, "signin_token": result.signin.value, "expires_in": result.signin.expires_in })),
        ),
        Err(SignupError::Invalid(message)) => (StatusCode::BAD_REQUEST, no_store, Json(json!({ "error": message }))),
        Err(SignupError::Conflict(message)) => (StatusCode::CONFLICT, no_store, Json(json!({ "error": message }))),
        Err(SignupError::Internal(message)) => {
            eprintln!("signup: {message}");
            (StatusCode::INTERNAL_SERVER_ERROR, no_store, Json(json!({ "error": "internal error" })))
        }
    }
}
