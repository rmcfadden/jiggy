//! Confirming an email address: a short-lived single-use code is mailed as a link; opening it marks the email verified.
//! The code is a token of type `email_confirmation` (only its hash is stored), linked to the email by `email_tokens`.
use crate::generated::repositories::contactsRepository::ContactsRepository;
use crate::generated::repositories::emailsRepository::EmailsRepository;
use crate::generated::{Contact, Email};
use crate::services::email::EmailService;
use crate::services::logs::LogsService;
use crate::services::templates::TemplatesService;
use crate::services::tokens::{AuthError, TokenService, EMAIL_CONFIRMATION_TOKEN_TYPE};
use crate::services::users::UsersService;
use datasources::chrono::{Duration, Utc};
use futures_util::TryStreamExt;
use std::sync::Arc;

/// Language of the `confirm_email` template used for every message until accounts carry a language.
const LANGUAGE: &str = "en";
const TEMPLATE_KIND: &str = "confirm_email";
/// A second email is refused while the last one is younger than this.
const RESEND_AFTER_SECONDS: i64 = 60;

#[derive(Debug)]
pub enum ConfirmError {
    /// The code is unknown, expired or already used.
    Invalid,
    /// Nothing to confirm for this user.
    NothingToConfirm,
    /// A message was sent a moment ago.
    TooSoon,
    Internal(String),
}

impl From<AuthError> for ConfirmError {
    fn from(error: AuthError) -> Self {
        ConfirmError::Internal(error.to_string())
    }
}

impl From<datasources::DatasourceError> for ConfirmError {
    fn from(error: datasources::DatasourceError) -> Self {
        ConfirmError::Internal(error.to_string())
    }
}

type Result<T> = std::result::Result<T, ConfirmError>;

pub struct EmailConfirmationService {
    tokens: Arc<TokenService>,
    users: Arc<UsersService>,
    templates: Arc<TemplatesService>,
    emails: Arc<EmailsRepository>,
    contacts: Arc<ContactsRepository>,
    mail: Arc<EmailService>,
    logs: Arc<LogsService>,
    site_base_url: String,
}

impl EmailConfirmationService {
    pub fn new(tokens: Arc<TokenService>, users: Arc<UsersService>, templates: Arc<TemplatesService>, emails: Arc<EmailsRepository>, contacts: Arc<ContactsRepository>, mail: Arc<EmailService>, logs: Arc<LogsService>, site_base_url: Option<String>) -> Self {
        let site_base_url = site_base_url.unwrap_or_else(|| "http://localhost:5174".into()).trim_end_matches('/').to_string();
        Self { tokens, users, templates, emails, contacts, mail, logs, site_base_url }
    }

    /// Mails the confirmation link for `email_id` (which belongs to `user_id`). Failures are logged, never raised to the caller:
    /// an account must not be lost because the mail server is down; the user can ask for another message.
    pub async fn send(&self, user_id: i64, email_id: i64, username: &str, address: &str) {
        if let Err(error) = self.try_send(user_id, email_id, username, address).await {
            self.logs.error("confirmation email not sent", &[("user_id", &user_id.to_string()), ("email_id", &email_id.to_string()), ("error", &format!("{error:?}"))]).await;
        }
    }

    async fn try_send(&self, user_id: i64, email_id: i64, username: &str, address: &str) -> Result<()> {
        let template = self.templates.content_for(TEMPLATE_KIND, LANGUAGE).await.map_err(|_| ConfirmError::Internal("could not read the template".into()))?;
        let Some(template) = template else { return Err(ConfirmError::Internal(format!("template \"{TEMPLATE_KIND}\" ({LANGUAGE}) is missing; run setup"))) };
        let field = |key: &str| template[key].as_str().unwrap_or_default().to_string();
        let issued = self.tokens.issue_email_confirmation(user_id, email_id).await?;
        let url = format!("{}/confirm-email?code={}", self.site_base_url, issued.value);
        let fill = |text: String, escape: bool| {
            let name = if escape { escape_html(username) } else { username.to_string() };
            text.replace("{{username}}", &name).replace("{{confirm_url}}", &url)
        };
        let (subject, text, html) = (fill(field("subject"), false), fill(field("text"), false), fill(field("html"), true));
        self.mail.send(address, &subject, &text, &html).await.map_err(ConfirmError::Internal)?;
        self.logs.information("confirmation email sent", &[("user_id", &user_id.to_string()), ("email_id", &email_id.to_string())]).await;
        Ok(())
    }

    /// The user's email address and whether it is confirmed, or None when the account has no email.
    pub async fn status(&self, user_id: i64) -> Result<Option<(String, bool)>> {
        let contacts: Vec<Contact> = self.contacts.read(None, None).try_collect().await?;
        let mine: Vec<i64> = contacts.into_iter().filter(|c| c.user_id == user_id).map(|c| c.id).collect();
        let emails: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        Ok(emails.into_iter().filter(|e| mine.contains(&e.contact_id)).max_by_key(|e| e.is_primary).map(|e| (e.address, e.is_verified)))
    }

    /// Sends a new link to the user's primary unverified email, unless one went out in the last minute.
    pub async fn resend(&self, user_id: i64) -> Result<()> {
        let Some(user) = self.users.find_by_id(user_id).await.map_err(|e| ConfirmError::Internal(format!("{e:?}")))? else { return Err(ConfirmError::NothingToConfirm) };
        let contacts: Vec<Contact> = self.contacts.read(None, None).try_collect().await?;
        let mine: Vec<i64> = contacts.into_iter().filter(|c| c.user_id == user_id).map(|c| c.id).collect();
        let emails: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        let Some(email) = emails.into_iter().find(|e| mine.contains(&e.contact_id) && !e.is_verified) else { return Err(ConfirmError::NothingToConfirm) };
        if let Some(last) = self.tokens.last_email_confirmation(email.id).await? {
            if Utc::now() - last < Duration::seconds(RESEND_AFTER_SECONDS) {
                return Err(ConfirmError::TooSoon);
            }
        }
        self.send(user_id, email.id, &user.username, &email.address).await;
        Ok(())
    }

    /// Verifies the email the code was sent for and uses the code up.
    pub async fn confirm(&self, code: &str) -> Result<()> {
        let fail = |reason: &'static str| async move {
            self.logs.information("email confirmation refused", &[("reason", reason)]).await;
            Err(ConfirmError::Invalid)
        };
        let Some(token) = self.tokens.validate(code.trim(), EMAIL_CONFIRMATION_TOKEN_TYPE).await? else { return fail("unknown, expired or used code").await };
        let Some(email_id) = self.tokens.email_id_of(&token).await? else { return fail("code is not linked to an email").await };
        let emails: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        let Some(mut email) = emails.into_iter().find(|e| e.id == email_id) else { return fail("email no longer exists").await };
        if !email.is_verified {
            email.is_verified = true;
            self.emails.update(email.clone(), None).await?;
        }
        self.tokens.revoke(token).await?;
        self.logs.information("email confirmed", &[("email_id", &email_id.to_string())]).await;
        Ok(())
    }
}

fn escape_html(text: &str) -> String {
    text.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

#[cfg(test)]
mod tests {
    use super::escape_html;

    #[test]
    fn escapes_markup_in_names() {
        assert_eq!(escape_html("<b>\"Ann\" & co</b>"), "&lt;b&gt;&quot;Ann&quot; &amp; co&lt;/b&gt;");
    }
}
