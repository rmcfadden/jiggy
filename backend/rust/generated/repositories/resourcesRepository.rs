use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Resource;
use super::super::MimeType;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct ResourcesRepository {
    pub repo: Arc<CRUDRepository<Resource>>,
    pub mime_type: Arc<CRUDRepository<MimeType>>,
}

impl ResourcesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Resource".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Resource".into(), "resource_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("resource_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("mime_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Resource".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Resource".into(), "resource_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("resource_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("mime_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let mime_type = Arc::new(super::mimeTypesRepository::mime_types_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Resource>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("mime_type_name", "mime_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&mime_type), None);
        Ok(Self { repo: Arc::new(repo), mime_type })
    }
}

impl Deref for ResourcesRepository {
    type Target = CRUDRepository<Resource>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn resources_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Resource>> {
    Arc::try_unwrap(ResourcesRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn resources_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Resource".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Resource".into(), "resource_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("resource_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("mime_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Resource".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Resource".into(), "resource_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("resource_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("mime_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let mime_type = Arc::new(super::mimeTypesRepository::mime_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("mime_type_name", "mime_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&mime_type), None);
        Ok(repo)
}

pub fn resources_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Resource>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Resource".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Resource".into(), "resource_bases".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("resource_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("mime_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("description".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("location".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "resource_name".into(), "mime_type_id".into(), "description".into(), "location".into(), "is_enabled".into(), "is_deleted".into()];
        let mime_type = Arc::new(super::mimeTypesRepository::mime_types_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Resource>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("mime_type_name", "mime_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&mime_type), None);
        Ok(repo)
}
