// schema-version: 1.0
/// Type Review.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct Review {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub user_id: i64,
    pub comment: String,
    pub rating: datasources::rust_decimal::Decimal,
    pub is_moderated: bool,
}
impl Default for Review {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            user_id: 0,
            comment: String::new(),
            rating: datasources::rust_decimal::Decimal::ZERO,
            is_moderated: false,
        }
    }
}
