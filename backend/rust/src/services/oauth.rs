use crate::services::sessions::{CreateSession, SessionService};
use crate::services::jwt;
use crate::services::tokens::{AuthError, TokenService, TokenSettings, REFRESH_TOKEN_TYPE, SIGNIN_TOKEN_TYPE};
use crate::services::users::UsersService;
use serde_json::{json, Value};
use std::net::IpAddr;
use std::sync::Arc;

pub const TOKEN_EXCHANGE_GRANT: &str = "urn:ietf:params:oauth:grant-type:token-exchange";
pub const REFRESH_TOKEN_GRANT: &str = "refresh_token";
pub const ACCESS_TOKEN_URN: &str = "urn:ietf:params:oauth:token-type:access_token";

/// An RFC 6749 error response: `code` is the OAuth error, `description` the human text.
#[derive(Debug)]
pub enum OAuthError {
    InvalidRequest(String),
    InvalidGrant(String),
    UnsupportedGrantType(String),
    Server(AuthError),
}

impl From<AuthError> for OAuthError {
    fn from(error: AuthError) -> Self {
        OAuthError::Server(error)
    }
}

type Result<T> = std::result::Result<T, OAuthError>;

/// Token endpoint logic: RFC 8693 token exchange of a signin token, and the RFC 6749 refresh_token grant.
pub struct OAuthService {
    users: Arc<UsersService>,
    tokens: Arc<TokenService>,
    sessions: Arc<SessionService>,
    settings: TokenSettings,
}

impl OAuthService {
    pub fn new(users: Arc<UsersService>, tokens: Arc<TokenService>, sessions: Arc<SessionService>, settings: TokenSettings) -> Self {
        Self { users, tokens, sessions, settings }
    }

    pub async fn token(&self, params: &Value, ip: Option<IpAddr>) -> Result<Value> {
        let text = |key: &str| params.get(key).and_then(Value::as_str).unwrap_or("");
        let grant = text("grant_type");
        if grant.is_empty() {
            return Err(OAuthError::InvalidRequest("grant_type is required".into()));
        }
        if grant == REFRESH_TOKEN_GRANT {
            return self.refresh(text("refresh_token"), ip).await;
        }
        if grant != TOKEN_EXCHANGE_GRANT {
            return Err(OAuthError::UnsupportedGrantType(format!("grant_type must be {TOKEN_EXCHANGE_GRANT} or {REFRESH_TOKEN_GRANT}")));
        }
        let subject = text("subject_token");
        if subject.is_empty() {
            return Err(OAuthError::InvalidRequest("subject_token is required".into()));
        }
        // subject_token_type is optional here; when present it must name the kind of token we accept.
        let subject_type = text("subject_token_type");
        if !subject_type.is_empty() && subject_type != ACCESS_TOKEN_URN && subject_type != SIGNIN_TOKEN_TYPE {
            return Err(OAuthError::InvalidRequest("unsupported subject_token_type".into()));
        }

        let invalid = || OAuthError::InvalidGrant("subject_token is invalid, expired or already used".into());
        let row = self.tokens.validate(subject, SIGNIN_TOKEN_TYPE).await?.ok_or_else(invalid)?;
        let user_id = self.tokens.user_id_of(&row).await?.ok_or_else(invalid)?;
        let user = self.users.find_by_id(user_id).await.map_err(AuthError::from)?.filter(|u| u.is_enabled).ok_or_else(invalid)?;
        self.tokens.revoke(row).await?; // single use: a replay of the same signin token must fail

        let session = self
            .sessions
            .create(CreateSession { user_id: user.id, ip, relative_expiration: Some(self.settings.refresh_ttl as i32), ..Default::default() })
            .await?;
        let (user_uuid, session_uuid) = (user.uuid.to_string(), session.uuid.to_string());
        let access = self.tokens.issue_access(user.id, &user_uuid, &session_uuid).await?;
        let refresh = self.tokens.issue_refresh(user.id, &user_uuid, &session_uuid).await?;
        Ok(json!({
            "access_token": access.value,
            "issued_token_type": ACCESS_TOKEN_URN,
            "token_type": "Bearer",
            "expires_in": access.expires_in,
            "refresh_token": refresh.value,
        }))
    }

    /// Trades a live refresh token for a new access token and a new refresh token of the same session. The refresh
    /// token is single use (it is revoked here), and the session records a hit, which keeps it from lapsing while in use.
    async fn refresh(&self, refresh_token: &str, ip: Option<IpAddr>) -> Result<Value> {
        if refresh_token.is_empty() {
            return Err(OAuthError::InvalidRequest("refresh_token is required".into()));
        }
        let invalid = || OAuthError::InvalidGrant("refresh_token is invalid, expired or already used".into());
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs() as i64).unwrap_or(0);
        let claims = jwt::verify(refresh_token, &self.settings.jwt_secret, now).ok_or_else(invalid)?;
        let session_uuid = claims.get("sid").and_then(Value::as_str).ok_or_else(invalid)?.to_string();
        let row = self.tokens.validate(refresh_token, REFRESH_TOKEN_TYPE).await?.ok_or_else(invalid)?;
        let user_id = self.tokens.user_id_of(&row).await?.ok_or_else(invalid)?;
        let user = self.users.find_by_id(user_id).await.map_err(AuthError::from)?.filter(|u| u.is_enabled).ok_or_else(invalid)?;
        self.sessions.hit(&session_uuid, ip).await?.ok_or_else(invalid)?; // the session was signed out or lapsed
        self.tokens.revoke(row).await?;

        let user_uuid = user.uuid.to_string();
        let access = self.tokens.issue_access(user.id, &user_uuid, &session_uuid).await?;
        let refresh = self.tokens.issue_refresh(user.id, &user_uuid, &session_uuid).await?;
        Ok(json!({
            "access_token": access.value,
            "issued_token_type": ACCESS_TOKEN_URN,
            "token_type": "Bearer",
            "expires_in": access.expires_in,
            "refresh_token": refresh.value,
        }))
    }
}
