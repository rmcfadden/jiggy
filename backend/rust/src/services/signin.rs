use crate::services::tokens::{IssuedToken, Result, TokenService};
use crate::services::users::UsersService;
use std::sync::Arc;

/// Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token.
pub struct SigninService {
    users: Arc<UsersService>,
    tokens: Arc<TokenService>,
}

impl SigninService {
    pub fn new(users: Arc<UsersService>, tokens: Arc<TokenService>) -> Self {
        Self { users, tokens }
    }

    /// None for an unknown user, a wrong password or a disabled account (callers must not distinguish them).
    pub async fn signin(&self, username: &str, password: &str) -> Result<Option<IssuedToken>> {
        let username = username.trim();
        if !self.users.verify_password(username, password).await? {
            return Ok(None);
        }
        match self.users.find(username).await? {
            Some(user) if user.is_enabled => Ok(Some(self.tokens.issue_signin(user.id).await?)),
            _ => Ok(None),
        }
    }
}
