// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View Session.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct Session {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub session_type_id: i64,
    pub user_id: Option<i64>,
    pub relative_expiration: Option<i32>,
    pub absolute_expiration: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub revoked: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub expired: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub is_enabled: bool,
    pub session_type_name: String,
}
impl Default for Session {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            session_type_id: 0,
            user_id: None,
            relative_expiration: None,
            absolute_expiration: None,
            revoked: None,
            expired: None,
            is_enabled: true,
            session_type_name: String::new(),
        }
    }
}
