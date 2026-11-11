use crate::services::sessions::{CreateSession, SessionService};
use crate::services::tokens::{AuthError, TokenService, TokenSettings, SIGNIN_TOKEN_TYPE};
use crate::services::users::UsersService;
use serde_json::{json, Value};
use std::net::IpAddr;
use std::sync::Arc;

pub const TOKEN_EXCHANGE_GRANT: &str = "urn:ietf:params:oauth:grant-type:token-exchange";
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

/// Token endpoint logic. Only RFC 8693 token exchange of a signin token is supported.
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
        if grant != TOKEN_EXCHANGE_GRANT {
            return Err(OAuthError::UnsupportedGrantType(format!("grant_type must be {TOKEN_EXCHANGE_GRANT}")));
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
}
