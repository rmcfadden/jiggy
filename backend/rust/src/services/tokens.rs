use crate::generated::repositories::tokenTypesRepository::TokenTypesRepository;
use crate::generated::repositories::tokensRepository::TokensRepository;
use crate::generated::repositories::emailTokensRepository::EmailTokensRepository;
use crate::generated::repositories::userTokensRepository::UserTokensRepository;
use crate::generated::{EmailToken, Token, TokenType, UserToken};
use crate::services::jwt;
use crate::services::users::UserError;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use datasources::chrono::{Duration, Utc};
use datasources::uuid::Uuid;
use futures_util::TryStreamExt;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::sync::Arc;

pub const SIGNIN_TOKEN_TYPE: &str = "signin_token";
pub const ACCESS_TOKEN_TYPE: &str = "jwt_access_token";
pub const REFRESH_TOKEN_TYPE: &str = "jwt_refresh_token";
pub const EMAIL_CONFIRMATION_TOKEN_TYPE: &str = "email_confirmation";

/// A datasource failure, or a bad request/record (`Invalid`).
#[derive(Debug)]
pub enum AuthError {
    Invalid(String),
    Datasource(datasources::DatasourceError),
}

impl std::fmt::Display for AuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::Invalid(message) => write!(f, "{message}"),
            AuthError::Datasource(error) => write!(f, "{error}"),
        }
    }
}

impl From<datasources::DatasourceError> for AuthError {
    fn from(error: datasources::DatasourceError) -> Self {
        AuthError::Datasource(error)
    }
}

impl From<UserError> for AuthError {
    fn from(error: UserError) -> Self {
        match error {
            UserError::Invalid(message) | UserError::Exists(message) => AuthError::Invalid(message),
            UserError::Datasource(error) => AuthError::Datasource(error),
        }
    }
}

pub type Result<T> = std::result::Result<T, AuthError>;

/// JWT_SECRET (required, 32+ characters) and the optional TTLs in seconds (EMAIL_CONFIRMATION_TTL defaults to 24 hours).
#[derive(Clone)]
pub struct TokenSettings {
    pub jwt_secret: String,
    pub signin_ttl: i64,
    pub access_ttl: i64,
    pub refresh_ttl: i64,
    pub email_confirmation_ttl: i64,
}

impl TokenSettings {
    /// Reads the environment, falling back to `.env` then `.env.development` (test-only dev defaults, skipped in production)
    /// in the working directory. The real environment wins, then `.env`.
    pub fn from_env() -> std::result::Result<Self, String> {
        let get = crate::services::config::lookup();
        let jwt_secret = get("JWT_SECRET").filter(|s| s.len() >= 32).ok_or("JWT_SECRET must be set to at least 32 characters")?;
        let seconds = |key: &str, default: i64| get(key).and_then(|v| v.parse().ok()).unwrap_or(default);
        Ok(Self { jwt_secret, signin_ttl: seconds("SIGNIN_TOKEN_TTL", 300), access_ttl: seconds("JWT_ACCESS_TTL", 86_400), refresh_ttl: seconds("JWT_REFRESH_TTL", 86_400), email_confirmation_ttl: seconds("EMAIL_CONFIRMATION_TTL", 86_400) })
    }
}

pub struct IssuedToken {
    pub value: String,
    pub expires_in: i64,
}

fn sha256(value: &str) -> String {
    Sha256::digest(value.as_bytes()).iter().map(|b| format!("{b:02x}")).collect()
}

/// Issues, validates and revokes signin, JWT access and JWT refresh tokens. Only a SHA-256 hash of each token is stored.
pub struct TokenService {
    tokens: Arc<TokensRepository>,
    user_tokens: Arc<UserTokensRepository>,
    email_tokens: Arc<EmailTokensRepository>,
    token_types: Arc<TokenTypesRepository>,
    settings: TokenSettings,
}

