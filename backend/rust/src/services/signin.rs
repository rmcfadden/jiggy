use crate::generated::repositories::contactsRepository::ContactsRepository;
use crate::generated::repositories::emailsRepository::EmailsRepository;
use crate::generated::{Contact, Email};
use crate::services::tokens::{IssuedToken, Result, TokenService};
use crate::services::users::UsersService;
use futures_util::TryStreamExt;
use std::sync::Arc;

/// Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token.
pub struct SigninService {
    users: Arc<UsersService>,
    tokens: Arc<TokenService>,
    contacts: Arc<ContactsRepository>,
    emails: Arc<EmailsRepository>,
}

impl SigninService {
    pub fn new(users: Arc<UsersService>, tokens: Arc<TokenService>, contacts: Arc<ContactsRepository>, emails: Arc<EmailsRepository>) -> Self {
        Self { users, tokens, contacts, emails }
    }

    /// `username` may be a username or an email address. None for an unknown user, a wrong password or a disabled account (callers must not distinguish them).
    pub async fn signin(&self, username: &str, password: &str) -> Result<Option<IssuedToken>> {
        let username = self.resolve_username(username.trim()).await?;
        if !self.users.verify_password(&username, password).await? {
            return Ok(None);
        }
        match self.users.find(&username).await? {
            Some(user) if user.is_enabled => Ok(Some(self.tokens.issue_signin(user.id).await?)),
            _ => Ok(None),
        }
    }

    /// A username stays as it is; an email address is mapped to its owner (emails.contact_id -> contacts.user_id).
    async fn resolve_username(&self, identifier: &str) -> Result<String> {
        if !identifier.contains('@') || self.users.find(identifier).await?.is_some() {
            return Ok(identifier.to_string());
        }
        let address = identifier.to_lowercase();
        let emails: Vec<Email> = self.emails.read(None, None).try_collect().await?;
        let Some(email) = emails.into_iter().find(|e| e.address.to_lowercase() == address) else { return Ok(identifier.to_string()) };
        let contacts: Vec<Contact> = self.contacts.read(None, None).try_collect().await?;
        let Some(contact) = contacts.into_iter().find(|c| c.id == email.contact_id) else { return Ok(identifier.to_string()) };
        Ok(match self.users.find_by_id(contact.user_id).await? {
            Some(user) => user.username,
            None => identifier.to_string(),
        })
    }
}
