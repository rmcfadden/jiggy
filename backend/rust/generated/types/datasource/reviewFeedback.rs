// schema-version: 1.0
/// Type ReviewFeedback.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct ReviewFeedback {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub review_id: i64,
    pub user_id: i64,
    pub is_positive: bool,
}
impl Default for ReviewFeedback {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            review_id: 0,
            user_id: 0,
            is_positive: false,
        }
    }
}
