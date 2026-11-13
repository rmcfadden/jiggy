//! Single sign-on with the providers added by `add-identity-provider` (authorization code flow with PKCE).
//!
//! /authorize sends the browser to the provider; /callback exchanges the code, reads who the user is, finds or creates the
//! local account, and issues the same single-use signin token as /api/signin (the frontend trades it at /api/oauth/token).
//! The flow keeps no server-side state: `state` is a signed, short-lived token, bound to the browser by a cookie that holds
//! the PKCE verifier.
use crate::generated::repositories::identityProviderLinkedUserFieldTypesRepository::IdentityProviderLinkedUserFieldTypesRepository;
use crate::generated::repositories::identityProviderLinkedUsersRepository::IdentityProviderLinkedUsersRepository;
use crate::generated::repositories::userSettingsRepository::UserSettingsRepository;
use crate::generated::{IdentityProvider, IdentityProviderLinkedUser, IdentityProviderLinkedUserFieldType, UserSetting};
use crate::services::identity_providers::IdentityProvidersService;
use crate::services::jwt;
use crate::services::signup::{SignupError, SignupService};
use crate::services::tokens::{AuthError, IssuedToken, TokenService};
use crate::services::users::UsersService;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use datasources::chrono::Utc;
use datasources::uuid::Uuid;
use futures_util::TryStreamExt;
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::sync::Arc;

/// How long the browser has to finish at the provider.
const STATE_TTL: i64 = 600;
pub const COOKIE_NAME: &str = "sso_verifier";

#[derive(Debug)]
pub enum SsoError {
    /// No such provider, or it is disabled.
    NotFound,
    /// The sign-in failed in a way the user can be told about.
    Failed(String),
    Internal(String),
}

impl From<datasources::DatasourceError> for SsoError {
    fn from(error: datasources::DatasourceError) -> Self {
        SsoError::Internal(error.to_string())
    }
}

impl From<AuthError> for SsoError {
    fn from(error: AuthError) -> Self {
        SsoError::Internal(error.to_string())
    }
}

impl From<crate::services::identity_providers::IdentityProviderError> for SsoError {
    fn from(error: crate::services::identity_providers::IdentityProviderError) -> Self {
        SsoError::Internal(error.to_string())
    }
}

impl From<SignupError> for SsoError {
    fn from(error: SignupError) -> Self {
        match error {
            SignupError::Invalid(m) | SignupError::Conflict(m) | SignupError::Internal(m) => SsoError::Internal(m),
        }
    }
}

type Result<T> = std::result::Result<T, SsoError>;

fn failed<T>(message: impl Into<String>) -> Result<T> {
    Err(SsoError::Failed(message.into()))
}

/// What the sign-in page needs to draw a provider's button.
#[derive(Debug, PartialEq)]
pub struct PublicProvider {
    pub name: String,
    pub display_name: String,
    pub image_url: Option<String>,
}

pub struct Redirect {
    pub url: String,
    /// The PKCE verifier to set as a cookie; the callback must see the same value.
    pub verifier: String,
    /// Whether the cookie needs the Secure flag (the site is served over https).
    pub secure: bool,
}

pub struct SsoSignin {
    pub signin: IssuedToken,
    pub username: String,
    pub from: Option<String>,
}

/// Who the provider says the user is.
#[derive(Debug, Default, PartialEq)]
pub struct Identity {
    pub subject: String,
    pub email: Option<String>,
    pub email_verified: bool,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
}

pub struct SsoService {
    providers: Arc<IdentityProvidersService>,
    linked: Arc<IdentityProviderLinkedUsersRepository>,
    field_types: Arc<IdentityProviderLinkedUserFieldTypesRepository>,
    user_settings: Arc<UserSettingsRepository>,
    signup: Arc<SignupService>,
    users: Arc<UsersService>,
    tokens: Arc<TokenService>,
    jwt_secret: String,
    http: reqwest::Client,
}

impl SsoService {
    pub fn new(
        providers: Arc<IdentityProvidersService>,
        linked: Arc<IdentityProviderLinkedUsersRepository>,
        field_types: Arc<IdentityProviderLinkedUserFieldTypesRepository>,
        user_settings: Arc<UserSettingsRepository>,
        signup: Arc<SignupService>,
        users: Arc<UsersService>,
        tokens: Arc<TokenService>,
        jwt_secret: String,
    ) -> Self {
        let http = reqwest::Client::builder().timeout(std::time::Duration::from_secs(15)).build().expect("http client");
        Self { providers, linked, field_types, user_settings, signup, users, tokens, jwt_secret, http }
    }

