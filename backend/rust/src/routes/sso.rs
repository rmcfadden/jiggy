use crate::routes::auth::{require_auth, UserId};
use crate::services::tokens::TokenService;
use crate::services::sso::{encode, safe_path, SsoError, SsoService, COOKIE_NAME};
use axum::{
    extract::{Path, Query, State},
    middleware,
    Extension,
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;

pub fn router(service: Arc<SsoService>, tokens: Arc<TokenService>) -> Router {
    let me = Router::new().route("/api/me", get(me)).route_layer(middleware::from_fn_with_state(tokens, require_auth));
    Router::new()
        .merge(me)
        .route("/api/identity-providers", get(list))
        .route("/api/identity-providers/{name}/authorize", get(authorize))
        .route("/api/identity-providers/{name}/callback", get(callback))
        .with_state(service)
}

#[derive(Deserialize)]
struct AuthorizeQuery {
    from: Option<String>,
}

#[derive(Deserialize)]
struct CallbackQuery {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
    error_description: Option<String>,
}

fn redirect(location: &str, cookie: Option<String>) -> Response {
    let mut response = (StatusCode::FOUND, [(header::LOCATION, location.to_string()), (header::CACHE_CONTROL, "no-store".to_string())]).into_response();
    if let Some(cookie) = cookie.and_then(|c| HeaderValue::from_str(&c).ok()) {
        response.headers_mut().append(header::SET_COOKIE, cookie);
    }
    response
}

fn cookie(value: &str, max_age: u32, secure: bool) -> String {
    format!("{COOKIE_NAME}={value}; HttpOnly; SameSite=Lax; Path=/api/identity-providers; Max-Age={max_age}{}", if secure { "; Secure" } else { "" })
}

fn read_cookie(headers: &HeaderMap) -> Option<String> {
    let all = headers.get(header::COOKIE)?.to_str().ok()?;
    all.split(';').filter_map(|p| p.trim().split_once('=')).find(|(k, _)| *k == COOKIE_NAME).map(|(_, v)| v.to_string())
}

fn plain(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "error": message }))).into_response()
}

fn internal(context: &str, message: &str) -> Response {
    eprintln!("sso {context}: {message}");
    plain(StatusCode::INTERNAL_SERVER_ERROR, "internal error")
}

async fn list(State(service): State<Arc<SsoService>>) -> Response {
    match service.list().await {
        Ok(providers) => {
            let body: Vec<_> = providers.into_iter().map(|p| json!({ "name": p.name, "displayName": p.display_name, "imageUrl": p.image_url })).collect();
            Json(body).into_response()
        }
        Err(error) => internal("list", &format!("{error:?}")),
    }
}

async fn authorize(State(service): State<Arc<SsoService>>, Path(name): Path<String>, Query(query): Query<AuthorizeQuery>) -> Response {
    match service.authorize(&name, query.from.as_deref()).await {
        Ok(r) => redirect(&r.url, Some(cookie(&r.verifier, 600, r.secure))),
        Err(SsoError::NotFound) => plain(StatusCode::NOT_FOUND, "unknown identity provider"),
        Err(error) => internal("authorize", &format!("{error:?}")),
    }
}

/// Always ends in a redirect to the site: to /sso/callback with the signin token, or to /signin with an error message.
async fn callback(State(service): State<Arc<SsoService>>, Path(name): Path<String>, Query(query): Query<CallbackQuery>, headers: HeaderMap) -> Response {
    let Some(base) = service.site_base(&name).await else { return plain(StatusCode::NOT_FOUND, "unknown identity provider") };
    let clear = Some(cookie("", 0, base.starts_with("https://")));
    let fail = |message: &str| redirect(&format!("{base}/signin?sso_error={}", encode(message)), clear.clone());

    if let Some(error) = &query.error {
        let reason = query.error_description.as_deref().unwrap_or(error);
        return fail(if error == "access_denied" { "sign-in was cancelled" } else { reason });
    }
    let (Some(code), Some(state)) = (query.code.as_deref().filter(|c| !c.is_empty()), query.state.as_deref().filter(|s| !s.is_empty())) else {
        return fail("the provider sent no sign-in code");
    };
    match service.callback(&name, code, state, read_cookie(&headers).as_deref()).await {
        Ok(done) => {
            let mut fragment = format!("signin_token={}&username={}", encode(&done.signin.value), encode(&done.username));
            if let Some(from) = done.from.as_deref().filter(|f| safe_path(f)) {
                fragment.push_str(&format!("&from={}", encode(from)));
            }
            redirect(&format!("{base}/sso/callback#{fragment}"), clear)
        }
        Err(SsoError::Failed(message)) => fail(&message),
        Err(SsoError::NotFound) => plain(StatusCode::NOT_FOUND, "unknown identity provider"),
        Err(SsoError::Internal(message)) => {
            eprintln!("sso callback: {message}");
            fail("something went wrong signing you in; please try again")
        }
    }
}

/// The signed-in user's profile settings the frontend needs (for now the avatar URL, null when there is none).
async fn me(State(service): State<Arc<SsoService>>, Extension(UserId(user)): Extension<UserId>) -> Response {
    match service.avatar(user).await {
        Ok(avatar) => Json(json!({ "avatar": avatar })).into_response(),
        Err(error) => internal("me", &format!("{error:?}")),
    }
}
