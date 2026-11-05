use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Address;
use super::super::AddressAttribute;
use super::super::Label;
use super::super::AddressLabel;
use super::super::AddressType;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct AddressesRepository {
    pub repo: Arc<CRUDRepository<Address>>,
    pub address_attribute: Arc<CRUDRepository<AddressAttribute>>,
    pub label: Arc<CRUDRepository<Label>>,
    pub address_label: Arc<CRUDRepository<AddressLabel>>,
    pub address_type: Arc<CRUDRepository<AddressType>>,
}

impl AddressesRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Address".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Address".into(), "addresses".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_1".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("line_2".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_3".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("neighborhood".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("district".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("city".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("state_province".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("postal_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("country_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("formatted_address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("latitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("longitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()];
        options.create_properties = Some(vec!["contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Address".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Address".into(), "address_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_1".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("line_2".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_3".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("neighborhood".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("district".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("city".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("state_province".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("postal_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("country_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("formatted_address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("latitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("longitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address_attribute = Arc::new(super::addressAttributesRepository::address_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let address_label = Arc::new(super::addressLabelsRepository::address_labels_repository(Arc::clone(&connection))?);
        let address_type = Arc::new(super::addressTypesRepository::address_types_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Address>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "address_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&address_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("address_id", "label_id")), Arc::clone(&label), Arc::clone(&address_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("address_type_name", "address_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&address_type), None);
        Ok(Self { repo: Arc::new(repo), address_attribute, label, address_label, address_type })
    }
}

impl Deref for AddressesRepository {
    type Target = CRUDRepository<Address>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn addresses_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Address>> {
    Arc::try_unwrap(AddressesRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn addresses_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Address".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Address".into(), "addresses".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_1".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("line_2".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_3".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("neighborhood".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("district".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("city".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("state_province".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("postal_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("country_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("formatted_address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("latitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("longitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()];
        options.create_properties = Some(vec!["contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Address".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Address".into(), "address_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("address_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_1".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("line_2".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("line_3".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("neighborhood".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("district".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("city".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("state_province".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("postal_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("country_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("formatted_address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
            ("latitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("longitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
            ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let address_attribute = Arc::new(super::addressAttributesRepository::address_attributes_row_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_row_repository(Arc::clone(&connection))?);
        let address_label = Arc::new(super::addressLabelsRepository::address_labels_row_repository(Arc::clone(&connection))?);
        let address_type = Arc::new(super::addressTypesRepository::address_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "address_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&address_attribute), None);
        repo.add_linked(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("address_id", "label_id")), Arc::clone(&label), Arc::clone(&address_label) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_enriched(Enrichment::new("address_type_name", "address_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&address_type), None);
        Ok(repo)
}

pub fn addresses_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Address>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Address".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Address".into(), "addresses".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("contact_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("address_type_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
        ("display_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("line_1".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("line_2".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("line_3".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("neighborhood".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("district".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("city".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("state_province".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("postal_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("country_code".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("formatted_address".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: true, is_id: false }),
        ("latitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
        ("longitude".into(), SchemaColumn { type_name: "decimal".into(), nullable: true, has_default: false, is_id: false }),
        ("is_primary".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "contact_id".into(), "address_type_id".into(), "display_name".into(), "line_1".into(), "line_2".into(), "line_3".into(), "neighborhood".into(), "district".into(), "city".into(), "state_province".into(), "postal_code".into(), "country_code".into(), "formatted_address".into(), "latitude".into(), "longitude".into(), "is_primary".into()];
        let address_attribute = Arc::new(super::addressAttributesRepository::address_attributes_repository(Arc::clone(&connection))?);
        let label = Arc::new(super::labelsRepository::labels_repository(Arc::clone(&connection))?);
        let address_type = Arc::new(super::addressTypesRepository::address_types_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Address>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "address_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&address_attribute), None);
        repo.add_enriched(Enrichment::new("labels", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&label), None);
        repo.add_enriched(Enrichment::new("address_type_name", "address_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&address_type), None);
        Ok(repo)
}
