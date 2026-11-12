// schema-version: 1.0
#[allow(unused_imports)]
use super::*;
/// View GamePlay.
#[derive(Clone, Debug, PartialEq, datasources::Facet)]
#[facet(crate = ::datasources::facet)]
pub struct GamePlay {
    pub id: i64,
    pub uuid: datasources::uuid::Uuid,
    pub created: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub updated: datasources::chrono::DateTime<datasources::chrono::Utc>,
    pub version: Vec<u8>,
    pub game_id: i64,
    pub user_id: i64,
    pub finished: Option<datasources::chrono::DateTime<datasources::chrono::Utc>>,
    pub states: Vec<GamePlayState>,
    pub actions: Vec<GamePlayAction>,
    pub users: Vec<User>,
}
impl Default for GamePlay {
    fn default() -> Self {
        Self {
            id: 0,
            uuid: datasources::uuid::Uuid::new_v4(),
            created: datasources::chrono::Utc::now(),
            updated: datasources::chrono::Utc::now(),
            version: vec![0],
            game_id: 0,
            user_id: 0,
            finished: None,
            states: vec![],
            actions: vec![],
            users: vec![],
        }
    }
}
