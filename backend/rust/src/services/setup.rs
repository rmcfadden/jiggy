use crate::generated::repositories::groupsRepository::GroupsRepository;
use crate::generated::repositories::rolesRepository::RolesRepository;
use crate::generated::{Group, Role};
use crate::services::users::{CreateUser, UserError, UsersService};
use futures_util::TryStreamExt;
use std::collections::HashSet;
use std::sync::Arc;

type Result<T> = std::result::Result<T, UserError>;

/// The roles and groups `setup` creates.
const DEFAULT_ROLES: [&str; 2] = ["admin", "editor"];
const DEFAULT_GROUPS: [&str; 2] = ["admin", "support"];
const ADMIN_USERNAME: &str = "admin";
const USER_USERNAME: &str = "user";

/// Seeds the identity data `setup` needs: default roles and groups, and a first admin user.
pub struct SetupService {
    roles: Arc<RolesRepository>,
    groups: Arc<GroupsRepository>,
    users: Arc<UsersService>,
}

impl SetupService {
    pub fn new(roles: Arc<RolesRepository>, groups: Arc<GroupsRepository>, users: Arc<UsersService>) -> Self {
        Self { roles, groups, users }
    }

    /// Adds the default roles and groups that are missing; returns (roles added, groups added).
    pub async fn add_defaults(&self) -> Result<(Vec<String>, Vec<String>)> {
        let have: HashSet<String> = self.roles.read(None, None).try_collect::<Vec<Role>>().await?.into_iter().map(|r| r.name).collect();
        let mut roles = vec![];
        for name in DEFAULT_ROLES {
            if have.contains(name) {
                continue;
            }
            let mut item = Role::default();
            item.name = name.into();
            self.roles.create(item).await?;
            roles.push(name.to_string());
        }
        let have: HashSet<String> = self.groups.read(None, None).try_collect::<Vec<Group>>().await?.into_iter().map(|g| g.name).collect();
        let mut groups = vec![];
        for name in DEFAULT_GROUPS {
            if have.contains(name) {
                continue;
            }
            let mut item = Group::default();
            item.name = name.into();
            self.groups.create(item).await?;
            groups.push(name.to_string());
        }
        Ok((roles, groups))
    }

    /// Creates the `admin` user (role and group `admin`) when there are no users at all.
    /// Uses `password` when given, otherwise a random one; returns (password, generated).
    pub async fn add_admin(&self, password: Option<String>) -> Result<Option<(String, bool)>> {
        if self.users.has_users().await? {
            return Ok(None);
        }
        let generated = password.is_none();
        let chosen = password.unwrap_or_else(|| datasources::uuid::Uuid::new_v4().simple().to_string());
        self.users
            .create(CreateUser { username: ADMIN_USERNAME.into(), password: chosen.clone(), roles: vec!["admin".into()], groups: vec!["admin".into()], is_enabled: None })
            .await?;
        Ok(Some((chosen, generated)))
    }

    /// Creates the plain `user` account (no roles, no groups) when it does not exist yet.
    /// Uses `password` when given, otherwise a random one; returns (password, generated).
    pub async fn add_user(&self, password: Option<String>) -> Result<Option<(String, bool)>> {
        if self.users.find(USER_USERNAME).await?.is_some() {
            return Ok(None);
        }
        let generated = password.is_none();
        let chosen = password.unwrap_or_else(|| datasources::uuid::Uuid::new_v4().simple().to_string());
        self.users
            .create(CreateUser { username: USER_USERNAME.into(), password: chosen.clone(), roles: vec![], groups: vec![], is_enabled: None })
            .await?;
        Ok(Some((chosen, generated)))
    }
}
