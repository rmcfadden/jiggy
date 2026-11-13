// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View GameAttributeMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GameAttributeMap {
    pub key: String,
    pub value: String,
}
