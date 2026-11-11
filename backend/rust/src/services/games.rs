use crate::generated::repositories::gameCategoriesRepository::GameCategoriesRepository;
use crate::generated::repositories::gamesRepository::GamesRepository;
use crate::generated::{Game, GameCategory};
use crate::services::categories::CategoriesService;
use crate::services::game_parents::GameParentsService;
use crate::services::images::{By, ImagesService};
use crate::services::templates::TemplatesService;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::collections::{BTreeSet, HashMap};
use std::sync::Arc;

const CONFIG_KEY: &str = "config";
/// Setting holding the uuid of the game's template.
const TEMPLATE_KEY: &str = "template_uid";
/// Setting holding the id of the game's background image (a cms resource); absent when it has none.
const IMAGE_KEY: &str = "image_id";
/// Attribute holding the pieces in the game's template (`cols * rows`).
pub const PIECE_COUNT: &str = "pieceCount";

#[derive(Debug)]
pub enum GameError {
    Datasource(datasources::DatasourceError),
    /// A game refers to a parent game, template, image or category that does not exist (or a field is missing).
    Invalid(String),
}

impl From<datasources::DatasourceError> for GameError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Datasource(err)
    }
}

impl From<crate::services::images::ImageError> for GameError {
    fn from(err: crate::services::images::ImageError) -> Self {
        Self::Invalid(format!("images: {err:?}"))
    }
}

type Result<T> = std::result::Result<T, GameError>;

fn invalid<T>(message: impl Into<String>) -> Result<T> {
    Err(GameError::Invalid(message.into()))
}

/// A game is a puzzle described by three things: its `templateId`, its background `imageId` and its `config`
/// (every setting of the designer panel, as JSON). They are stored as game settings (`template_uid`, `image_id`,
/// `config`) without foreign keys, so each game keeps its own template and image.
pub struct GamesService {
    repo: Arc<GamesRepository>,
    game_categories: Arc<GameCategoriesRepository>,
    categories: Arc<CategoriesService>,
    parents: Arc<GameParentsService>,
    templates: Arc<TemplatesService>,
    images: Arc<ImagesService>,
}

impl GamesService {
    pub fn new(
        repo: Arc<GamesRepository>,
        game_categories: Arc<GameCategoriesRepository>,
        categories: Arc<CategoriesService>,
        parents: Arc<GameParentsService>,
        templates: Arc<TemplatesService>,
        images: Arc<ImagesService>,
    ) -> Self {
        Self { repo, game_categories, categories, parents, templates, images }
    }

    /// Every game without its `config`, which `get` loads for the one that is selected.
    pub async fn list(&self) -> Result<Vec<Value>> {
        let template_ids = self.template_ids().await?;
        let categories = self.categories_by_game().await?;
        let thumbs = self.images.thumbnail_urls().await.map_err(GameError::from)?;
        let parents = self.parent_locations().await?;
        let rows: Vec<Game> = self.repo.read(None, None).try_collect().await?;
        Ok(rows
            .iter()
            .filter(|g| !g.is_deleted)
            .filter_map(|g| {
                let template_id = *template_ids.get(g.settings.get(TEMPLATE_KEY)?)?;
                Some(to_json(g, template_id, parents.get(&g.game_parent_id).map_or("", String::as_str), categories.get(&g.id).cloned().unwrap_or_default(), &thumbs, false))
            })
            .collect())
    }

    pub async fn get(&self, id: i64) -> Result<Option<Value>> {
        let Some(game) = self.find(id).await? else { return Ok(None) };
        let template_ids = self.template_ids().await?;
        let Some(template_id) = game.settings.get(TEMPLATE_KEY).and_then(|uid| template_ids.get(uid)).copied() else { return Ok(None) };
        let parents = self.parent_locations().await?;
        let categories = self.categories_by_game().await?.remove(&id).unwrap_or_default();
        let thumbs = self.images.thumbnail_urls().await.map_err(GameError::from)?;
        Ok(Some(to_json(&game, template_id, parents.get(&game.game_parent_id).map_or("", String::as_str), categories, &thumbs, true)))
    }

