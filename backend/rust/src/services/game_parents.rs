use crate::generated::GameParent;
use crate::generated::repositories::gameParentsRepository::GameParentsRepository;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::sync::Arc;

type Result<T> = std::result::Result<T, datasources::DatasourceError>;

/// The game types the designer ships with; `location` is the id the frontend matches on.
const GAME_PARENTS: [(&str, &str, &str); 3] = [
    ("Scrambled pieces", "Every piece starts in the tray, shuffled.", "scrambled"),
    ("Next pieces in panel", "The panel only offers the next few pieces.", "next-pieces"),
    ("Solve last X pieces", "The puzzle starts nearly done; finish the last few.", "last-x"),
];

pub struct GameParentsService {
    repo: Arc<GameParentsRepository>,
}

impl GameParentsService {
    pub fn new(repo: Arc<GameParentsRepository>) -> Self {
        Self { repo }
    }

    pub async fn list(&self) -> Result<Vec<Value>> {
        let rows: Vec<GameParent> = self.repo.read(None, None).try_collect().await?;
        Ok(rows.iter().filter(|g| !g.is_deleted).map(to_json).collect())
    }

    pub async fn get(&self, id: i64) -> Result<Option<Value>> {
        Ok(self.find(id).await?.as_ref().map(to_json))
    }

    /// Creates a game parent from `{ name, description, location, isEnabled? }`.
    pub async fn create(&self, input: &Value) -> Result<Value> {
        let mut item = GameParent::default();
        apply(&mut item, input);
        Ok(to_json(&self.repo.create(item).await?))
    }

    /// Merges the fields present in `input` into the stored row.
    pub async fn update(&self, id: i64, input: &Value) -> Result<Option<Value>> {
        let Some(mut item) = self.find(id).await? else { return Ok(None) };
        apply(&mut item, input);
        self.repo.update(item.clone(), None).await?;
        Ok(Some(to_json(&item)))
    }

    pub async fn delete(&self, id: i64) -> Result<bool> {
        let Some(item) = self.find(id).await? else { return Ok(false) };
        self.repo.delete(item, None).await?;
        Ok(true)
    }

    /// Adds the built-in parent games that are not there yet; returns the names it added.
    pub async fn add_parent_games(&self) -> Result<Vec<String>> {
        let have: Vec<String> = self.list().await?.iter().filter_map(|g| g["location"].as_str().map(String::from)).collect();
        let mut added = vec![];
        for (name, description, location) in GAME_PARENTS {
            if have.iter().any(|l| l == location) {
                continue;
            }
            self.create(&json!({ "name": name, "description": description, "location": location })).await?;
            added.push(name.to_string());
        }
        Ok(added)
    }

    async fn find(&self, id: i64) -> Result<Option<GameParent>> {
        Ok(self.repo.read_single_by_id(&datasources::Value::Int(id)).await?.filter(|g| !g.is_deleted))
    }
}

fn apply(item: &mut GameParent, input: &Value) {
    if let Some(v) = input["name"].as_str() {
        item.name = v.into();
    }
    if let Some(v) = input["description"].as_str() {
        item.description = v.into();
    }
    if let Some(v) = input["location"].as_str() {
        item.location = v.into();
    }
    if let Some(v) = input["isEnabled"].as_bool() {
        item.is_enabled = v;
    }
}

fn to_json(g: &GameParent) -> Value {
    json!({
        "id": g.id,
        "uuid": g.uuid.to_string(),
        "created": g.created.to_rfc3339(),
        "updated": g.updated.to_rfc3339(),
        "name": g.name,
        "description": g.description,
        "location": g.location,
        "isEnabled": g.is_enabled,
        "isDeleted": g.is_deleted,
        "settings": g.settings,
        "categories": g.categories.iter().map(|c| json!({ "id": c.id, "name": c.name })).collect::<Vec<_>>(),
    })
}
