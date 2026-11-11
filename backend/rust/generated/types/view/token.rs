// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View Token.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct Token {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub token_type_id: i64,
    pub name: String,
    pub secret: String,
    pub is_enabled: bool,
    pub expires: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub revoked: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub is_deleted: bool,
    pub token_type_name: String,
    pub description: String,
}
impl Default for Token {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            token_type_id: 0,
            name: String::new(),
            secret: String::new(),
            is_enabled: true,
            expires: datasources::chrono::DateTime::<datasources::chrono::Utc>::UNIX_EPOCH,
            revoked: None,
            is_deleted: false,
            token_type_name: String::new(),
            description: String::new(),
        }
    }
}
