use datasources::{Connection, CRUDRepository, CRUDRepositoryBuilder, CRUDRepositoryOptions, DictionaryMapper, Enrichment, EnrichmentPropertyType, Association, ICRUDRepository, ReadonlyRepository, ReadonlyRepositoryMappingOptions, Schema, SchemaColumn, Result};
use super::super::UserDetail;
use super::super::UserSetting;
use super::super::Role;
use super::super::UserRole;
use super::super::Group;
use super::super::UserGroup;
use std::collections::HashMap;
use std::sync::Arc;
use std::ops::Deref;

pub struct UserDetailsRepository {
    pub repo: Arc<CRUDRepository<UserDetail>>,
    pub user_setting: Arc<CRUDRepository<UserSetting>>,
    pub role: Arc<CRUDRepository<Role>>,
    pub user_role: Arc<CRUDRepository<UserRole>>,
    pub group: Arc<CRUDRepository<Group>>,
    pub user_group: Arc<CRUDRepository<UserGroup>>,
}

impl UserDetailsRepository {
    pub fn new(connection: Arc<dyn Connection>) -> Result<Self> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "UserDetail".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("UserDetail".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["username".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "username".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "UserDetail".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("UserDetail".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let user_setting = Arc::new(super::userSettingsRepository::user_settings_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::rolesRepository::roles_repository(Arc::clone(&connection))?);
        let user_role = Arc::new(super::userRolesRepository::user_roles_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupsRepository::groups_repository(Arc::clone(&connection))?);
        let user_group = Arc::new(super::userGroupsRepository::user_groups_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<UserDetail>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_setting), None);
        repo.add_linked(Enrichment::new("roles", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("user_id", "role_id")), Arc::clone(&role), Arc::clone(&user_role) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_linked(Enrichment::new("groups", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("user_id", "group_id")), Arc::clone(&group), Arc::clone(&user_group) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(Self { repo: Arc::new(repo), user_setting, role, user_role, group, user_group })
    }
}

impl Deref for UserDetailsRepository {
    type Target = CRUDRepository<UserDetail>;
    fn deref(&self) -> &Self::Target {
        self.repo.as_ref()
    }
}

pub fn user_details_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<UserDetail>> {
    Arc::try_unwrap(UserDetailsRepository::new(connection)?.repo).map_err(|_| datasources::DatasourceError::message("repository"))
}

pub fn user_details_row_repository(connection: Arc<dyn Connection>) -> Result<CRUDRepository<datasources::Row>> {
    let options = CRUDRepositoryBuilder::new()
    .add({
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "UserDetail".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("UserDetail".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["username".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "username".into(), "is_enabled".into()]);
        options
    })
    .add_for("sqlite", {
        let mut options = CRUDRepositoryOptions::default();
        options.entity = "UserDetail".into();
        options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
            ("UserDetail".into(), "users".into()),
        ])));
        options.schema = Schema::new(HashMap::from([
            ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
            ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
            ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
            ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
            ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
            ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
        ]));
        options.ids = vec!["id".into()];
        options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "is_enabled".into()];
        options.create_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "is_enabled".into()]);
        options.update_properties = Some(vec!["uuid".into(), "created".into(), "version".into(), "username".into(), "is_enabled".into()]);
        options
    })
    .for_connection(connection.as_ref())?;

        let user_setting = Arc::new(super::userSettingsRepository::user_settings_row_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::rolesRepository::roles_row_repository(Arc::clone(&connection))?);
        let user_role = Arc::new(super::userRolesRepository::user_roles_row_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupsRepository::groups_row_repository(Arc::clone(&connection))?);
        let user_group = Arc::new(super::userGroupsRepository::user_groups_row_repository(Arc::clone(&connection))?);
        let mut repo = CRUDRepository::<datasources::Row>::new(Arc::clone(&connection), options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_setting), None);
        repo.add_linked(Enrichment::new("roles", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("user_id", "role_id")), Arc::clone(&role), Arc::clone(&user_role) as Arc<dyn ICRUDRepository<_>>, None);
        repo.add_linked(Enrichment::new("groups", "id", "id", Some("name".into()), EnrichmentPropertyType::List).linked(Association::new("user_id", "group_id")), Arc::clone(&group), Arc::clone(&user_group) as Arc<dyn ICRUDRepository<_>>, None);
        Ok(repo)
}

pub fn user_details_readonly_repository(connection: Arc<dyn Connection>) -> Result<ReadonlyRepository<UserDetail>> {
    let mut options = ReadonlyRepositoryMappingOptions::default();
    options.entity = "UserDetail".into();
    options.entity_mapper = Some(Arc::new(DictionaryMapper::new([
        ("UserDetail".into(), "users".into()),
    ])));
    options.schema = Schema::new(HashMap::from([
        ("id".into(), SchemaColumn { type_name: "biginteger".into(), nullable: false, has_default: false, is_id: true }),
        ("uuid".into(), SchemaColumn { type_name: "uuid".into(), nullable: false, has_default: true, is_id: false }),
        ("created".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("updated".into(), SchemaColumn { type_name: "datetime".into(), nullable: false, has_default: true, is_id: false }),
        ("version".into(), SchemaColumn { type_name: "binary".into(), nullable: false, has_default: true, is_id: false }),
        ("username".into(), SchemaColumn { type_name: "string".into(), nullable: false, has_default: false, is_id: false }),
        ("is_enabled".into(), SchemaColumn { type_name: "boolean".into(), nullable: false, has_default: true, is_id: false }),
    ]));
    options.read_properties = vec!["id".into(), "uuid".into(), "created".into(), "updated".into(), "version".into(), "username".into(), "is_enabled".into()];
        let user_setting = Arc::new(super::userSettingsRepository::user_settings_repository(Arc::clone(&connection))?);
        let role = Arc::new(super::rolesRepository::roles_repository(Arc::clone(&connection))?);
        let group = Arc::new(super::groupsRepository::groups_repository(Arc::clone(&connection))?);
        let mut repo = ReadonlyRepository::<UserDetail>::new(connection, options)?;
        repo.add_enriched(Enrichment::new("settings", "id", "user_id", Some("value".into()), EnrichmentPropertyType::Dictionary), Arc::clone(&user_setting), None);
        repo.add_enriched(Enrichment::new("roles", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&role), None);
        repo.add_enriched(Enrichment::new("groups", "id", "id", Some("name".into()), EnrichmentPropertyType::List), Arc::clone(&group), None);
        Ok(repo)
}
