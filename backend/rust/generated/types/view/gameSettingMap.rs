// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View GameSettingMap.
#[derive(Clone, Debug, PartialEq, Default, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GameSettingMap {
    pub key: String,
    pub value: String,
}