impl TokenService {
    pub fn new(tokens: Arc<TokensRepository>, user_tokens: Arc<UserTokensRepository>, email_tokens: Arc<EmailTokensRepository>, token_types: Arc<TokenTypesRepository>, settings: TokenSettings) -> Self {
        Self { tokens, user_tokens, email_tokens, token_types, settings }
    }

    /// Short-lived, single-use opaque token handed back by signin and exchanged at /api/oauth/token.
    pub async fn issue_signin(&self, user_id: i64) -> Result<IssuedToken> {
        let mut bytes = Uuid::new_v4().as_bytes().to_vec();
        bytes.extend_from_slice(Uuid::new_v4().as_bytes());
        self.store(user_id, SIGNIN_TOKEN_TYPE, format!("signin:{}", Uuid::new_v4()), URL_SAFE_NO_PAD.encode(bytes), self.settings.signin_ttl).await
    }

    /// A long random code for the link in a confirmation email, tied to the user and to the email it confirms.
    /// Only its hash is stored; it expires after EMAIL_CONFIRMATION_TTL and works once (see [`Self::revoke`]).
    pub async fn issue_email_confirmation(&self, user_id: i64, email_id: i64) -> Result<IssuedToken> {
        let mut bytes = Uuid::new_v4().as_bytes().to_vec();
        bytes.extend_from_slice(Uuid::new_v4().as_bytes());
        let (issued, token_id) = self.store_row(user_id, EMAIL_CONFIRMATION_TOKEN_TYPE, format!("email:{email_id}:{}", Uuid::new_v4()), URL_SAFE_NO_PAD.encode(bytes), self.settings.email_confirmation_ttl).await?;
        let mut link = EmailToken::default();
        link.email_id = email_id;
        link.token_id = token_id;
        if let Err(error) = self.email_tokens.create(link).await {
            if let Some(token) = self.tokens.read(None, None).try_collect::<Vec<Token>>().await?.into_iter().find(|t| t.id == token_id) {
                let _ = self.tokens.delete(token, None).await;
            }
            return Err(error.into());
        }
        Ok(issued)
    }

    /// The email a confirmation token was issued for.
    pub async fn email_id_of(&self, token: &Token) -> Result<Option<i64>> {
        let links: Vec<EmailToken> = self.email_tokens.read(None, None).try_collect().await?;
        Ok(links.into_iter().find(|l| l.token_id == token.id).map(|l| l.email_id))
    }

    /// When the newest still-live confirmation token for the email was issued, to rate-limit resends.
    pub async fn last_email_confirmation(&self, email_id: i64) -> Result<Option<datasources::chrono::DateTime<Utc>>> {
        let links: Vec<EmailToken> = self.email_tokens.read(None, None).try_collect().await?;
        let ids: Vec<i64> = links.into_iter().filter(|l| l.email_id == email_id).map(|l| l.token_id).collect();
        let rows: Vec<Token> = self.tokens.read(None, None).try_collect().await?;
        Ok(rows.into_iter().filter(|t| ids.contains(&t.id) && t.token_type_name == EMAIL_CONFIRMATION_TOKEN_TYPE).map(|t| t.created).max())
    }

    pub async fn issue_access(&self, user_id: i64, user_uuid: &str, session_uuid: &str) -> Result<IssuedToken> {
        self.issue_jwt(user_id, user_uuid, session_uuid, "access", ACCESS_TOKEN_TYPE, self.settings.access_ttl).await
    }

    pub async fn issue_refresh(&self, user_id: i64, user_uuid: &str, session_uuid: &str) -> Result<IssuedToken> {
        self.issue_jwt(user_id, user_uuid, session_uuid, "refresh", REFRESH_TOKEN_TYPE, self.settings.refresh_ttl).await
    }

