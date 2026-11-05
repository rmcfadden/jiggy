use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Phone;
use super::super::PhoneAttribute;
use super::super::Label;
use super::super::PhoneLabel;
use super::super::PhoneType;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct PhonesRepository {
    pub repo: Arc<CRUDRepository<Phone>>,
    pub phone_attribute: Arc<CRUDRepository<PhoneAttribute>>,
    pub label: Arc<CRUDRepository<Label>>,
    pub phone_label: Arc<CRUDRepository<PhoneLabel>>,
    pub phone_type: Arc<CRUDRepository<PhoneType>>,
}

impl PhonesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Phone".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Phone".into(), "phones".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("extention".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
            ("is_verified".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()];
        options.create_properties = Some(vec!["phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options.update_properties = Some(vec!["uuid".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
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
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("extention".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
            ("is_verified".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let phone_attribute = Arc::new(super::phoneAttributesRepository::phone_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let phone_label = Arc::new(super::phoneLabelsRepository::phone_labels_repository(Arc::clone(&connection))?);
        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Phone>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "phone_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&phone_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("phone_id", "label_id")), Arc::clone(&label), Arc::clone(&phone_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(Self { repo: Arc::new(repo), phone_attribute, label, phone_label, phone_type })
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
            ("Phone".into(), "phones".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("extention".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
            ("is_verified".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()];
        options.create_properties = Some(vec!["phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options.update_properties = Some(vec!["uuid".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
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
            ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("extention".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
            ("is_verified".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let phone_attribute = Arc::new(super::phoneAttributesRepository::phone_attributes_row_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_row_repository(Arc::clone(&connection))?);
        let phone_label = Arc::new(super::phoneLabelsRepository::phone_labels_row_repository(Arc::clone(&connection))?);
        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "phone_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&phone_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("phone_id", "label_id")), Arc::clone(&label), Arc::clone(&phone_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(repo)
}

pub fn phones_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Phone>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Phone".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Phone".into(), "phones".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("phone_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("number".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("extention".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
        ("is_verified".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "phone_type_id".into(), "contact_id".into(), "number".into(), "display_name".into(), "extention".into(), "is_primary".into(), "is_verified".into()];
        let phone_attribute = Arc::new(super::phoneAttributesRepository::phone_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let phone_type = Arc::new(super::phoneTypesRepository::phone_types_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Phone>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "phone_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&phone_attribute), None);
        repo.add_enriched(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&label), None);
        repo.add_enriched(Enrichment::new("phone_type_name", "phone_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&phone_type), None);
        Ok(repo)
}
