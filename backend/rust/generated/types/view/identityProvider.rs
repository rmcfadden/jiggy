// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View IdentityProvider.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct IdentityProvider {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub name: String,
    pub description: Option<String>,
    pub is_enabled: bool,
    pub is_builtin: bool,
    pub is_deleted: bool,
    pub identity_provider_type_name: String,
}
impl Default for IdentityProvider {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            name: String::new(),
            description: None,
            is_enabled: true,
            is_builtin: false,
            is_deleted: false,
            identity_provider_type_name: String::new(),
        }
    }
}
