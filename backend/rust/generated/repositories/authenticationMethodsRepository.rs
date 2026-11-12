use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, EnrichmentVia, ICRUDRepository, IReadonlyRepository, IRepository, IWhere, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Statement, Result, async_trait, CommandMiddleware, IdKey, Response, Stream};
use super::super::AuthenticationMethod;
use std::any::TypeId;
use std::collections::HashMap;
use std::ops::Deref;
use std::pin::Pin;
use std::sync::Arc;

pub struct AuthenticationMethodsRepository {
    pub(crate) inner: Arc<CRUDRepository<AuthenticationMethod>>,
}

impl AuthenticationMethodsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AuthenticationMethod".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AuthenticationMethod".into(), "authentication_methods_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_default".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AuthenticationMethod".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AuthenticationMethod".into(), "authentication_methods_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_default".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let repo = CRUDRepository::<AuthenticationMethod>::new(connection, options)?;
        Ok(Self { inner: Arc::new(repo) })
    }

    pub fn create_readonly(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<AuthenticationMethod>> {
        let mut options = ReadonlyRepositoryMappingOptions::default();
        options.entity = "AuthenticationMethod".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AuthenticationMethod".into(), "authentication_methods_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_default".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()];
        let repo = ReadonlyRepository::<AuthenticationMethod>::new(connection, options)?;
        Ok(repo)
    }
}

impl Deref for AuthenticationMethodsRepository {
    type Target = CRUDRepository<AuthenticationMethod>;
    fn deref(&self) -> &Self::Target {
        self.inner.as_ref()
    }
}

impl EnrichmentVia<AuthenticationMethod> for &AuthenticationMethodsRepository {
    fn into_repos(
        self,
    ) -> (
        Arc<dyn IReadonlyRepository<AuthenticationMethod>>,
        Option<Arc<dyn ICRUDRepository<AuthenticationMethod>>>,
    ) {
        (
            Arc::clone(&self.inner) as Arc<dyn IReadonlyRepository<AuthenticationMethod>>,
            Some(Arc::clone(&self.inner) as Arc<dyn ICRUDRepository<AuthenticationMethod>>),
        )
    }
}

impl IRepository for AuthenticationMethodsRepository {
    fn entity_type(&self) -> TypeId {
        IRepository::entity_type(self.inner.as_ref())
    }

    fn schema(&self) -> &Schema {
        self.inner.schema()
    }
}

#[async_trait]
impl IReadonlyRepository<AuthenticationMethod> for AuthenticationMethodsRepository {
    fn to_crud(self: Arc<Self>) -> Option<Arc<dyn ICRUDRepository<AuthenticationMethod>>> {
        Some(self)
    }

    async fn read_single(
        &self,
        query: Option<&dyn Statement>,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<AuthenticationMethod>> {
        self.inner.as_ref().read_single(query, options).await
    }

    fn read<'a>(
        &'a self,
        query: Option<&'a dyn Statement>,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<AuthenticationMethod>> + Send + 'a>> {
        IReadonlyRepository::read(self.inner.as_ref(), query, options)
    }

    async fn read_single_where(
        &self,
        clause: &dyn IWhere,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<AuthenticationMethod>> {
        self.inner.as_ref().read_single_where(clause, options).await
    }

    fn read_where<'a>(
        &'a self,
        clause: &'a dyn IWhere,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<AuthenticationMethod>> + Send + 'a>> {
        IReadonlyRepository::read_where(self.inner.as_ref(), clause, options)
    }
}

#[async_trait]
impl ICRUDRepository<AuthenticationMethod> for AuthenticationMethodsRepository {
    async fn create(&self, item: AuthenticationMethod) -> Result<AuthenticationMethod> {
        self.inner.create(item).await
    }

    async fn update(&self, item: AuthenticationMethod, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::update(self.inner.as_ref(), item, by_where).await
    }

    async fn delete(&self, item: AuthenticationMethod, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::delete(self.inner.as_ref(), item, by_where).await
    }

    async fn read_single_by_id(&self, id: &dyn IdKey) -> Result<Option<AuthenticationMethod>> {
        self.inner.read_single_by_id(id).await
    }

    fn id_names(&self) -> Vec<String> {
        self.inner.id_names()
    }

    fn add_middleware(&self, middleware: Arc<dyn CommandMiddleware>) {
        self.inner.add_middleware(middleware)
    }
}

pub fn authentication_methods_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AuthenticationMethod".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AuthenticationMethod".into(), "authentication_methods_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_default".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "AuthenticationMethod".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("AuthenticationMethod".into(), "authentication_methods_bases".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("description".into(), SchemaColumn { type_name: "string".into(), nullable: true, has_default: false, is_id: false }),
            ("is_default".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "name".into(), "description".into(), "is_default".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

    CRUDRepository::<datasources::Row>::new(connection, options)
}
