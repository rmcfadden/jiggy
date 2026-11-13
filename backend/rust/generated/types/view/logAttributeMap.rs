// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View LogAttributeMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct LogAttributeMap {
    pub key: String,
    pub value: String,
}
