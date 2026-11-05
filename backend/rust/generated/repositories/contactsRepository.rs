use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Contact;
use super::super::Address;
use super::super::Phone;
use super::super::ContactSetting;
use super::super::ContactPreference;
use super::super::ContactSource;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct ContactsRepository {
    pub repo: Arc<CRUDRepository<Contact>>,
    pub address: Arc<CRUDRepository<Address>>,
    pub phone: Arc<CRUDRepository<Phone>>,
    pub contact_setting: Arc<CRUDRepository<ContactSetting>>,
    pub contact_preference: Arc<CRUDRepository<ContactPreference>>,
    pub contact_source: Arc<CRUDRepository<ContactSource>>,
}

impl ContactsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
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
            ("contact_source_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("notes".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()];
        options.create_properties = Some(vec!["contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
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
            ("contact_source_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("notes".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address = Arc::new(super::addressesRepository::addresses_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_repository(Arc::clone(&connection))?);
        let contact_setting = Arc::new(super::contactSettingsRepository::contact_settings_repository(Arc::clone(&connection))?);
        let contact_preference = Arc::new(super::contactPreferencesRepository::contact_preferences_repository(Arc::clone(&connection))?);
        let contact_source = Arc::new(super::contactSourcesRepository::contact_sources_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Contact>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("settings", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_setting), None);
        repo.add_enriched(Enrichment::new("prefs", "id", "contact_id", None, EnrichmentPropertyType::Dictionary), Arc::clone(&contact_preference), None);
        repo.add_enriched(Enrichment::new("contact_source_name", "contact_source_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&contact_source), None);
        Ok(Self { repo: Arc::new(repo), address, phone, contact_setting, contact_preference, contact_source })
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
            ("Contact".into(), "contact_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_source_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("notes".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()];
        options.create_properties = Some(vec!["contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
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
            ("contact_source_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("notes".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address = Arc::new(super::addressesRepository::addresses_row_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_row_repository(Arc::clone(&connection))?);
        let contact_setting = Arc::new(super::contactSettingsRepository::contact_settings_row_repository(Arc::clone(&connection))?);
        let contact_preference = Arc::new(super::contactPreferencesRepository::contact_preferences_row_repository(Arc::clone(&connection))?);
        let contact_source = Arc::new(super::contactSourcesRepository::contact_sources_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("settings", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_setting), None);
        repo.add_enriched(Enrichment::new("prefs", "id", "contact_id", None, EnrichmentPropertyType::Dictionary), Arc::clone(&contact_preference), None);
        repo.add_enriched(Enrichment::new("contact_source_name", "contact_source_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&contact_source), None);
        Ok(repo)
}

pub fn contacts_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Contact>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
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
        ("contact_source_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("first_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("last_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("email".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ("notes".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
        ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_source_id".into(), "first_name".into(), "last_name".into(), "email".into(), "notes".into(), "user_id".into()];
        let address = Arc::new(super::addressesRepository::addresses_repository(Arc::clone(&connection))?);
        let phone = Arc::new(super::phonesRepository::phones_repository(Arc::clone(&connection))?);
        let contact_setting = Arc::new(super::contactSettingsRepository::contact_settings_repository(Arc::clone(&connection))?);
        let contact_preference = Arc::new(super::contactPreferencesRepository::contact_preferences_repository(Arc::clone(&connection))?);
        let contact_source = Arc::new(super::contactSourcesRepository::contact_sources_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Contact>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("addresses", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&address), None);
        repo.add_enriched(Enrichment::new("phones", "id", "contact_id", None, EnrichmentPropertyType::List), Arc::clone(&phone), None);
        repo.add_enriched(Enrichment::new("settings", "id", "contact_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&contact_setting), None);
        repo.add_enriched(Enrichment::new("prefs", "id", "contact_id", None, EnrichmentPropertyType::Dictionary), Arc::clone(&contact_preference), None);
        repo.add_enriched(Enrichment::new("contact_source_name", "contact_source_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&contact_source), None);
        Ok(repo)
}
