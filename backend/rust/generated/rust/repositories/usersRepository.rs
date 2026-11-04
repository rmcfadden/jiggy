use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::Users;
use super::super::UserSettings;
use super::super::Role;
use super::super::UserRole;
use super::super::Group;
use super::super::UserGroup;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct UsersRepository {
    pub repo: Arc<CRUDRepository<Users>>,
    pub user_settings: Arc<CRUDRepository<UserSettings>>,
    pub role: Arc<CRUDRepository<Role>>,
    pub user_role: Arc<CRUDRepository<UserRole>>,
    pub group: Arc<CRUDRepository<Group>>,
    pub user_group: Arc<CRUDRepository<UserGroup>>,
}

impl UsersRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Users".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Users".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("password".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["username".into(), "password".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Users".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Users".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("password".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let user_settings = Arc::new(super::userSettingsRepository::user_settings_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::roleRepository::role_repository(Arc::clone(&connection))?);
        let user_role = Arc::new(super::userRoleRepository::user_role_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupRepository::group_repository(Arc::clone(&connection))?);
        let user_group = Arc::new(super::userGroupRepository::user_group_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<Users>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_settings), None);
        repo.add_linked(Enrichment::new("roles", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("user_id", "role_id")), Arc::clone(&role), Arc::clone(&user_role) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_linked(Enrichment::new("groups", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("user_id", "group_id")), Arc::clone(&group), Arc::clone(&user_group) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { repo: Arc::new(repo), user_settings, role, user_role, group, user_group })
    }
}

impl Deref for UsersRepository {
    type Target = CRUDRepository<Users>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn users_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<Users>> {
    Arc::try_unwrap(UsersRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn users_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Users".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Users".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("password".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["username".into(), "password".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "Users".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("Users".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("password".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let user_settings = Arc::new(super::userSettingsRepository::user_settings_row_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::roleRepository::role_row_repository(Arc::clone(&connection))?);
        let user_role = Arc::new(super::userRoleRepository::user_role_row_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupRepository::group_row_repository(Arc::clone(&connection))?);
        let user_group = Arc::new(super::userGroupRepository::user_group_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_settings), None);
        repo.add_linked(Enrichment::new("roles", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("user_id", "role_id")), Arc::clone(&role), Arc::clone(&user_role) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_linked(Enrichment::new("groups", "id", "id", None, EnrichmentPropertyType::List).linked(Association::new("user_id", "group_id")), Arc::clone(&group), Arc::clone(&user_group) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}

pub fn users_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<Users>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "Users".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("Users".into(), "users".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("password".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "password".into(), "is_enabled".into()];
        let user_settings = Arc::new(super::userSettingsRepository::user_settings_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::roleRepository::role_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupRepository::group_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<Users>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_settings), None);
        repo.add_enriched(Enrichment::new("roles", "id", "id", None, EnrichmentPropertyType::List), Arc::clone(&role), None);
        repo.add_enriched(Enrichment::new("groups", "id", "id", None, EnrichmentPropertyType::List), Arc::clone(&group), None);
        Ok(repo)
}