    /// The stored row when `plain` is a live token of `type_name` (enabled, not deleted, not revoked, not expired).
    pub async fn validate(&self, plain: &str, type_name: &str) -> Result<Option<Token>> {
        if type_name == ACCESS_TOKEN_TYPE || type_name == REFRESH_TOKEN_TYPE {
            let expected = if type_name == ACCESS_TOKEN_TYPE { "access" } else { "refresh" };
            match jwt::verify(plain, &self.settings.jwt_secret, Utc::now().timestamp()) {
                Some(claims) if claims.get("typ").and_then(|t| t.as_str()) == Some(expected) => {}
                _ => return Ok(None),
            }
        }
        let hash = sha256(plain);
        let rows: Vec<Token> = self.tokens.read(None, None).try_collect().await?;
        let found = rows.into_iter().find(|t| t.secret == hash && t.token_type_name == type_name);
        Ok(found.filter(|t| t.is_enabled && !t.is_deleted && t.revoked.is_none() && t.expires > Utc::now()))
    }

    /// The user a stored token was issued to.
    pub async fn user_id_of(&self, token: &Token) -> Result<Option<i64>> {
        let links: Vec<UserToken> = self.user_tokens.read(None, None).try_collect().await?;
        Ok(links.into_iter().find(|l| l.token_id == token.id).map(|l| l.user_id))
    }

    /// Marks a token revoked (and disabled) so it can never validate again.
    pub async fn revoke(&self, mut token: Token) -> Result<()> {
        if token.revoked.is_none() {
            token.revoked = Some(Utc::now());
            token.is_enabled = false;
            self.tokens.update(token, None).await?;
        }
        Ok(())
    }

    /// Revokes every live access/refresh token that was issued for the session.
    pub async fn revoke_for_session(&self, session_uuid: &str) -> Result<()> {
        let prefix = format!("session:{session_uuid}:");
        let rows: Vec<Token> = self.tokens.read(None, None).try_collect().await?;
        for row in rows.into_iter().filter(|t| t.name.starts_with(&prefix)) {
            self.revoke(row).await?;
        }
        Ok(())
    }

    async fn issue_jwt(&self, user_id: i64, user_uuid: &str, session_uuid: &str, typ: &str, type_name: &str, ttl: i64) -> Result<IssuedToken> {
        let jti = Uuid::new_v4().to_string();
        let iat = Utc::now().timestamp();
        let claims = json!({ "sub": user_uuid, "sid": session_uuid, "jti": jti, "typ": typ, "iat": iat, "exp": iat + ttl });
        let value = jwt::sign(&claims, &self.settings.jwt_secret);
        self.store(user_id, type_name, format!("session:{session_uuid}:{jti}"), value, ttl).await
    }

    async fn store(&self, user_id: i64, type_name: &str, name: String, value: String, ttl: i64) -> Result<IssuedToken> {
        Ok(self.store_row(user_id, type_name, name, value, ttl).await?.0)
    }

    async fn store_row(&self, user_id: i64, type_name: &str, name: String, value: String, ttl: i64) -> Result<(IssuedToken, i64)> {
        let mut row = Token::default();
        row.token_type_id = self.type_id(type_name).await?;
        row.name = name;
        row.secret = sha256(&value);
        row.expires = Utc::now() + Duration::seconds(ttl);
        let created = self.tokens.create(row).await?;
        let mut link = UserToken::default();
        link.user_id = user_id;
        link.token_id = created.id;
        if let Err(error) = self.user_tokens.create(link).await {
            let _ = self.tokens.delete(created, None).await; // an unlinked token could never be traced back to its user
            return Err(error.into());
        }
        Ok((IssuedToken { value, expires_in: ttl }, created.id))
    }

    async fn type_id(&self, name: &str) -> Result<i64> {
        let types: Vec<TokenType> = self.token_types.read(None, None).try_collect().await?;
        match types.into_iter().find(|t| t.name == name) {
            Some(found) => Ok(found.id),
            None => Err(AuthError::Invalid(format!("token type \"{name}\" is missing; run the migrations"))),
        }
    }
}
