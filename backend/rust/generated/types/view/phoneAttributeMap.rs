// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View PhoneAttributeMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct PhoneAttributeMap {
    pub key: String,
    pub value: String,
}
