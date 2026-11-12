// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View IdentityProviderAuthorizeSession.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct IdentityProviderAuthorizeSession {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub identity_provider_id: i64,
    pub session_id: i64,
    pub redirect_uri: String,
    pub state: String,
    pub code_challenge: String,
    pub code_challenge_method: String,
    pub revoked: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub finished: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub is_deleted: bool,
}
impl Default for IdentityProviderAuthorizeSession {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            identity_provider_id: 0,
            session_id: 0,
            redirect_uri: String::new(),
            state: String::new(),
            code_challenge: String::new(),
            code_challenge_method: String::new(),
            revoked: None,
            finished: None,
            is_deleted: false,
        }
    }
}
