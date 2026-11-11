use crate::generated::repositories::contactsRepository::ContactsRepository;
use crate::generated::repositories::emailTypesRepository::EmailTypesRepository;
use crate::generated::repositories::emailsRepository::EmailsRepository;
use crate::generated::repositories::gendersRepository::GendersRepository;
use crate::generated::{Contact, Email, EmailType, Gender, User};
use crate::services::tokens::{IssuedToken, TokenService};
use crate::services::users::{CreateUser, UserError, UsersService};
use futures_util::TryStreamExt;
use std::sync::Arc;

/// Name of the email type and gender used for contacts created at signup (looked up by name, not id).
pub const SIGNUP_EMAIL_TYPE: &str = "Personal";
pub const SIGNUP_GENDER: &str = "Other";

const MAX_EMAIL_LENGTH: usize = 320;
const MAX_GENERATE_ATTEMPTS: usize = 20;

pub struct SignupInput {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: String,
}

pub struct SignupResult {
    pub username: String,
    pub signin: IssuedToken,
}

/// A rejected signup (`Invalid` answers 400, `Conflict` answers 409) or a server-side failure.
#[derive(Debug)]
pub enum SignupError {
    Invalid(String),
    Conflict(String),
    Internal(String),
}

impl From<datasources::DatasourceError> for SignupError {
    fn from(error: datasources::DatasourceError) -> Self {
        SignupError::Internal(error.to_string())
    }
}

impl From<crate::services::tokens::AuthError> for SignupError {
    fn from(error: crate::services::tokens::AuthError) -> Self {
        SignupError::Internal(error.to_string())
    }
}

type Result<T> = std::result::Result<T, SignupError>;

/// Creates a user (and optionally an email contact) and issues the same signin token as /api/signin.
pub struct SignupService {
    users: Arc<UsersService>,
    tokens: Arc<TokenService>,
    contacts: Arc<ContactsRepository>,
    emails: Arc<EmailsRepository>,
    email_types: Arc<EmailTypesRepository>,
    genders: Arc<GendersRepository>,
}

impl SignupService {
    pub fn new(
        users: Arc<UsersService>,
        tokens: Arc<TokenService>,
        contacts: Arc<ContactsRepository>,
        emails: Arc<EmailsRepository>,
        email_types: Arc<EmailTypesRepository>,
        genders: Arc<GendersRepository>,
    ) -> Self {
        Self { users, tokens, contacts, emails, email_types, genders }
    }

    pub async fn signup(&self, input: SignupInput) -> Result<SignupResult> {
        let requested = input.username.as_deref().map(str::trim).filter(|u| !u.is_empty()).map(str::to_string);
        let address = match input.email.as_deref() {
            Some(raw) => Some(normalize_email(raw)?),
            None => None,
        };
        if requested.is_none() && address.is_none() {
            return Err(SignupError::Invalid("username or email is required".into()));
        }
        if let Some(username) = &requested {
            if !valid_username(username) {
                return Err(SignupError::Invalid("username must be 3-32 characters: letters, digits, \"_\", \".\" or \"-\"".into()));
            }
        }

        // Everything that can be checked before touching the database happens first.
        let (email_type_id, gender_id) = match &address {
            Some(address) => {
                let email_type_id = self.email_type_id().await?;
                let gender_id = self.gender_id().await?;
                if self.email_taken(address).await? {
                    return Err(SignupError::Conflict("email is already registered".into()));
                }
                (email_type_id, gender_id)
            }
            None => (0, 0),
        };

        let created = self.create_user(requested, address.as_deref(), &input.password).await?;
        match self.finish(&created, address.as_deref(), email_type_id, gender_id).await {
            Ok(signin) => Ok(SignupResult { username: created.username, signin }),
            Err(error) => {
                // do not leave an account the caller never learned about
                let _ = self.users.remove(&created).await;
                Err(error)
            }
        }
    }

    async fn finish(&self, user: &User, address: Option<&str>, email_type_id: i64, gender_id: i64) -> Result<IssuedToken> {
        if let Some(address) = address {
            self.store_email(user, address, email_type_id, gender_id).await?;
        }
        Ok(self.tokens.issue_signin(user.id).await?)
    }