    /// Enabled providers that are fully configured, in name order.
    pub async fn list(&self) -> Result<Vec<PublicProvider>> {
        let mut found: Vec<PublicProvider> = self
            .providers
            .all()
            .await?
            .into_iter()
            .filter(|p| usable(p))
            .map(|p| PublicProvider {
                display_name: p.settings.get("display_name").cloned().unwrap_or_else(|| p.name.clone()),
                image_url: p.settings.get("image_url").cloned(),
                name: p.name,
            })
            .collect();
        found.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(found)
    }

    /// The address to send the browser back to: the origin of the provider's redirect URI.
    pub async fn site_base(&self, name: &str) -> Option<String> {
        let provider = self.provider(name).await.ok()?;
        let url = reqwest::Url::parse(provider.settings.get("redirect_uri")?).ok()?;
        Some(url.origin().ascii_serialization())
    }

    async fn provider(&self, name: &str) -> Result<IdentityProvider> {
        match self.providers.find(name).await? {
            Some(p) if usable(&p) => Ok(p),
            _ => Err(SsoError::NotFound),
        }
    }

    /// The provider's authorization URL for a new sign-in. `from` is an in-app path to return to afterwards.
    pub async fn authorize(&self, name: &str, from: Option<&str>) -> Result<Redirect> {
        let provider = self.provider(name).await?;
        let setting = |key: &str| provider.settings.get(key).map(String::as_str).unwrap_or_default();
        let verifier = format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple());
        let claims = serde_json::json!({
            "typ": "sso_state",
            "prv": name,
            "n": bind(&verifier),
            "from": from.filter(|f| safe_path(f)),
            "exp": Utc::now().timestamp() + STATE_TTL,
        });
        let state = jwt::sign(&claims, &self.jwt_secret);
        let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
        let mut params = vec![
            ("client_id", setting("client_id")),
            ("redirect_uri", setting("redirect_uri")),
            ("response_type", "code"),
            ("scope", setting("scopes")),
            ("state", state.as_str()),
            ("code_challenge", challenge.as_str()),
            ("code_challenge_method", "S256"),
        ];
        if setting("scopes").is_empty() {
            params.retain(|(k, _)| *k != "scope");
        }
        let url = reqwest::Url::parse_with_params(setting("authorize_url"), &params).map_err(|e| SsoError::Internal(format!("authorize_url: {e}")))?;
        Ok(Redirect { url: url.to_string(), verifier, secure: setting("redirect_uri").starts_with("https://") })
    }

    /// Finishes a sign-in: checks `state` against the cookie, exchanges `code`, and returns a signin token for the local user.
    pub async fn callback(&self, name: &str, code: &str, state: &str, verifier: Option<&str>) -> Result<SsoSignin> {
        let provider = self.provider(name).await?;
        let claims = jwt::verify(state, &self.jwt_secret, Utc::now().timestamp()).filter(|c| c.get("typ").and_then(Value::as_str) == Some("sso_state") && c.get("prv").and_then(Value::as_str) == Some(name));
        let Some(claims) = claims else { return failed("the sign-in expired or was not started here; please try again") };
        let verifier = verifier.unwrap_or_default();
        if verifier.is_empty() || claims.get("n").and_then(Value::as_str) != Some(bind(verifier).as_str()) {
            return failed("the sign-in expired or was not started in this browser; please try again");
        }
        let from = claims.get("from").and_then(Value::as_str).map(String::from);

        let identity = self.identify(&provider, code, verifier).await?;
        let user = self.user_for(&provider, &identity).await?;
        self.save_avatar(&user, &identity).await?;
        let signin = self.tokens.issue_signin(user.id).await?;
        Ok(SsoSignin { signin, username: user.username, from })
    }

    /// Trades the code for an access token, then asks the userinfo endpoint who it belongs to.
    async fn identify(&self, provider: &IdentityProvider, code: &str, verifier: &str) -> Result<Identity> {
        let setting = |key: &str| provider.settings.get(key).map(String::as_str).unwrap_or_default();
        let Some(userinfo_url) = provider.settings.get("userinfo_url") else { return failed(format!("{} sign-in is not supported yet (no userinfo endpoint)", provider.name)) };
        let form = [
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", setting("redirect_uri")),
            ("client_id", setting("client_id")),
            ("client_secret", setting("client_secret")),
            ("code_verifier", verifier),
        ];
        let response = self.http.post(setting("token_url")).header("Accept", "application/json").form(&form).send().await.map_err(|e| SsoError::Internal(format!("token request: {e}")))?;
        let status = response.status();
        let body: Value = response.json().await.unwrap_or(Value::Null);
        let Some(access_token) = body.get("access_token").and_then(Value::as_str).filter(|_| status.is_success()) else {
            eprintln!("sso {}: token exchange failed ({status}): {}", provider.name, body.get("error_description").or(body.get("error")).unwrap_or(&body));
            return failed(format!("{} did not accept the sign-in; please try again", provider.name));
        };

        let mut request = self.http.get(userinfo_url).header("Accept", "application/json");
        match setting("userinfo_fields") {
            "" => request = request.bearer_auth(access_token),
            // Facebook's Graph API takes the token and the wanted fields as query parameters.
            fields => request = request.query(&[("fields", fields), ("access_token", access_token)]),
        }
        let response = request.send().await.map_err(|e| SsoError::Internal(format!("userinfo request: {e}")))?;
        let status = response.status();
        let info: Value = response.json().await.unwrap_or(Value::Null);
        if !status.is_success() {
            eprintln!("sso {}: userinfo failed ({status}): {info}", provider.name);
            return failed(format!("could not read your profile from {}", provider.name));
        }
        match parse_identity(&info) {
            Some(identity) => Ok(identity),
            None => failed(format!("{} did not say who you are", provider.name)),
        }
    }

    /// The linked user, else the account whose email is confirmed and matches the provider's verified email (now linked), else a new account.
    async fn user_for(&self, provider: &IdentityProvider, identity: &Identity) -> Result<crate::generated::User> {
        let rows: Vec<IdentityProviderLinkedUser> = self.linked.read(None, None).try_collect().await?;
        let existing = rows.iter().find(|r| r.identity_provider_id == provider.id && r.identity_provider_linked_user_field_type_name == "subject" && r.value == identity.subject);
        let user = match existing {
            Some(row) => self.users.find_by_id(row.user_id).await.map_err(AuthError::from)?,
            None => None,
        };
        if let Some(user) = user {
            return enabled(user);
        }
        // Only a verified email may claim an existing account; anyone can type an address into an unverified field.
        let owner = match (&identity.email, identity.email_verified) {
            (Some(email), true) => self.signup.find_user_by_verified_email(email).await?,
            _ => None,
        };
        let user = match owner {
            Some(user) => enabled(user)?,
            None => self.signup.create_external(identity.email.as_deref(), identity.email_verified, identity.first_name.as_deref(), identity.last_name.as_deref()).await?,
        };
        self.link(provider, &user, identity).await?;
        Ok(user)
    }

    /// The signed-in user's profile picture, from their `avatar` setting.
    pub async fn avatar(&self, user_id: i64) -> Result<Option<String>> {
        let rows: Vec<UserSetting> = self.user_settings.read(None, None).try_collect().await?;
        Ok(rows.into_iter().find(|r| r.user_id == user_id && r.name == "avatar" && !r.value.is_empty()).map(|r| r.value))
    }

    /// Keeps the user's `avatar` setting at the picture the provider last reported.
    async fn save_avatar(&self, user: &crate::generated::User, identity: &Identity) -> Result<()> {
        let Some(url) = identity.avatar_url.as_deref().filter(|u| !u.is_empty()) else { return Ok(()) };
        let rows: Vec<UserSetting> = self.user_settings.read(None, None).try_collect().await?;
        match rows.into_iter().find(|r| r.user_id == user.id && r.name == "avatar") {
            Some(mut row) if row.value != url => {
                row.value = url.to_string();
                self.user_settings.update(row, None).await?;
            }
            Some(_) => {}
            None => {
                let mut row = UserSetting::default();
                row.user_id = user.id;
                row.name = "avatar".into();
                row.value = url.to_string();
                self.user_settings.create(row).await?;
            }
        }
        Ok(())
    }

    async fn link(&self, provider: &IdentityProvider, user: &crate::generated::User, identity: &Identity) -> Result<()> {
        let types: Vec<IdentityProviderLinkedUserFieldType> = self.field_types.read(None, None).try_collect().await?;
        let verified = identity.email_verified.to_string();
        let facts: [(&str, Option<&str>); 6] = [
            ("subject", Some(&identity.subject)),
            ("email", identity.email.as_deref()),
            ("email_verified", identity.email.as_ref().map(|_| verified.as_str())),
            ("first_name", identity.first_name.as_deref()),
            ("last_name", identity.last_name.as_deref()),
            ("avatar_url", identity.avatar_url.as_deref()),
        ];
        for (name, value) in facts {
            let Some(value) = value.filter(|v| !v.is_empty()) else { continue };
            let Some(field_type) = types.iter().find(|t| t.name == name) else { return Err(SsoError::Internal(format!("linked user field \"{name}\" is missing; run the migrations"))) };
            let mut row = IdentityProviderLinkedUser::default();
            row.identity_provider_id = provider.id;
            row.user_id = user.id;
            row.identity_provider_linked_user_field_type_id = field_type.id;
            row.identity_provider_linked_user_field_type_name = name.to_string();
            row.value = value.to_string();
            self.linked.create(row).await?;
        }
        Ok(())
    }
}

