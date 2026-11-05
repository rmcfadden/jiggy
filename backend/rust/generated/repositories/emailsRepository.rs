use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Email;
use super::super::EmailAttribute;
use super::super::Label;
use super::super::EmailLabel;
use super::super::EmailType;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct EmailsRepository {
    pub repo: Arc<CRUDRepository<Email>>,
    pub email_attribute: Arc<CRUDRepository<EmailAttribute>>,
    pub label: Arc<CRUDRepository<Label>>,
    pub email_label: Arc<CRUDRepository<EmailLabel>>,
    pub email_type: Arc<CRUDRepository<EmailType>>,
}

impl EmailsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Email".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Email".into(), "emails".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("email_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()];
        options.create_properties = Some(vec!["email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Email".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Email".into(), "email_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("email_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let email_attribute = Arc::new(super::emailAttributesRepository::email_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let email_label = Arc::new(super::emailLabelsRepository::email_labels_repository(Arc::clone(&connection))?);
        let email_type = Arc::new(super::emailTypesRepository::email_types_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Email>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "email_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&email_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("email_id", "label_id")), Arc::clone(&label), Arc::clone(&email_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("email_type_name", "email_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&email_type), None);
        Ok(Self { repo: Arc::new(repo), email_attribute, label, email_label, email_type })
    }
}

impl Deref for EmailsRepository {
    type Target = CRUDRepository<Email>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn emails_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Email>> {
    Arc::try_unwrap(EmailsRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn emails_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Email".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Email".into(), "emails".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("email_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()];
        options.create_properties = Some(vec!["email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Email".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Email".into(), "email_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("email_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let email_attribute = Arc::new(super::emailAttributesRepository::email_attributes_row_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_row_repository(Arc::clone(&connection))?);
        let email_label = Arc::new(super::emailLabelsRepository::email_labels_row_repository(Arc::clone(&connection))?);
        let email_type = Arc::new(super::emailTypesRepository::email_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "email_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&email_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("email_id", "label_id")), Arc::clone(&label), Arc::clone(&email_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("email_type_name", "email_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&email_type), None);
        Ok(repo)
}

pub fn emails_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Email>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Email".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Email".into(), "emails".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("email_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "email_type_id".into(), "contact_id".into(), "address".into(), "display_name".into(), "is_primary".into()];
        let email_attribute = Arc::new(super::emailAttributesRepository::email_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let email_type = Arc::new(super::emailTypesRepository::email_types_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Email>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "email_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&email_attribute), None);
        repo.add_enriched(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&label), None);
        repo.add_enriched(Enrichment::new("email_type_name", "email_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&email_type), None);
        Ok(repo)
}
