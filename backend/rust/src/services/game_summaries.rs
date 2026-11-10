use crate::services::images::{ImageError, ImagesService};
use datasources::{
    Connection, DictionaryMapper, Join, OrderBy, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Row, SelectStatement, SelectStatementOptions, Value,
};
use futures_util::TryStreamExt;
use serde_json::json;
use std::collections::BTreeMap;
use std::sync::Arc;

type Result<T> = std::result::Result<T, ImageError>;

/// Entity names the join statement uses, mapped to their tables.
const ENTITIES: [(&str, &str); 6] = [
    ("Game", "games"),
    ("GameParent", "game_parents"),
    ("PuzzleGame", "puzzle_games"),
    ("Resource", "resources"),
    ("GameCategory", "game_categories"),
    ("Category", "categories"),
];

/// Property names to columns. A path such as `GameParent.name` is qualified by its entity (`game_parents.name`).
const PROPERTIES: [(&str, &str); 7] = [
    ("gameParentId", "game_parent_id"),
    ("gameId", "game_id"),
    ("imageId", "image_id"),
    ("templateId", "template_id"),
    ("categoryId", "category_id"),
    ("isDeleted", "is_deleted"),
    ("isEnabled", "is_enabled"),
];

/// One enabled, undeleted game with its categories, as the list API returns it.
pub struct GameSummary {
    pub id: i64,
    pub template_id: i64,
    pub name: String,
    pub description: String,
    pub parent_name: String,
    pub thumbname_location: String,
    pub categories: Vec<(i64, String)>,
}

impl GameSummary {
    pub fn to_json(&self) -> serde_json::Value {
        json!({
            "id": self.id,
            "templateId": self.template_id,
            "name": self.name,
            "description": self.description,
            "parentName": self.parent_name,
            "thumbnameLocation": self.thumbname_location,
            "categories": self.categories.iter().map(|(id, name)| json!({ "id": id, "name": name })).collect::<Vec<_>>(),
        })
    }
}

/// Read-only summaries of the playable games, from one join over games, game parents, puzzles, images and
/// categories. The thumbnail is a second resource named `{image}_thumbnail`, which a join cannot reach, so it is
/// filled from `ImagesService::thumbnail_urls` (the image itself when there is none).
pub struct GameSummariesService {
    rows: ReadonlyRepository<Row>,
    images: Arc<ImagesService>,
}

impl GameSummariesService {
    pub fn new(connection: Arc<dyn Connection>, images: Arc<ImagesService>) -> Result<Self> {
        let mut options = ReadonlyRepositoryMappingOptions::default();
        options.entity = "Game".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new(ENTITIES.map(|(a, b)| (a.into(), b.into())))));
        options.property_mappings = Some(Arc::new(DictionaryMapper::new(PROPERTIES.map(|(a, b)| (a.into(), b.into())))));
        Ok(Self { rows: ReadonlyRepository::<Row>::new(connection, options).map_err(ImageError::from)?, images })
    }

    /// Every enabled, undeleted game by id, with its categories by id.
    pub async fn read(&self) -> Result<Vec<GameSummary>> {
        let thumbs = self.images.thumbnail_urls().await?;
        let joins = [
            Join::inner("GameParent", "GameParent.id", "Game.gameParentId"),
            Join::inner("PuzzleGame", "PuzzleGame.gameId", "Game.id"),
            Join::left("Resource", "Resource.id", "PuzzleGame.imageId"),
            Join::left("GameCategory", "GameCategory.gameId", "Game.id"),
            Join::left("Category", "Category.id", "GameCategory.categoryId"),
        ];
        // Fields are paths; each alias is the result-column name the rows are read by.
        let fields = [
            "Game.id", "Game.name", "Game.description", "Game.isDeleted", "Game.isEnabled", "GameParent.name",
            "PuzzleGame.templateId", "PuzzleGame.imageId", "Resource.location", "GameCategory.categoryId", "Category.name",
        ];
        let aliases = [
            Some("id"), Some("name"), Some("description"), Some("gameDeleted"), Some("gameEnabled"), Some("parentName"),
            Some("templateId"), Some("imageId"), Some("imageLocation"), Some("categoryId"), Some("categoryName"),
        ];
        let order_by = [OrderBy::asc("Game.id"), OrderBy::asc("GameCategory.categoryId")];
        let select = SelectStatement::new(SelectStatementOptions {
            table: "Game",
            fields: &fields,
            aliases: &aliases,
            where_clause: None,
            joins: &joins,
            group_by: &[],
            order_by: &order_by,
            limit: None,
            distinct: false,
            having: None,
            offset: None,
        });
        let rows: Vec<Row> = self.rows.read(Some(&select), None).try_collect().await?;
        let mut by_game: BTreeMap<i64, GameSummary> = BTreeMap::new();
        for row in &rows {
            if truthy(row.get("gameDeleted")) || !truthy(row.get("gameEnabled")) {
                continue;
            }
            let Some(id) = int(row.get("id")) else { continue };
            let summary = by_game.entry(id).or_insert_with(|| {
                let thumb = int(row.get("imageId")).and_then(|image| thumbs.get(&image).cloned());
                GameSummary {
                    id,
                    template_id: int(row.get("templateId")).unwrap_or_default(),
                    name: text(row.get("name")),
                    description: text(row.get("description")),
                    parent_name: text(row.get("parentName")),
                    thumbname_location: thumb.unwrap_or_else(|| text(row.get("imageLocation"))),
                    categories: vec![],
                }
            });
            if let Some(category) = int(row.get("categoryId")) {
                summary.categories.push((category, text(row.get("categoryName"))));
            }
        }
        let mut list: Vec<GameSummary> = by_game.into_values().collect();
        for summary in &mut list {
            summary.categories.sort();
        }
        Ok(list)
    }
}

fn int(value: Option<&Value>) -> Option<i64> {
    match value {
        Some(Value::Int(n)) => Some(*n),
        _ => None,
    }
}

fn truthy(value: Option<&Value>) -> bool {
    match value {
        Some(Value::Bool(flag)) => *flag,
        Some(Value::Int(n)) => *n != 0,
        _ => false,
    }
}

fn text(value: Option<&Value>) -> String {
    match value {
        Some(Value::Text(s)) => s.clone(),
        _ => String::new(),
    }
}