    /// Uses the requested username, or derives one from the email, retrying with a random suffix on collisions.
    async fn create_user(&self, requested: Option<String>, address: Option<&str>, password: &str) -> Result<User> {
        let attempt = |username: String| self.users.create(CreateUser { username, password: password.to_string(), roles: vec![], groups: vec![], is_enabled: None });
        if let Some(username) = requested {
            return attempt(username).await.map_err(map_user_error);
        }
        let base = username_from_email(address.unwrap_or_default());
        for n in 0..MAX_GENERATE_ATTEMPTS {
            let username = if n == 0 { base.clone() } else { format!("{}-{}", truncate(&base, 27), suffix()) };
            match attempt(username).await {
                Ok(user) => return Ok(user),
                Err(UserError::Exists(_)) => continue,
                Err(error) => return Err(map_user_error(error)),
            }
        }
        Err(SignupError::Conflict("could not generate a unique username; please choose one".into()))
    }

    async fn store_email(&self, user: &User, address: &str, email_type_id: i64, gender_id: i64) -> Result<()> {
        let mut contact = Contact::default();
        contact.name = user.username.clone();
        contact.given_name = user.username.clone();
        contact.gender_type_id = gender_id;
        contact.user_id = user.id;
        let saved = self.contacts.create(contact).await?;
        let mut email = Email::default();
        email.email_type_id = email_type_id;
        email.contact_id = saved.id;
        email.address = address.to_string();
        email.is_primary = true;
        if let Err(error) = self.emails.create(email).await {
            let _ = self.contacts.delete(saved, None).await;
            return Err(error.into());
        }
        Ok(())
    }

    async fn email_taken(&self, address: &str) -> Result<bool> {
        let rows: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        Ok(rows.iter().any(|e| e.address.to_lowercase() == address))
    }

    async fn email_type_id(&self) -> Result<i64> {
        let rows: Vec<EmailType> = self.email_types.read(None, None).try_collect().await?;
        rows.into_iter().find(|t| t.name == SIGNUP_EMAIL_TYPE).map(|t| t.id).ok_or_else(|| SignupError::Internal(format!("email type \"{SIGNUP_EMAIL_TYPE}\" is missing; run the migrations")))
    }

    async fn gender_id(&self) -> Result<i64> {
        let rows: Vec<Gender> = self.genders.read(None, None).try_collect().await?;
        rows.into_iter().find(|g| g.name == SIGNUP_GENDER).map(|g| g.id).ok_or_else(|| SignupError::Internal(format!("gender \"{SIGNUP_GENDER}\" is missing; run the migrations")))
    }
}

fn map_user_error(error: UserError) -> SignupError {
    match error {
        UserError::Exists(_) => SignupError::Conflict("username is already taken".into()),
        UserError::Invalid(message) => SignupError::Invalid(message),
        UserError::Datasource(error) => SignupError::Internal(error.to_string()),
    }
}

/// 3-32 characters from `[A-Za-z0-9_.-]`.
fn valid_username(username: &str) -> bool {
    (3..=32).contains(&username.len()) && username.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-'))
}

/// Trims and lowercases an address and applies basic shape checks (one "@", non-empty parts, a dot in the domain).
pub fn normalize_email(raw: &str) -> Result<String> {
    let address = raw.trim().to_lowercase();
    let valid = match address.split_once('@') {
        Some((local, domain)) => {
            !local.is_empty()
                && address.len() <= MAX_EMAIL_LENGTH
                && !domain.contains('@')
                && !address.chars().any(char::is_whitespace)
                && domain.contains('.')
                && !domain.starts_with('.')
                && !domain.ends_with('.')
        }
        None => false,
    };
    if valid { Ok(address) } else { Err(SignupError::Invalid("email address is not valid".into())) }
}

/// The email's local part reduced to username characters, padded to the minimum length; "user" if nothing is left.
pub fn username_from_email(address: &str) -> String {
    let local = address.split('@').next().unwrap_or_default().to_lowercase();
    let cleaned: String = local.chars().filter(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || matches!(c, '_' | '.' | '-')).take(32).collect();
    if cleaned.is_empty() {
        "user".into()
    } else if cleaned.len() >= 3 {
        cleaned
    } else {
        truncate(&format!("{cleaned}{}", suffix()), 32).to_string()
    }
}

fn truncate(value: &str, max: usize) -> &str {
    &value[..value.len().min(max)]
}

/// Four random lowercase hex characters.
fn suffix() -> String {
    datasources::uuid::Uuid::new_v4().simple().to_string()[..4].to_string()
}
