use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, EnrichmentVia, ICRUDRepository, IReadonlyRepository, IRepository, IWhere, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Statement, Result, async_trait, CommandMiddleware, IdKey, Response, Stream};
use super::super::Log;
use super::logAttributesRepository::LogAttributesRepository;
use super::logTypesRepository::LogTypesRepository;
use std::any::TypeId;
use std::collections::HashMap;
use std::ops::Deref;
use std::pin::Pin;
use std::sync::Arc;

pub struct LogsRepository {
    pub(crate) inner: Arc<CRUDRepository<Log>>,
    pub log_attribute: LogAttributesRepository,
    pub log_type: LogTypesRepository,
}

impl LogsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Log".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Log".into(), "logs".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("message".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("log_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "message".into(), "log_type_id".into()];
        options.create_properties = Some(vec!["message".into()]);
        options.update_properties = Some(vec!["uuid".into(), "message".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Log".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Log".into(), "logs".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("message".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("log_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "message".into(), "log_type_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "message".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "message".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let log_attribute = LogAttributesRepository::new(Arc::clone(&connection))?;
        let log_type = LogTypesRepository::new(Arc::clone(&connection))?;
        let mut repo = CRUDRepository::<Log>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "log_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), &log_attribute, None);
        repo.add_enriched(Enrichment::new("log_type_name", "log_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), &log_type, None);
        Ok(Self { inner: Arc::new(repo), log_attribute, log_type })
    }

    pub fn create_readonly(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Log>> {
        let mut options = ReadonlyRepositoryMappingOptions::default();
        options.entity = "Log".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Log".into(), "logs".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("message".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("log_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "message".into(), "log_type_id".into()];
        let log_attribute = LogAttributesRepository::new(Arc::clone(&connection))?;
        let log_type = LogTypesRepository::new(Arc::clone(&connection))?;
        let mut repo = ReadonlyRepository::<Log>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "log_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), &log_attribute, None);
        repo.add_enriched(Enrichment::new("log_type_name", "log_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), &log_type, None);
        Ok(repo)
    }
}

impl Deref for LogsRepository {
    type Target = CRUDRepository<Log>;
    fn deref(&self) -> &Self::Target {
        self.inner.as_ref()
    }
}

impl EnrichmentVia<Log> for &LogsRepository {
    fn into_repos(
        self,
    ) -> (
        Arc<dyn IReadonlyRepository<Log>>,
        Option<Arc<dyn ICRUDRepository<Log>>>,
    ) {
        (
            Arc::clone(&self.inner) as Arc<dyn IReadonlyRepository<Log>>,
            Some(Arc::clone(&self.inner) as Arc<dyn ICRUDRepository<Log>>),
        )
    }
}

impl IRepository for LogsRepository {
    fn entity_type(&self) -> TypeId {
        IRepository::entity_type(self.inner.as_ref())
    }

    fn schema(&self) -> &Schema {
        self.inner.schema()
    }
}

#[async_trait]
impl IReadonlyRepository<Log> for LogsRepository {
    fn to_crud(self: Arc<Self>) -> Option<Arc<dyn ICRUDRepository<Log>>> {
        Some(self)
    }

    async fn read_single(
        &self,
        query: Option<&dyn Statement>,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<Log>> {
        self.inner.as_ref().read_single(query, options).await
    }

    fn read<'a>(
        &'a self,
        query: Option<&'a dyn Statement>,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<Log>> + Send + 'a>> {
        IReadonlyRepository::read(self.inner.as_ref(), query, options)
    }

    async fn read_single_where(
        &self,
        clause: &dyn IWhere,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<Log>> {
        self.inner.as_ref().read_single_where(clause, options).await
    }

    fn read_where<'a>(
        &'a self,
        clause: &'a dyn IWhere,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<Log>> + Send + 'a>> {
        IReadonlyRepository::read_where(self.inner.as_ref(), clause, options)
    }
}

#[async_trait]
impl ICRUDRepository<Log> for LogsRepository {
    async fn create(&self, item: Log) -> Result<Log> {
        self.inner.create(item).await
    }

    async fn update(&self, item: Log, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::update(self.inner.as_ref(), item, by_where).await
    }

    async fn delete(&self, item: Log, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::delete(self.inner.as_ref(), item, by_where).await
    }

    async fn read_single_by_id(&self, id: &dyn IdKey) -> Result<Option<Log>> {
        self.inner.read_single_by_id(id).await
    }

    fn id_names(&self) -> Vec<String> {
        self.inner.id_names()
    }

    fn add_middleware(&self, middleware: Arc<dyn CommandMiddleware>) {
        self.inner.add_middleware(middleware)
    }
}

pub fn logs_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Log".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Log".into(), "logs".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("message".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("log_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "message".into(), "log_type_id".into()];
        options.create_properties = Some(vec!["message".into()]);
        options.update_properties = Some(vec!["uuid".into(), "message".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Log".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Log".into(), "logs".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("message".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("log_type_name".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "message".into(), "log_type_id".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "message".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "message".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let log_attribute = Arc::new(super::logAttributesRepository::log_attributes_row_repository(Arc::clone(&connection))?);
        let log_type = Arc::new(super::logTypesRepository::log_types_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("attributes", "id", "log_id", Some("value".into()), EnrichmentPropertyType::Dictionary).with_dictionary_key("name"), Arc::clone(&log_attribute), None);
        repo.add_enriched(Enrichment::new("log_type_name", "log_type_id", "id", Some("name".into()), EnrichmentPropertyType::Object), Arc::clone(&log_type), None);
        Ok(repo)
}
