use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Phone;
use super::super::PhoneType;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct PhonesRepository {
    pub repo: Arc<CRUDRepository<Phone>>,
    pub phone_type: Arc<CRUDRepository<PhoneType>>,
}

impl PhonesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Phone".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Phone".into(), "phone_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("label".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()];
        options.create_properties = Some(vec!["contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Phone".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Phone".into(), "phone_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("label".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Phone>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(Self { repo: Arc::new(repo), phone_type })
    }
}

impl Deref for PhonesRepository {
    type Target = CRUDRepository<Phone>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn phones_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Phone>> {
    Arc::try_unwrap(PhonesRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn phones_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Phone".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Phone".into(), "phone_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("label".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()];
        options.create_properties = Some(vec!["contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Phone".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Phone".into(), "phone_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("label".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(repo)
}

pub fn phones_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Phone>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Phone".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Phone".into(), "phone_bases".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("label".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "phone_type_id".into(), "number".into(), "label".into()];
        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Phone>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(repo)
}
