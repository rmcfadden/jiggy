use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::GameInstance;
use super::super::GameInstanceSetting;
use super::super::Category;
use super::super::GameInstanceCategory;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct GameInstancesRepository {
    pub repo: Arc<CRUDRepository<GameInstance>>,
    pub game_instance_setting: Arc<CRUDRepository<GameInstanceSetting>>,
    pub category: Arc<CRUDRepository<Category>>,
    pub game_instance_category: Arc<CRUDRepository<GameInstanceCategory>>,
}

impl GameInstancesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstance".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstance".into(), "game_instances".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("game_config_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstance".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstance".into(), "game_instances".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("game_config_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_instance_setting = Arc::new(super::gameInstanceSettingsRepository::game_instance_settings_repository(Arc::clone(&connection))?);
        let category = Arc::new(super::categoriesRepository::categories_repository(Arc::clone(&connection))?);
        let game_instance_category = Arc::new(super::gameInstanceCategoriesRepository::game_instance_categories_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<GameInstance>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_instance_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_instance_setting), None);
        repo.add_linked(Enrichment::new("categories", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("game_instance_id", "category_id")), Arc::clone(&category), Arc::clone(&game_instance_category) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { repo: Arc::new(repo), game_instance_setting, category, game_instance_category })
    }
}

impl Deref for GameInstancesRepository {
    type Target = CRUDRepository<GameInstance>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn game_instances_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<GameInstance>> {
    Arc::try_unwrap(GameInstancesRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn game_instances_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstance".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstance".into(), "game_instances".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("game_config_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstance".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstance".into(), "game_instances".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("game_config_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_instance_setting = Arc::new(super::gameInstanceSettingsRepository::game_instance_settings_row_repository(Arc::clone(&connection))?);
        let category = Arc::new(super::categoriesRepository::categories_row_repository(Arc::clone(&connection))?);
        let game_instance_category = Arc::new(super::gameInstanceCategoriesRepository::game_instance_categories_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_instance_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_instance_setting), None);
        repo.add_linked(Enrichment::new("categories", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("game_instance_id", "category_id")), Arc::clone(&category), Arc::clone(&game_instance_category) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}

pub fn game_instances_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<GameInstance>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "GameInstance".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("GameInstance".into(), "game_instances".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("game_config_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "game_id".into(), "game_config_id".into(), "is_deleted".into(), "is_enabled".into()];
        let game_instance_setting = Arc::new(super::gameInstanceSettingsRepository::game_instance_settings_repository(Arc::clone(&connection))?);
        let category = Arc::new(super::categoriesRepository::categories_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<GameInstance>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "game_instance_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&game_instance_setting), None);
        repo.add_enriched(Enrichment::new("categories", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&category), None);
        Ok(repo)
}
