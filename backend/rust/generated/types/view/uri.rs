// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View Uri.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct Uri {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub uri_type_id: i64,
    pub location: String,
    pub is_public: bool,
    pub is_enabled: bool,
    pub is_deleted: bool,
    pub uri_type_name: String,
    pub description: Option<String>,
}
impl Default for Uri {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            uri_type_id: 0,
            location: String::new(),
            is_public: false,
            is_enabled: true,
            is_deleted: false,
            uri_type_name: String::new(),
            description: None,
        }
    }
}
