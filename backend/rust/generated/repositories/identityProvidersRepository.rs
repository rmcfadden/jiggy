use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, EnrichmentVia, ICRUDRepository, IReadonlyRepository, IRepository, IWhere, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Statement, Result, async_trait, CommandMiddleware, IdKey, Response, Stream};
use super::super::IdentityProvider;
use super::identityProviderSettingsRepository::IdentityProviderSettingsRepository;
use super::identityProviderTypesRepository::IdentityProviderTypesRepository;
use std::any::TypeId;
use std::collections::HashMap;
use std::ops::Deref;
use std::pin::Pin;
use std::sync::Arc;

pub struct IdentityProvidersRepository {
    pub(crate) inner: Arc<CRUDRepository<IdentityProvider>>,
    pub identity_provider_setting: IdentityProviderSettingsRepository,
    pub identity_provider_type: IdentityProviderTypesRepository,
}

impl IdentityProvidersRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "IdentityProvider".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("IdentityProvider".into(), "identity_providers".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_builtin".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("identity_provider_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into(), "identity_provider_type_id".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "IdentityProvider".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("IdentityProvider".into(), "identity_providers".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_builtin".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("identity_provider_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into(), "identity_provider_type_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let identity_provider_setting = IdentityProviderSettingsRepository::new(Arc::clone(&connection))?;
        let identity_provider_type = IdentityProviderTypesRepository::new(Arc::clone(&connection))?;
        let mut repo = CRUDRepository::<IdentityProvider>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "identity_provider_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), &identity_provider_setting, None);
        repo.add_enriched(Enrichment::new("identity_provider_type_name", "identity_provider_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), &identity_provider_type, None);
        Ok(Self { inner: Arc::new(repo), identity_provider_setting, identity_provider_type })
    }

    pub fn create_readonly(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<IdentityProvider>> {
        let mut options = ReadonlyRepositoryMappingOptions::default();
        options.entity = "IdentityProvider".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("IdentityProvider".into(), "identity_providers".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_builtin".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("identity_provider_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into(), "identity_provider_type_id".into()];
        let identity_provider_setting = IdentityProviderSettingsRepository::new(Arc::clone(&connection))?;
        let identity_provider_type = IdentityProviderTypesRepository::new(Arc::clone(&connection))?;
        let mut repo = ReadonlyRepository::<IdentityProvider>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "identity_provider_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), &identity_provider_setting, None);
        repo.add_enriched(Enrichment::new("identity_provider_type_name", "identity_provider_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), &identity_provider_type, None);
        Ok(repo)
    }
}

impl Deref for IdentityProvidersRepository {
    type Target = CRUDRepository<IdentityProvider>;
    fn deref(&self) -> &Self::Target {
        self.inner.as_ref()
    }
}

impl EnrichmentVia<IdentityProvider> for &IdentityProvidersRepository {
    fn into_repos(
        self,
    ) -> (
        Arc<dyn IReadonlyRepository<IdentityProvider>>,
        Option<Arc<dyn ICRUDRepository<IdentityProvider>>>,
    ) {
        (
            Arc::clone(&self.inner) as Arc<dyn IReadonlyRepository<IdentityProvider>>,
            Some(Arc::clone(&self.inner) as Arc<dyn ICRUDRepository<IdentityProvider>>),
        )
    }
}

impl IRepository for IdentityProvidersRepository {
    fn entity_type(&self) -> TypeId {
        IRepository::entity_type(self.inner.as_ref())
    }

    fn schema(&self) -> &Schema {
        self.inner.schema()
    }
}

#[async_trait]
impl IReadonlyRepository<IdentityProvider> for IdentityProvidersRepository {
    fn to_crud(self: Arc<Self>) -> Option<Arc<dyn ICRUDRepository<IdentityProvider>>> {
        Some(self)
    }

    async fn read_single(
        &self,
        query: Option<&dyn Statement>,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<IdentityProvider>> {
        self.inner.as_ref().read_single(query, options).await
    }

    fn read<'a>(
        &'a self,
        query: Option<&'a dyn Statement>,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<IdentityProvider>> + Send + 'a>> {
        IReadonlyRepository::read(self.inner.as_ref(), query, options)
    }

    async fn read_single_where(
        &self,
        clause: &dyn IWhere,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<IdentityProvider>> {
        self.inner.as_ref().read_single_where(clause, options).await
    }

    fn read_where<'a>(
        &'a self,
        clause: &'a dyn IWhere,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<IdentityProvider>> + Send + 'a>> {
        IReadonlyRepository::read_where(self.inner.as_ref(), clause, options)
    }
}

#[async_trait]
impl ICRUDRepository<IdentityProvider> for IdentityProvidersRepository {
    async fn create(&self, item: IdentityProvider) -> Result<IdentityProvider> {
        self.inner.create(item).await
    }

    async fn update(&self, item: IdentityProvider, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::update(self.inner.as_ref(), item, by_where).await
    }

    async fn delete(&self, item: IdentityProvider, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::delete(self.inner.as_ref(), item, by_where).await
    }

    async fn read_single_by_id(&self, id: &dyn IdKey) -> Result<Option<IdentityProvider>> {
        self.inner.read_single_by_id(id).await
    }

    fn id_names(&self) -> Vec<String> {
        self.inner.id_names()
    }

    fn add_middleware(&self, middleware: Arc<dyn CommandMiddleware>) {
        self.inner.add_middleware(middleware)
    }
}

pub fn identity_providers_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "IdentityProvider".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("IdentityProvider".into(), "identity_providers".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_builtin".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("identity_provider_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into(), "identity_provider_type_id".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "IdentityProvider".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("IdentityProvider".into(), "identity_providers".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_builtin".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_deleted".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("identity_provider_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into(), "identity_provider_type_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_enabled".into(), "is_builtin".into(), "is_deleted".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let identity_provider_setting = Arc::new(super::identityProviderSettingsRepository::identity_provider_settings_row_repository(Arc::clone(&connection))?);
        let identity_provider_type = Arc::new(super::identityProviderTypesRepository::identity_provider_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "identity_provider_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), Arc::clone(&identity_provider_setting), None);
        repo.add_enriched(Enrichment::new("identity_provider_type_name", "identity_provider_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&identity_provider_type), None);
        Ok(repo)
}
