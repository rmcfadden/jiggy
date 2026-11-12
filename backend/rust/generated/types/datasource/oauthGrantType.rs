// schema-version: 1.0
/// Type OauthGrantType.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct OauthGrantType {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub name: String,
    pub description: String,
    pub is_custom: bool,
    pub is_enabled: bool,
    pub is_legacy: bool,
}
impl Default for OauthGrantType {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            name: String::new(),
            description: String::new(),
            is_custom: false,
            is_enabled: true,
            is_legacy: false,
        }
    }
}
