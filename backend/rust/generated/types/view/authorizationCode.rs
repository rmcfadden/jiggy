// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View AuthorizationCode.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct AuthorizationCode {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub session_id: Option<i64>,
    pub code: String,
    pub is_used: bool,
    pub is_deleted: bool,
}
impl Default for AuthorizationCode {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            session_id: None,
            code: String::new(),
            is_used: true,
            is_deleted: false,
        }
    }
}
