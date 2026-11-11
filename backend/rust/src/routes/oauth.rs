use crate::services::oauth::{OAuthError, OAuthService};
use axum::{
    body::Bytes,
    extract::{ConnectInfo, State},
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde_json::{json, Map, Value};
use std::{net::SocketAddr, sync::Arc};

pub fn router(service: Arc<OAuthService>) -> Router {
    Router::new().route("/api/oauth/token", post(token)).with_state(service)
}

/// RFC 6749 requests are form-encoded; JSON is accepted too.
fn parse_body(headers: &HeaderMap, body: &Bytes) -> Value {
    let is_json = headers.get(header::CONTENT_TYPE).and_then(|v| v.to_str().ok()).is_some_and(|v| v.starts_with("application/json"));
    if is_json {
        return serde_json::from_slice(body).unwrap_or(Value::Null);
    }
    let mut map = Map::new();
    for pair in String::from_utf8_lossy(body).split('&').filter(|p| !p.is_empty()) {
        let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
        map.insert(decode(key), Value::String(decode(value)));
    }
    Value::Object(map)
}

/// Percent-decoding for application/x-www-form-urlencoded (`+` is a space).
fn decode(text: &str) -> String {
    let bytes = text.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => out.push(b' '),
            b'%' if i + 2 < bytes.len() && bytes[i + 1].is_ascii_hexdigit() && bytes[i + 2].is_ascii_hexdigit() => {
                out.push(u8::from_str_radix(&text[i + 1..i + 3], 16).unwrap());
                i += 2;
            }
            b => out.push(b),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

async fn token(State(service): State<Arc<OAuthService>>, ConnectInfo(addr): ConnectInfo<SocketAddr>, headers: HeaderMap, body: Bytes) -> impl IntoResponse {
    let no_store = || [(header::CACHE_CONTROL, "no-store"), (header::PRAGMA, "no-cache")];
    let error = |status: StatusCode, code: &str, description: &str| (status, no_store(), Json(json!({ "error": code, "error_description": description })));
    match service.token(&parse_body(&headers, &body), Some(addr.ip())).await {
        Ok(response) => (StatusCode::OK, no_store(), Json(response)),
        Err(OAuthError::InvalidRequest(d)) => error(StatusCode::BAD_REQUEST, "invalid_request", &d),
        Err(OAuthError::InvalidGrant(d)) => error(StatusCode::BAD_REQUEST, "invalid_grant", &d),
        Err(OAuthError::UnsupportedGrantType(d)) => error(StatusCode::BAD_REQUEST, "unsupported_grant_type", &d),
        Err(OAuthError::Server(e)) => {
            eprintln!("oauth: {e}");
            (StatusCode::INTERNAL_SERVER_ERROR, no_store(), Json(json!({ "error": "server_error" })))
        }
    }
}
