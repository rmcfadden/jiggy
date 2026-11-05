use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Contact;
use super::super::Address;
use super::super::Email;
use super::super::Phone;
use super::super::ContactAttribute;
use super::super::Label;
use super::super::ContactLabel;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct ContactsRepository {
    pub repo: Arc<CRUDRepository<Contact>>,
    pub address: Arc<CRUDRepository<Address>>,
    pub email: Arc<CRUDRepository<Email>>,
    pub phone: Arc<CRUDRepository<Phone>>,
    pub contact_attribute: Arc<CRUDRepository<ContactAttribute>>,
    pub label: Arc<CRUDRepository<Label>>,
    pub contact_label: Arc<CRUDRepository<ContactLabel>>,
}

impl ContactsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Contact".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Contact".into(), "contacts".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("given_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("additional_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("pronunciation".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("family_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("nick_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("job_title".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("gender_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("organization".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_starred".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_favorite".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()];
        options.create_properties = Some(vec!["name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Contact".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Contact".into(), "contact_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("given_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("additional_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("pronunciation".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("family_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("nick_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("job_title".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("gender_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("organization".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_starred".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_favorite".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address = Arc::new(super::addressesRepository::addresses_repository(Arc::clone(&connection))?);
        let email = Arc::new(super::emailsRepository::emails_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_repository(Arc::clone(&connection))?);
        let contact_attribute = Arc::new(super::contactAttributesRepository::contact_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let contact_label = Arc::new(super::contactLabelsRepository::contact_labels_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Contact>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("emails", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&email), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("attributes", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("contact_id", "label_id")), Arc::clone(&label), Arc::clone(&contact_label) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { repo: Arc::new(repo), address, email, phone, contact_attribute, label, contact_label })
    }
}

impl Deref for ContactsRepository {
    type Target = CRUDRepository<Contact>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn contacts_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Contact>> {
    Arc::try_unwrap(ContactsRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn contacts_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Contact".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Contact".into(), "contacts".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("given_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("additional_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("pronunciation".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("family_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("nick_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("job_title".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("gender_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("organization".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_starred".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_favorite".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()];
        options.create_properties = Some(vec!["name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Contact".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Contact".into(), "contact_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("given_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("additional_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("pronunciation".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("family_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("nick_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("job_title".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("gender_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("organization".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("is_starred".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_favorite".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address = Arc::new(super::addressesRepository::addresses_row_repository(Arc::clone(&connection))?);
        let email = Arc::new(super::emailsRepository::emails_row_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_row_repository(Arc::clone(&connection))?);
        let contact_attribute = Arc::new(super::contactAttributesRepository::contact_attributes_row_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_row_repository(Arc::clone(&connection))?);
        let contact_label = Arc::new(super::contactLabelsRepository::contact_labels_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("emails", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&email), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("attributes", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("contact_id", "label_id")), Arc::clone(&label), Arc::clone(&contact_label) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}

pub fn contacts_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Contact>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Contact".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Contact".into(), "contacts".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("given_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("additional_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("pronunciation".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("family_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("nick_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("job_title".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("gender_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("organization".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("is_starred".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("is_favorite".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "given_name".into(), "additional_name".into(), "pronunciation".into(), "family_name".into(), "nick_name".into(), "job_title".into(), "gender_type_id".into(), "organization".into(), "is_starred".into(), "is_favorite".into(), "is_deleted".into(), "user_id".into()];
        let address = Arc::new(super::addressesRepository::addresses_repository(Arc::clone(&connection))?);
        let email = Arc::new(super::emailsRepository::emails_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_repository(Arc::clone(&connection))?);
        let contact_attribute = Arc::new(super::contactAttributesRepository::contact_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Contact>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("emails", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&email), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("attributes", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_attribute), None);
        repo.add_enriched(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&label), None);
        Ok(repo)
}
