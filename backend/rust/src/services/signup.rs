use crate::generated::repositories::contactsRepository::ContactsRepository;
use crate::generated::repositories::emailTypesRepository::EmailTypesRepository;
use crate::generated::repositories::emailsRepository::EmailsRepository;
use crate::generated::repositories::gendersRepository::GendersRepository;
use crate::generated::{Contact, Email, EmailType, Gender, User};
use crate::services::email_confirmation::EmailConfirmationService;
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
    confirmations: Arc<EmailConfirmationService>,
}

impl SignupService {
    pub fn new(
        users: Arc<UsersService>,
        tokens: Arc<TokenService>,
        contacts: Arc<ContactsRepository>,
        emails: Arc<EmailsRepository>,
        email_types: Arc<EmailTypesRepository>,
        genders: Arc<GendersRepository>,
        confirmations: Arc<EmailConfirmationService>,
    ) -> Self {
        Self { users, tokens, contacts, emails, email_types, genders, confirmations }
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

        let created = self.create_user(requested, None, address.as_deref(), &input.password).await?;
        match self.finish(&created, address.as_deref(), email_type_id, gender_id).await {
            Ok((signin, email_id)) => {
                if let (Some(email_id), Some(address)) = (email_id, address.as_deref()) {
                    self.confirmations.send(created.id, email_id, &created.username, address).await;
                }
                Ok(SignupResult { username: created.username, signin })
            }
            Err(error) => {
                // do not leave an account the caller never learned about
                let _ = self.users.remove(&created).await;
                Err(error)
            }
        }
    }

    /// The user whose contact owns this email address (case-insensitive) AND has confirmed it, if any. An unconfirmed address
    /// proves nothing about who typed it in, so it must never be used to hand an account to someone else.
    pub async fn find_user_by_verified_email(&self, raw: &str) -> Result<Option<User>> {
        let address = raw.trim().to_lowercase();
        let emails: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        let Some(email) = emails.into_iter().find(|e| e.is_verified && e.address.to_lowercase() == address) else { return Ok(None) };
        let contacts: Vec<Contact> = self.contacts.read(None, None).try_collect().await?;
        let Some(contact) = contacts.into_iter().find(|c| c.id == email.contact_id) else { return Ok(None) };
        self.users.find_by_id(contact.user_id).await.map_err(map_user_error)
    }

    /// Creates the account for a first single sign-on: a username from the provider's name and an unguessable password
    /// (nobody learns it, so the account is reachable only through its provider). The email is stored only when it is valid and not taken;
    /// it is marked verified when the provider vouched for it, otherwise a confirmation link is mailed.
    pub async fn create_external(&self, email: Option<&str>, email_verified: bool, first_name: Option<&str>, last_name: Option<&str>) -> Result<User> {
        let base = external_username_base(first_name, last_name, email);
        let address = match email.map(normalize_email) {
            Some(Ok(address)) if !self.email_taken(&address).await? => Some(address),
            _ => None,
        };
        let gender_id = self.gender_id().await?;
        let email_type_id = if address.is_some() { self.email_type_id().await? } else { 0 };
        let password = format!("{}{}", datasources::uuid::Uuid::new_v4().simple(), datasources::uuid::Uuid::new_v4().simple());
        let created = self.create_user(None, Some(base), address.as_deref(), &password).await?;
        // Every provider account gets a contact carrying the provider's name; the email is added when it is free.
        let mut contact = Contact::default();
        let full = [first_name, last_name].iter().filter_map(|n| n.map(str::trim).filter(|n| !n.is_empty())).collect::<Vec<_>>().join(" ");
        contact.name = if full.is_empty() { created.username.clone() } else { full };
        contact.given_name = first_name.map(str::trim).filter(|n| !n.is_empty()).unwrap_or(&created.username).to_string();
        contact.family_name = last_name.map(str::trim).unwrap_or_default().to_string();
        contact.gender_type_id = gender_id;
        contact.user_id = created.id;
        let saved = match self.contacts.create(contact).await {
            Ok(saved) => saved,
            Err(error) => {
                let _ = self.users.remove(&created).await;
                return Err(error.into());
            }
        };
        if let Some(address) = &address {
            let mut email = Email::default();
            email.email_type_id = email_type_id;
            email.contact_id = saved.id;
            email.address = address.clone();
            email.is_primary = true;
            email.is_verified = email_verified;
            match self.emails.create(email).await {
                Ok(stored) if !email_verified => self.confirmations.send(created.id, stored.id, &created.username, address).await,
                Ok(_) => {}
                Err(error) => {
                    let _ = self.contacts.delete(saved, None).await;
                    let _ = self.users.remove(&created).await;
                    return Err(error.into());
                }
            }
        }
        Ok(created)
    }

    async fn finish(&self, user: &User, address: Option<&str>, email_type_id: i64, gender_id: i64) -> Result<(IssuedToken, Option<i64>)> {
        let email_id = match address {
            Some(address) => Some(self.store_email(user, address, email_type_id, gender_id).await?),
            None => None,
        };
        Ok((self.tokens.issue_signin(user.id).await?, email_id))
    }

    /// Uses the requested username, or derives one from the email, retrying with a random suffix on collisions.
    async fn create_user(&self, requested: Option<String>, base: Option<String>, address: Option<&str>, password: &str) -> Result<User> {
        let attempt = |username: String| self.users.create(CreateUser { username, password: password.to_string(), roles: vec![], groups: vec![], is_enabled: None });
        if let Some(username) = requested {
            return attempt(username).await.map_err(map_user_error);
        }
        let base = base.unwrap_or_else(|| username_from_email(address.unwrap_or_default()));
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

    /// Stores the contact and its (unverified) email; returns the email's id.
    async fn store_email(&self, user: &User, address: &str, email_type_id: i64, gender_id: i64) -> Result<i64> {
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
        match self.emails.create(email).await {
            Ok(created) => Ok(created.id),
            Err(error) => {
                let _ = self.contacts.delete(saved, None).await;
                Err(error.into())
            }
        }
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

/// A starting username for a provider sign-in: "first-last" when the provider gave a name, else the email's local part.
fn external_username_base(first_name: Option<&str>, last_name: Option<&str>, email: Option<&str>) -> String {
    let part = |v: Option<&str>| -> String { v.unwrap_or_default().to_lowercase().chars().filter(|c| c.is_ascii_lowercase() || c.is_ascii_digit()).collect() };
    let (first, last) = (part(first_name), part(last_name));
    let name = [first, last].iter().filter(|p| !p.is_empty()).cloned().collect::<Vec<_>>().join("-");
    if name.len() >= 3 { truncate(&name, 32).to_string() } else { username_from_email(email.unwrap_or_default()) }
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

#[cfg(test)]
mod external_username_tests {
    use super::external_username_base;

    #[test]
    fn prefers_the_providers_name_then_the_email() {
        assert_eq!(external_username_base(Some("Ryan"), Some("McFadden"), Some("x@y.com")), "ryan-mcfadden");
        assert_eq!(external_username_base(Some("Zoë"), None, Some("zed@y.com")), "zed");
        assert_eq!(external_username_base(None, None, Some("ann.lee@y.com")), "ann.lee");
        assert_eq!(external_username_base(None, None, None), "user");
    }
}
