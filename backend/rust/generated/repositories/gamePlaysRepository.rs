use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, EnrichmentVia, ICRUDRepository, IReadonlyRepository, IRepository, IWhere, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Statement, Result, async_trait, CommandMiddleware, IdKey, Response, Stream};
use super::super::GamePlay;
use super::gamePlayStatesRepository::GamePlayStatesRepository;
use super::gamePlayActionsRepository::GamePlayActionsRepository;
use super::usersRepository::UsersRepository;
use super::gamePlayUsersRepository::GamePlayUsersRepository;
use std::any::TypeId;
use std::collections::HashMap;
use std::ops::Deref;
use std::pin::Pin;
use std::sync::Arc;

pub struct GamePlaysRepository {
    pub(crate) inner: Arc<CRUDRepository<GamePlay>>,
    pub game_play_state: GamePlayStatesRepository,
    pub game_play_action: GamePlayActionsRepository,
    pub user: UsersRepository,
    pub game_play_users: GamePlayUsersRepository,
}

impl GamePlaysRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GamePlay".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GamePlay".into(), "game_plays".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("finished".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()];
        options.create_properties = Some(vec!["game_id".into(), "user_id".into(), "finished".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GamePlay".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GamePlay".into(), "game_plays".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("finished".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_play_state = GamePlayStatesRepository::new(Arc::clone(&connection))?;
        let game_play_action = GamePlayActionsRepository::new(Arc::clone(&connection))?;
        let user = UsersRepository::new(Arc::clone(&connection))?;
        let game_play_users = GamePlayUsersRepository::new(Arc::clone(&connection))?;
        let mut repo = CRUDRepository::<GamePlay>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("states", "id", "game_play_id", None, EnrichmentPropertyType::List), &game_play_state, None);
        repo.add_enriched(Enrichment::new("actions", "id", "game_play_id", None, EnrichmentPropertyType::List), &game_play_action, None);
        repo.add_linked(Enrichment::new("users", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("game_play_id", "user_id")), &user, Arc::clone(&game_play_users.inner) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { inner: Arc::new(repo), game_play_state, game_play_action, user, game_play_users })
    }

    pub fn create_readonly(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<GamePlay>> {
        let mut options = ReadonlyRepositoryMappingOptions::default();
        options.entity = "GamePlay".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GamePlay".into(), "game_plays".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("finished".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()];
        let game_play_state = GamePlayStatesRepository::new(Arc::clone(&connection))?;
        let game_play_action = GamePlayActionsRepository::new(Arc::clone(&connection))?;
        let user = UsersRepository::new(Arc::clone(&connection))?;
        let mut repo = ReadonlyRepository::<GamePlay>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("states", "id", "game_play_id", None, EnrichmentPropertyType::List), &game_play_state, None);
        repo.add_enriched(Enrichment::new("actions", "id", "game_play_id", None, EnrichmentPropertyType::List), &game_play_action, None);
        repo.add_enriched(Enrichment::new("users", "id", "id", None, EnrichmentPropertyType::List), &user, None);
        Ok(repo)
    }
}

impl Deref for GamePlaysRepository {
    type Target = CRUDRepository<GamePlay>;
    fn deref(&self) -> &Self::Target {
        self.inner.as_ref()
    }
}

impl EnrichmentVia<GamePlay> for &GamePlaysRepository {
    fn into_repos(
        self,
    ) -> (
        Arc<dyn IReadonlyRepository<GamePlay>>,
        Option<Arc<dyn ICRUDRepository<GamePlay>>>,
    ) {
        (
            Arc::clone(&self.inner) as Arc<dyn IReadonlyRepository<GamePlay>>,
            Some(Arc::clone(&self.inner) as Arc<dyn ICRUDRepository<GamePlay>>),
        )
    }
}

impl IRepository for GamePlaysRepository {
    fn entity_type(&self) -> TypeId {
        IRepository::entity_type(self.inner.as_ref())
    }

    fn schema(&self) -> &Schema {
        self.inner.schema()
    }
}

#[async_trait]
impl IReadonlyRepository<GamePlay> for GamePlaysRepository {
    fn to_crud(self: Arc<Self>) -> Option<Arc<dyn ICRUDRepository<GamePlay>>> {
        Some(self)
    }

    async fn read_single(
        &self,
        query: Option<&dyn Statement>,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<GamePlay>> {
        self.inner.as_ref().read_single(query, options).await
    }

    fn read<'a>(
        &'a self,
        query: Option<&'a dyn Statement>,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<GamePlay>> + Send + 'a>> {
        IReadonlyRepository::read(self.inner.as_ref(), query, options)
    }

    async fn read_single_where(
        &self,
        clause: &dyn IWhere,
        options: Option<&ReadonlyRepositoryMappingOptions>,
    ) -> Result<Option<GamePlay>> {
        self.inner.as_ref().read_single_where(clause, options).await
    }

    fn read_where<'a>(
        &'a self,
        clause: &'a dyn IWhere,
        options: Option<&'a ReadonlyRepositoryMappingOptions>,
    ) -> Pin<Box<dyn Stream<Item = Result<GamePlay>> + Send + 'a>> {
        IReadonlyRepository::read_where(self.inner.as_ref(), clause, options)
    }
}

#[async_trait]
impl ICRUDRepository<GamePlay> for GamePlaysRepository {
    async fn create(&self, item: GamePlay) -> Result<GamePlay> {
        self.inner.create(item).await
    }

    async fn update(&self, item: GamePlay, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::update(self.inner.as_ref(), item, by_where).await
    }

    async fn delete(&self, item: GamePlay, by_where: Option<&dyn IWhere>) -> Result<Response> {
        ICRUDRepository::delete(self.inner.as_ref(), item, by_where).await
    }

    async fn read_single_by_id(&self, id: &dyn IdKey) -> Result<Option<GamePlay>> {
        self.inner.read_single_by_id(id).await
    }

    fn id_names(&self) -> Vec<String> {
        self.inner.id_names()
    }

    fn add_middleware(&self, middleware: Arc<dyn CommandMiddleware>) {
        self.inner.add_middleware(middleware)
    }
}

pub fn game_plays_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GamePlay".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GamePlay".into(), "game_plays".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("finished".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()];
        options.create_properties = Some(vec!["game_id".into(), "user_id".into(), "finished".into()]);
        options.update_properties = Some(vec!["uuid".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "GamePlay".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("GamePlay".into(), "game_plays".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("game_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("user_id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: false }),
            ("finished".into(), SchemaColumn { type_name: "datetime".into(), nullable: true, has_default: false, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "game_id".into(), "user_id".into(), "finished".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let game_play_state = Arc::new(super::gamePlayStatesRepository::game_play_states_row_repository(Arc::clone(&connection))?);
        let game_play_action = Arc::new(super::gamePlayActionsRepository::game_play_actions_row_repository(Arc::clone(&connection))?);
        let user = Arc::new(super::usersRepository::users_row_repository(Arc::clone(&connection))?);
        let game_play_users = Arc::new(super::gamePlayUsersRepository::game_play_users_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("states", "id", "game_play_id", None, EnrichmentPropertyType::List), Arc::clone(&game_play_state), None);
        repo.add_enriched(Enrichment::new("actions", "id", "game_play_id", None, EnrichmentPropertyType::List), Arc::clone(&game_play_action), None);
        repo.add_linked(Enrichment::new("users", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("game_play_id", "user_id")), Arc::clone(&user), Arc::clone(&game_play_users) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}
