use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::PhoneAttribute;
use std::collections::HashMap;
use std::sync::Arc;
pub fn phone_attributes_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<PhoneAttribute>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "PhoneAttribute".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("PhoneAttribute".into(), "phone_attributes".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("value".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()];
        options.create_properties = Some(vec!["phone_id".into(), "name".into(), "value".into()]);
        options.update_properties = Some(vec!["uuid".into(), "phone_id".into(), "name".into(), "value".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "PhoneAttribute".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("PhoneAttribute".into(), "phone_attributes".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("value".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<PhoneAttribute>::new(connection, options)
}

pub fn phone_attributes_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "PhoneAttribute".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("PhoneAttribute".into(), "phone_attributes".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("value".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()];
        options.create_properties = Some(vec!["phone_id".into(), "name".into(), "value".into()]);
        options.update_properties = Some(vec!["uuid".into(), "phone_id".into(), "name".into(), "value".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "PhoneAttribute".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("PhoneAttribute".into(), "phone_attributes".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("value".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn phone_attributes_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<PhoneAttribute>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "PhoneAttribute".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("PhoneAttribute".into(), "phone_attributes".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("phone_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("value".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_id".into(), "name".into(), "value".into()];
        let repo = ReadonlyRepository::<PhoneAttribute>::new(connection, options)?;
        Ok(repo)
}