    /// Creates the game from `{ name, description, parent, templateId, imageId, config, categoryIds }`;
    /// the template, image, parent and categories must exist.
    pub async fn create(&self, input: &Value) -> Result<Value> {
        let Some(location) = input["parent"].as_str() else { return invalid("parent is required") };
        let parent_id = self.find_parent(location).await?;
        let Some(template_id) = input["templateId"].as_i64() else { return invalid("templateId is required") };
        let template_uid = self.template_uid(template_id).await?;
        let image_id = input["imageId"].as_i64();
        self.check_image(image_id).await?;
        let category_ids = self.check_categories(&input["categoryIds"]).await?;

        let item = Game {
            name: input["name"].as_str().unwrap_or_default().into(),
            description: input["description"].as_str().unwrap_or_default().into(),
            game_parent_id: parent_id,
            settings: settings(&template_uid, image_id, &input["config"]),
            attributes: self.attributes_of(template_id).await?,
            ..Game::default()
        };
        let created = self.repo.create(item).await?;
        self.set_categories(created.id, category_ids.unwrap_or_default()).await?;
        Ok(self.get(created.id).await?.unwrap_or(Value::Null))
    }

    /// Merges the fields present in `input`; `None` when the game does not exist.
    pub async fn update(&self, id: i64, input: &Value) -> Result<Option<Value>> {
        let Some(mut game) = self.find(id).await? else { return Ok(None) };
        if !game.settings.contains_key(TEMPLATE_KEY) {
            return Ok(None);
        }
        if let Some(location) = input["parent"].as_str() {
            game.game_parent_id = self.find_parent(location).await?;
        }
        if let Some(template_id) = input["templateId"].as_i64() {
            let uid = self.template_uid(template_id).await?;
            game.settings.insert(TEMPLATE_KEY.into(), uid);
            game.attributes.extend(self.attributes_of(template_id).await?);
        }
        if let Some(value) = input.get("imageId") {
            let image_id = value.as_i64();
            self.check_image(image_id).await?;
            match image_id {
                Some(id) => game.settings.insert(IMAGE_KEY.into(), id.to_string()),
                None => game.settings.remove(IMAGE_KEY),
            };
        }
        let category_ids = self.check_categories(&input["categoryIds"]).await?;
        if let Some(v) = input["name"].as_str() {
            game.name = v.into();
        }
        if let Some(v) = input["description"].as_str() {
            game.description = v.into();
        }
        if !input["config"].is_null() {
            game.settings.insert(CONFIG_KEY.into(), input["config"].to_string());
        }
        self.repo.update(game, None).await?;
        if let Some(ids) = category_ids {
            self.set_categories(id, ids).await?;
        }
        self.get(id).await
    }

    /// Gives every game its attributes where they are missing or its template changed behind its back (run by
    /// `setup`); returns the names of the games it updated.
    pub async fn add_attributes(&self) -> Result<Vec<String>> {
        let template_ids = self.template_ids().await?;
        let games: Vec<Game> = self.repo.read(None, None).try_collect().await?;
        let mut updated = vec![];
        for mut game in games {
            let Some(template_id) = game.settings.get(TEMPLATE_KEY).and_then(|uid| template_ids.get(uid)).copied() else { continue };
            if game.is_deleted {
                continue;
            }
            let wanted = self.attributes_of(template_id).await?;
            if wanted.iter().all(|(k, v)| game.attributes.get(k) == Some(v)) {
                continue;
            }
            game.attributes.extend(wanted);
            let name = game.name.clone();
            self.repo.update(game, None).await?;
            updated.push(name);
        }
        Ok(updated)
    }

    /// The attributes a game gets from its template: `pieceCount` is `cols * rows` of the template's JSON.
    async fn attributes_of(&self, template_id: i64) -> Result<HashMap<String, String>> {
        let template = self.templates.get(template_id).await.map_err(|_| GameError::Invalid("could not read template".into()))?;
        let content = template.as_ref().map(|t| &t["content"]).unwrap_or(&Value::Null);
        let pieces = content["cols"].as_i64().unwrap_or(0) * content["rows"].as_i64().unwrap_or(0);
        Ok(HashMap::from([(PIECE_COUNT.to_string(), pieces.to_string())]))
    }

