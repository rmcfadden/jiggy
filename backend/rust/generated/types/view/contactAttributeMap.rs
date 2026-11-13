// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View ContactAttributeMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct ContactAttributeMap {
    pub key: String,
    pub value: String,
}
