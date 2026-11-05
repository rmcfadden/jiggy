use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::GameInstanceState;
use std::collections::HashMap;
use std::sync::Arc;
pub fn game_instance_states_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<GameInstanceState>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstanceState".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstanceState".into(), "game_instance_states".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_instance_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("state".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()];
        options.create_properties = Some(vec!["game_instance_id".into(), "user_id".into(), "state".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstanceState".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstanceState".into(), "game_instance_states".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_instance_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("state".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<GameInstanceState>::new(connection, options)
}

pub fn game_instance_states_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstanceState".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstanceState".into(), "game_instance_states".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_instance_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("state".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()];
        options.create_properties = Some(vec!["game_instance_id".into(), "user_id".into(), "state".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GameInstanceState".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GameInstanceState".into(), "game_instance_states".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_instance_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("state".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn game_instance_states_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<GameInstanceState>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "GameInstanceState".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("GameInstanceState".into(), "game_instance_states".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("game_instance_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("state".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_instance_id".into(), "user_id".into(), "state".into()];
        let repo = ReadonlyRepository::<GameInstanceState>::new(connection, options)?;
        Ok(repo)
}