fn enabled(user: crate::generated::User) -> Result<crate::generated::User> {
    if user.is_enabled { Ok(user) } else { failed("this account is disabled") }
}

/// A provider the sign-in page may offer: on, not deleted, and holding every setting the flow needs.
fn usable(provider: &IdentityProvider) -> bool {
    provider.is_enabled && !provider.is_deleted && ["client_id", "client_secret", "redirect_uri", "authorize_url", "token_url"].iter().all(|k| provider.settings.get(*k).is_some_and(|v| !v.is_empty()))
}

/// Ties `state` to the browser that started the flow without exposing the PKCE verifier in the URL.
fn bind(verifier: &str) -> String {
    Sha256::digest(format!("sso-state:{verifier}").as_bytes()).iter().map(|b| format!("{b:02x}")).collect()
}

/// Only in-app paths may be returned to (no scheme, no `//host`).
pub fn safe_path(path: &str) -> bool {
    path.starts_with('/') && !path.starts_with("//") && !path.contains('\\') && path.len() <= 512
}

/// Reads the standard OIDC claims (Google) or Facebook's Graph fields from a userinfo response.
pub fn parse_identity(info: &Value) -> Option<Identity> {
    let text = |key: &str| info.get(key).and_then(Value::as_str).filter(|v| !v.is_empty()).map(String::from);
    let subject = text("sub").or_else(|| text("id"))?;
    // Graph returns `id` and no verification flag; an OIDC provider says so with `email_verified` (a bool, or "true" for some).
    let email_verified = match info.get("email_verified") {
        Some(Value::Bool(b)) => *b,
        Some(Value::String(s)) => s == "true",
        _ => false,
    };
    let avatar_url = text("picture").or_else(|| info.pointer("/picture/data/url").and_then(Value::as_str).map(String::from));
    Some(Identity { subject, email: text("email"), email_verified, first_name: text("given_name").or_else(|| text("first_name")), last_name: text("family_name").or_else(|| text("last_name")), avatar_url })
}

