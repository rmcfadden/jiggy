// schema-version: 1.0
/// Type GameInstanceSetting.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GameInstanceSetting {
    pub id: i64,
    pub uuid: String,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub game_instance_id: i64,
    pub name: String,
    pub value: String,
}
impl Default for GameInstanceSetting {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4().to_string(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            game_instance_id: 0,
            name: String::new(),
            value: String::new(),
        }
    }
}
