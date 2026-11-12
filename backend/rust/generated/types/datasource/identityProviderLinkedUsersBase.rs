// schema-version: 1.0
/// Type IdentityProviderLinkedUsersBase.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct IdentityProviderLinkedUsersBase {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub identity_provider_id: i64,
    pub user_id: i64,
    pub identity_provider_linked_user_field_type_id: i64,
    pub value: String,
}
impl Default for IdentityProviderLinkedUsersBase {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            identity_provider_id: 0,
            user_id: 0,
            identity_provider_linked_user_field_type_id: 0,
            value: String::new(),
        }
    }
}