/// Percent-encodes everything except RFC 3986 unreserved characters.
pub fn encode(text: &str) -> String {
    text.bytes().map(|b| if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'.' | b'_' | b'~') { (b as char).to_string() } else { format!("%{b:02X}") }).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn reads_google_userinfo() {
        let info = json!({ "sub": "123", "email": "a@b.com", "email_verified": true, "given_name": "Ann", "family_name": "Lee", "picture": "https://x/p.png" });
        let id = parse_identity(&info).unwrap();
        assert_eq!(id, Identity { subject: "123".into(), email: Some("a@b.com".into()), email_verified: true, first_name: Some("Ann".into()), last_name: Some("Lee".into()), avatar_url: Some("https://x/p.png".into()) });
    }

    #[test]
    fn reads_facebook_graph_and_never_trusts_its_email() {
        let info = json!({ "id": "9", "email": "a@b.com", "first_name": "Ann", "picture": { "data": { "url": "https://x/p.jpg" } } });
        let id = parse_identity(&info).unwrap();
        assert_eq!(id.subject, "9");
        assert!(!id.email_verified);
        assert_eq!(id.avatar_url.as_deref(), Some("https://x/p.jpg"));
    }

    #[test]
    fn needs_a_subject() {
        assert!(parse_identity(&json!({ "email": "a@b.com" })).is_none());
    }

    #[test]
    fn only_in_app_paths_are_safe() {
        assert!(safe_path("/puzzles?x=1"));
        assert!(!safe_path("//evil.com"));
        assert!(!safe_path("https://evil.com"));
        assert!(!safe_path("/\\evil.com"));
    }

    #[test]
    fn encodes_reserved_characters() {
        assert_eq!(encode("/a b?c=d"), "%2Fa%20b%3Fc%3Dd");
    }
}
