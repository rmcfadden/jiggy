use crate::routes::auth::{require_auth, UserId};
use crate::services::email_confirmation::{ConfirmError, EmailConfirmationService};
use crate::services::tokens::TokenService;
use axum::{extract::State, http::StatusCode, middleware, routing::{get, post}, Extension, Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;

type Service = State<Arc<EmailConfirmationService>>;
type Failure = (StatusCode, Json<Value>);

/// POST /api/emails/confirm (public: the code is the credential); POST /api/emails/resend and GET /api/emails/status (signed in).
pub fn router(service: Arc<EmailConfirmationService>, tokens: Arc<TokenService>) -> Router {
    let resend = Router::new().route("/api/emails/resend", post(resend)).route("/api/emails/status", get(status)).route_layer(middleware::from_fn_with_state(tokens, require_auth));
    Router::new().route("/api/emails/confirm", post(confirm)).merge(resend).with_state(service)
}

fn fail(error: ConfirmError) -> Failure {
    match error {
        ConfirmError::Invalid => (StatusCode::BAD_REQUEST, Json(json!({ "error": "this confirmation link is invalid, expired or already used" }))),
        ConfirmError::NothingToConfirm => (StatusCode::CONFLICT, Json(json!({ "error": "there is no unconfirmed email on this account" }))),
        ConfirmError::TooSoon => (StatusCode::TOO_MANY_REQUESTS, Json(json!({ "error": "a confirmation email was sent a moment ago; please wait a minute" }))),
        ConfirmError::Internal(message) => {
            eprintln!("emails: {message}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "internal error" })))
        }
    }
}

async fn confirm(State(service): Service, Json(body): Json<Value>) -> Result<Json<Value>, Failure> {
    let Some(code) = body.get("code").and_then(Value::as_str).filter(|c| !c.trim().is_empty()) else {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "code is required" }))));
    };
    service.confirm(code).await.map_err(fail)?;
    Ok(Json(json!({ "confirmed": true })))
}

async fn resend(State(service): Service, Extension(UserId(user)): Extension<UserId>) -> Result<(StatusCode, Json<Value>), Failure> {
    service.resend(user).await.map_err(fail)?;
    Ok((StatusCode::ACCEPTED, Json(json!({ "sent": true }))))
}

async fn status(State(service): Service, Extension(UserId(user)): Extension<UserId>) -> Result<Json<Value>, Failure> {
    Ok(Json(match service.status(user).await.map_err(fail)? {
        Some((email, verified)) => json!({ "email": email, "verified": verified }),
        None => json!({ "email": null, "verified": false }),
    }))
}
