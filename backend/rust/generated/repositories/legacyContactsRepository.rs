use datasources::{Connection, CRUDRepository, CRUDRepositoryOptions, DictionaryMapper, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::LegacyContact;
use std::collections::HashMap;
use std::sync::Arc;
pub fn legacy_contacts_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<LegacyContact>> {
    let mut options = CRUDRepositoryOptions::default();
    options.entity = "LegacyContact".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("LegacyContact".into(), "legacy_contacts".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("key".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ("imported_at".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
    ]));
    options.ids = vec![];
    options.read_properties = vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()];
    options.create_properties = Some(vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()]);
    options.update_properties = Some(vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()]);

    CRUDRepository::<LegacyContact>::new(connection, options)
}

pub fn legacy_contacts_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let mut options = CRUDRepositoryOptions::default();
    options.entity = "LegacyContact".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("LegacyContact".into(), "legacy_contacts".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("key".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ("imported_at".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
    ]));
    options.ids = vec![];
    options.read_properties = vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()];
    options.create_properties = Some(vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()]);
    options.update_properties = Some(vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()]);

    CRUDRepository::<datasources::Row>::new(connection, options)
}

pub fn legacy_contacts_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<LegacyContact>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "LegacyContact".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("LegacyContact".into(), "legacy_contacts".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("key".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ("imported_at".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["key".into(), "first_name".into(), "last_name".into(), "email".into(), "imported_at".into()];
        let repo = ReadonlyRepository::<LegacyContact>::new(connection, options)?;
        Ok(repo)
}
