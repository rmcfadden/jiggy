// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View LocalizedString.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct LocalizedString {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub value: String,
    pub is_enabled: bool,
    pub is_deleted: bool,
    pub name: String,
    pub language_name: String,
}
impl Default for LocalizedString {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            value: String::new(),
            is_enabled: true,
            is_deleted: false,
            name: String::new(),
            language_name: String::new(),
        }
    }
}
