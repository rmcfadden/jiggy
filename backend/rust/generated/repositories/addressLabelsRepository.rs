use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::AddressLabel;
use std::collections::HashMap;
use std::sync::Arc;
pub fn address_labels_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<AddressLabel>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AddressLabel".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AddressLabel".into(), "address_labels".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("address_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("label_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "address_id".into(), "label_id".into()];
        options.create_properties = Some(vec!["address_id".into(), "label_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "address_id".into(), "label_id".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AddressLabel".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AddressLabel".into(), "address_labels".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("address_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("label_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "address_id".into(), "label_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "address_id".into(), "label_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "address_id".into(), "label_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<AddressLabel>::new(connection, options)
}

pub fn address_labels_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AddressLabel".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AddressLabel".into(), "address_labels".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("address_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("label_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "address_id".into(), "label_id".into()];
        options.create_properties = Some(vec!["address_id".into(), "label_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "address_id".into(), "label_id".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AddressLabel".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AddressLabel".into(), "address_labels".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("address_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("label_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "address_id".into(), "label_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "address_id".into(), "label_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "address_id".into(), "label_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn address_labels_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<AddressLabel>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "AddressLabel".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("AddressLabel".into(), "address_labels".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("address_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("label_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "address_id".into(), "label_id".into()];
        let repo = ReadonlyRepository::<AddressLabel>::new(connection, options)?;
        Ok(repo)
}
