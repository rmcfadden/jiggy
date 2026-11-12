// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View IdentityProviderSigninAttempt.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct IdentityProviderSigninAttempt {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub identity_provider_id: i64,
    pub session_id: i64,
    pub authentication_method_id: i64,
    pub is_success: bool,
}
impl Default for IdentityProviderSigninAttempt {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            identity_provider_id: 0,
            session_id: 0,
            authentication_method_id: 0,
            is_success: false,
        }
    }
}
