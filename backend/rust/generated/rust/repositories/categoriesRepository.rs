use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Categories;
use std::collections::HashMap;
use std::sync::Arc;
pub fn categories_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Categories>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Categories".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Categories".into(), "categories".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Categories".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Categories".into(), "categories".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<Categories>::new(connection, options)
}

pub fn categories_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Categories".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Categories".into(), "categories".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Categories".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Categories".into(), "categories".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn categories_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Categories>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Categories".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Categories".into(), "categories".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "category_id".into(), "name".into(), "description".into(), "is_enabled".into(), "is_deleted".into()];
        let repo = ReadonlyRepository::<Categories>::new(connection, options)?;
        Ok(repo)
}
