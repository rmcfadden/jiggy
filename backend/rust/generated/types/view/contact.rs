// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
use std::collections::HashMap;
/// View Contact.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct Contact {
    pub id: i64,
    pub uuid: String,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub name: String,
    pub given_name: String,
    pub additional_name: String,
    pub pronunciation: String,
    pub family_name: String,
    pub nick_name: String,
    pub job_title: String,
    pub gender_type_id: String,
    pub organization: String,
    pub is_starred: bool,
    pub is_favorite: bool,
    pub is_deleted: bool,
    pub user_id: String,
    pub addresses: Vec<Address>,
    pub emails: Vec<Email>,
    pub phones: Vec<Phone>,
    pub attributes: HashMap<String, String>,
    pub labels: Vec<Label>,
}
impl Default for Contact {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4().to_string(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            name: String::new(),
            given_name: String::new(),
            additional_name: String::new(),
            pronunciation: String::new(),
            family_name: String::new(),
            nick_name: String::new(),
            job_title: String::new(),
            gender_type_id: String::new(),
            organization: String::new(),
            is_starred: false,
            is_favorite: false,
            is_deleted: false,
            user_id: String::new(),
            addresses: vec![],
            emails: vec![],
            phones: vec![],
            attributes: HashMap::new(),
            labels: vec![],
        }
    }
}
