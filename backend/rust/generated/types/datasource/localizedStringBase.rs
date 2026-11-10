// schema-version: 1.0
/// Type LocalizedStringBase.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct LocalizedStringBase {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub localized_string_name_id: i64,
    pub language_id: i64,
    pub value: String,
    pub is_enabled: bool,
    pub is_deleted: bool,
}
impl Default for LocalizedStringBase {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            localized_string_name_id: 0,
            language_id: 0,
            value: String::new(),
            is_enabled: true,
            is_deleted: false,
        }
    }
}
