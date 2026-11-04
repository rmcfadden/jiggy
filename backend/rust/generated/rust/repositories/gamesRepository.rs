use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Games;
use super::super::GameSettings;
use super::super::Categories;
use super::super::GamesCategories;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct GamesRepository {
    pub repo: Arc<CRUDRepository<Games>>,
    pub game_settings: Arc<CRUDRepository<GameSettings>>,
    pub categories: Arc<CRUDRepository<Categories>>,
    pub games_categories: Arc<CRUDRepository<GamesCategories>>,
}

impl GamesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Games".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Games".into(), "games_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Games".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Games".into(), "games_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_settings = Arc::new(super::gameSettingsRepository::game_settings_repository(Arc::clone(&connection))?);
        let categories = Arc::new(super::categoriesRepository::categories_repository(Arc::clone(&connection))?);
        let games_categories = Arc::new(super::gamesCategoriesRepository::games_categories_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Games>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_settings), None);
        repo.add_linked(Enrichment::new("categories", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("game_id", "category_id")), Arc::clone(&categories), Arc::clone(&games_categories) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { repo: Arc::new(repo), game_settings, categories, games_categories })
    }
}

impl Deref for GamesRepository {
    type Target = CRUDRepository<Games>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn games_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Games>> {
    Arc::try_unwrap(GamesRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn games_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Games".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Games".into(), "games_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Games".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Games".into(), "games_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_settings = Arc::new(super::gameSettingsRepository::game_settings_row_repository(Arc::clone(&connection))?);
        let categories = Arc::new(super::categoriesRepository::categories_row_repository(Arc::clone(&connection))?);
        let games_categories = Arc::new(super::gamesCategoriesRepository::games_categories_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_settings), None);
        repo.add_linked(Enrichment::new("categories", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("game_id", "category_id")), Arc::clone(&categories), Arc::clone(&games_categories) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}

pub fn games_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Games>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Games".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Games".into(), "games_bases".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        let game_settings = Arc::new(super::gameSettingsRepository::game_settings_repository(Arc::clone(&connection))?);
        let categories = Arc::new(super::categoriesRepository::categories_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Games>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_settings), None);
        repo.add_enriched(Enrichment::new("categories", "id", "id", None, EnrichmentPropertyType::List), Arc::clone(&categories), None);
        Ok(repo)
}
