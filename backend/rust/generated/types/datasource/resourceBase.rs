// schema-version: 1.0
/// Type ResourceBase.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct ResourceBase {
    pub id: i64,
    pub uuid: String,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub resource_name: String,
    pub mime_type_id: i64,
    pub description: String,
    pub location: String,
    pub is_enabled: bool,
    pub is_deleted: bool,
}
impl Default for ResourceBase {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4().to_string(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            resource_name: String::new(),
            mime_type_id: 0,
            description: String::new(),
            location: String::new(),
            is_enabled: true,
            is_deleted: false,
        }
    }
}
