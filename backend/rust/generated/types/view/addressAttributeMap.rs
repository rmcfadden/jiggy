// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View AddressAttributeMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct AddressAttributeMap {
    pub key: String,
    pub value: String,
}