    pub async fn delete(&self, id: i64) -> Result<bool> {
        let Some(game) = self.find(id).await? else { return Ok(false) };
        self.set_categories(id, BTreeSet::new()).await?;
        self.repo.delete(game, None).await?;
        Ok(true)
    }

    /// Creates the sample puzzles in the seed file at `path` whose game name is missing; existing games are never
    /// changed. The parent, template, image and categories of each entry must already exist (run the earlier setup
    /// steps first), otherwise it fails naming the entry. Returns the names added.
    pub async fn add_puzzles(&self, path: &std::path::Path) -> std::result::Result<Vec<String>, Box<dyn std::error::Error>> {
        let seeds: Vec<Value> = serde_json::from_str(&std::fs::read_to_string(path)?)?;
        let present: Vec<String> = self.repo.read(None, None).try_collect::<Vec<Game>>().await?.into_iter().map(|g| g.name).collect();
        let templates: HashMap<String, i64> = self
            .templates
            .list(Some("jigsaw"))
            .await
            .map_err(|_| "could not read templates")?
            .iter()
            .filter_map(|t| Some((t["name"].as_str()?.to_string(), t["id"].as_i64()?)))
            .collect();
        let categories: HashMap<String, i64> = self
            .categories
            .flat()
            .await?
            .iter()
            .filter(|c| !c["parentId"].is_null())
            .filter_map(|c| Some((c["name"].as_str()?.to_lowercase(), c["id"].as_i64()?)))
            .collect();
        let mut added = vec![];
        for seed in &seeds {
            let name = seed["name"].as_str().unwrap_or_default();
            let slug = seed["slug"].as_str().unwrap_or_default();
            if present.iter().any(|n| n == name) {
                continue;
            }
            let template = seed["template"].as_str().unwrap_or_default();
            let Some(template_id) = templates.get(template) else { return Err(format!("puzzle '{slug}': unknown template: {template}").into()) };
            let Some(image) = self.images.find(&By { name: Some(slug.into()), ..By::default() }).await.map_err(|err| format!("{err:?}"))? else {
                return Err(format!("puzzle '{slug}': unknown image: {slug}").into());
            };
            let mut ids = vec![];
            for category in seed["categories"].as_array().into_iter().flatten().filter_map(Value::as_str) {
                let Some(id) = categories.get(&category.to_lowercase()) else { return Err(format!("puzzle '{slug}': unknown category: {category}").into()) };
                ids.push(*id);
            }
            let input = json!({
                "name": name, "description": seed["description"], "parent": seed["parent"],
                "templateId": template_id, "imageId": image["id"], "config": seed["setup"], "categoryIds": ids,
            });
            self.create(&input).await.map_err(|err| format!("puzzle '{slug}': {err:?}"))?;
            added.push(name.to_string());
        }
        Ok(added)
    }

    async fn find(&self, id: i64) -> Result<Option<Game>> {
        Ok(self.repo.read_single_by_id(&datasources::Value::Int(id)).await?.filter(|g| !g.is_deleted))
    }

    async fn categories_by_game(&self) -> Result<HashMap<i64, Vec<i64>>> {
        let rows: Vec<GameCategory> = self.game_categories.read(None, None).try_collect().await?;
        let mut map: HashMap<i64, Vec<i64>> = HashMap::new();
        for row in rows {
            map.entry(row.game_id).or_default().push(row.category_id);
        }
        map.values_mut().for_each(|ids| ids.sort());
        Ok(map)
    }

    /// Makes the game belong to exactly `ids`, adding and removing only the rows that differ.
    async fn set_categories(&self, game_id: i64, ids: BTreeSet<i64>) -> Result<()> {
        let rows: Vec<GameCategory> = self.game_categories.read(None, None).try_collect().await?;
        let mut present = BTreeSet::new();
        for row in rows.into_iter().filter(|r| r.game_id == game_id) {
            if ids.contains(&row.category_id) && present.insert(row.category_id) {
                continue;
            }
            self.game_categories.delete(row, None).await?;
        }
        for id in ids.difference(&present) {
            self.game_categories.create(GameCategory { game_id, category_id: *id, ..GameCategory::default() }).await?;
        }
        Ok(())
    }

