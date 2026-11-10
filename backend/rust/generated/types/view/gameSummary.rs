// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View GameSummary.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GameSummary {
    pub id: i64,
    pub template_id: i64,
    pub name: String,
    pub description: String,
    pub parent_name: String,
    pub thumbname_location: String,
    pub categories: Vec<Category>,
}
