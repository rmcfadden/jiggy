use crate::services::tokens::{TokenService, ACCESS_TOKEN_TYPE};
use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::sync::Arc;

/// The signed-in user, put in the request extensions by [`require_auth`].
#[derive(Clone, Copy, Debug)]
pub struct UserId(pub i64);

/// Requires `Authorization: Bearer <access token>` (the JWT from /api/oauth/token). On success the user's id is in the
/// request extensions; otherwise the request is answered 401 and never reaches the route.
pub async fn require_auth(State(tokens): State<Arc<TokenService>>, mut request: Request, next: Next) -> Response {
    let header_value = request.headers().get(header::AUTHORIZATION).and_then(|v| v.to_str().ok()).unwrap_or_default();
    let bearer = header_value.split_once(' ').filter(|(scheme, token)| scheme.eq_ignore_ascii_case("bearer") && !token.trim().is_empty()).map(|(_, token)| token.trim());
    let unauthorized = || (StatusCode::UNAUTHORIZED, [(header::WWW_AUTHENTICATE, "Bearer")], Json(json!({ "error": "a valid access token is required" }))).into_response();
    let Some(token) = bearer else { return unauthorized() };
    let row = match tokens.validate(token, ACCESS_TOKEN_TYPE).await {
        Ok(Some(row)) => row,
        Ok(None) => return unauthorized(),
        Err(err) => {
            eprintln!("auth: {err}");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    match tokens.user_id_of(&row).await {
        Ok(Some(user_id)) => {
            request.extensions_mut().insert(UserId(user_id));
            next.run(request).await
        }
        Ok(None) => unauthorized(),
        Err(err) => {
            eprintln!("auth: {err}");
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}
