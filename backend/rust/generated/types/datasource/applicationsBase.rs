// schema-version: 1.0
/// Type ApplicationsBase.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct ApplicationsBase {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub name: String,
    pub application_type_id: i64,
    pub application_visibility_id: i64,
    pub client_id: String,
    pub description: Option<String>,
    pub is_enabled: bool,
    pub is_deleted: bool,
    pub is_builtin: bool,
}
impl Default for ApplicationsBase {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            name: String::new(),
            application_type_id: 0,
            application_visibility_id: 0,
            client_id: String::new(),
            description: None,
            is_enabled: true,
            is_deleted: false,
            is_builtin: false,
        }
    }
}