    /// The ids in `value` (an array), after checking each is a known category; `None` when `value` is absent.
    async fn check_categories(&self, value: &Value) -> Result<Option<BTreeSet<i64>>> {
        let Some(list) = value.as_array() else { return Ok(None) };
        let known: BTreeSet<i64> = self.categories.flat().await?.iter().filter_map(|c| c["id"].as_i64()).collect();
        let mut ids = BTreeSet::new();
        for id in list.iter().filter_map(Value::as_i64) {
            if !known.contains(&id) {
                return invalid(format!("unknown category: {id}"));
            }
            ids.insert(id);
        }
        Ok(Some(ids))
    }

    async fn find_parent(&self, location: &str) -> Result<i64> {
        let parents = self.parents.list().await?;
        match parents.iter().find(|p| p["location"] == location) {
            Some(parent) => Ok(parent["id"].as_i64().unwrap_or_default()),
            None => invalid(format!("unknown parent game: {location}")),
        }
    }

    async fn parent_locations(&self) -> Result<HashMap<i64, String>> {
        Ok(self.parents.list().await?.iter().filter_map(|p| Some((p["id"].as_i64()?, p["location"].as_str()?.to_string()))).collect())
    }

    /// The uuid stored in a game's `template_uid` setting; fails when the template does not exist.
    async fn template_uid(&self, id: i64) -> Result<String> {
        match self.templates.get(id).await {
            Ok(Some(template)) => Ok(template["uuid"].as_str().unwrap_or_default().to_string()),
            Ok(None) => invalid(format!("unknown template: {id}")),
            Err(_) => invalid("could not read templates"),
        }
    }

    /// Template uuid to template id.
    async fn template_ids(&self) -> Result<HashMap<String, i64>> {
        let templates = self.templates.list(None).await.map_err(|_| GameError::Invalid("could not read templates".into()))?;
        Ok(templates.iter().filter_map(|t| Some((t["uuid"].as_str()?.to_string(), t["id"].as_i64()?))).collect())
    }

    async fn check_image(&self, id: Option<i64>) -> Result<()> {
        let Some(id) = id else { return Ok(()) };
        if self.images.find(&By { id: Some(id), ..By::default() }).await.map_err(GameError::from)?.is_none() {
            return invalid(format!("unknown image: {id}"));
        }
        Ok(())
    }
}

fn settings(template_uid: &str, image_id: Option<i64>, config: &Value) -> HashMap<String, String> {
    let mut map = HashMap::from([(TEMPLATE_KEY.to_string(), template_uid.to_string())]);
    if let Some(id) = image_id {
        map.insert(IMAGE_KEY.to_string(), id.to_string());
    }
    if !config.is_null() {
        map.insert(CONFIG_KEY.to_string(), config.to_string());
    }
    map
}

fn to_json(game: &Game, template_id: i64, parent: &str, category_ids: Vec<i64>, thumbs: &HashMap<i64, String>, with_config: bool) -> Value {
    let image_id = game.settings.get(IMAGE_KEY).and_then(|s| s.parse::<i64>().ok());
    let mut value = json!({
        "id": game.id,
        "uuid": game.uuid.to_string(),
        "name": game.name,
        "description": game.description,
        "parent": parent,
        "templateId": template_id,
        "imageId": image_id,
        "categoryIds": category_ids,
        "thumbnailUrl": image_id.and_then(|id| thumbs.get(&id)),
        "created": game.created.to_rfc3339(),
        "updated": game.updated.to_rfc3339(),
    });
    if with_config {
        value["config"] = game.settings.get(CONFIG_KEY).and_then(|s| serde_json::from_str::<Value>(s).ok()).unwrap_or_else(|| json!({}));
    }
    value
}
