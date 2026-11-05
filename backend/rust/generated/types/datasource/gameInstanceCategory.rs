// schema-version: 1.0
/// Type GameInstanceCategory.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GameInstanceCategory {
    pub id: i64,
    pub uuid: String,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub game_instance_id: i64,
    pub category_id: i64,
}
impl Default for GameInstanceCategory {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4().to_string(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            game_instance_id: 0,
            category_id: 0,
        }
    }
}
