use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Reviews;
use std::collections::HashMap;
use std::sync::Arc;
pub fn reviews_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Reviews>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Reviews".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Reviews".into(), "reviews".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("rating".into(), SchemaColumn { type_name: "decimal".into(), nullable: false, has_default: false, is_id: false }),
            ("is_approved".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()];
        options.create_properties = Some(vec!["game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Reviews".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Reviews".into(), "reviews".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("rating".into(), SchemaColumn { type_name: "decimal".into(), nullable: false, has_default: false, is_id: false }),
            ("is_approved".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<Reviews>::new(connection, options)
}

pub fn reviews_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Reviews".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Reviews".into(), "reviews".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("rating".into(), SchemaColumn { type_name: "decimal".into(), nullable: false, has_default: false, is_id: false }),
            ("is_approved".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()];
        options.create_properties = Some(vec!["game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Reviews".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Reviews".into(), "reviews".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("rating".into(), SchemaColumn { type_name: "decimal".into(), nullable: false, has_default: false, is_id: false }),
            ("is_approved".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn reviews_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Reviews>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Reviews".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Reviews".into(), "reviews".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("rating".into(), SchemaColumn { type_name: "decimal".into(), nullable: false, has_default: false, is_id: false }),
        ("is_approved".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "description".into(), "rating".into(), "is_approved".into()];
        let repo = ReadonlyRepository::<Reviews>::new(connection, options)?;
        Ok(repo)
}
