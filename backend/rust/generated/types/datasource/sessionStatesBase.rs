// schema-version: 1.0
/// Type SessionStatesBase.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct SessionStatesBase {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub session_id: i64,
    pub state: String,
    pub code_challenge: Option<String>,
    pub code_challenge_method: Option<String>,
    pub revoked: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub is_enabled: bool,
}
impl Default for SessionStatesBase {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            session_id: 0,
            state: String::new(),
            code_challenge: None,
            code_challenge_method: None,
            revoked: None,
            is_enabled: true,
        }
    }
}
