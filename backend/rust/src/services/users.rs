use crate::generated::repositories::groupsRepository::GroupsRepository;
use crate::generated::repositories::rolesRepository::RolesRepository;
use crate::generated::repositories::secretTypesRepository::SecretTypesRepository;
use crate::generated::repositories::secretsRepository::SecretsRepository;
use crate::generated::repositories::userSecretsRepository::UserSecretsRepository;
use crate::generated::repositories::usersRepository::UsersRepository;
use crate::generated::{Group, Role, Secret, User, UserSecret};
use futures_util::TryStreamExt;
use std::collections::HashSet;
use std::sync::Arc;

/// The secret type that holds a bcrypt password hash (looked up by name, not id).
pub const PASSWORD_SECRET_TYPE: &str = "password_bcrypt";
/// bcrypt cost factor; a random salt is generated per hash and stored inside the hash string.
const BCRYPT_COST: u32 = 12;
/// bcrypt only uses the first 72 bytes of the input.
const MAX_PASSWORD_BYTES: usize = 72;

/// A bad argument or a missing/duplicate record (the CLI prints it and exits 1), or a datasource failure.
#[derive(Debug)]
pub enum UserError {
    Invalid(String),
    Datasource(datasources::DatasourceError),
}

impl std::fmt::Display for UserError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserError::Invalid(message) => write!(f, "{message}"),
            UserError::Datasource(error) => write!(f, "{error}"),
        }
    }
}

impl From<datasources::DatasourceError> for UserError {
    fn from(error: datasources::DatasourceError) -> Self {
        UserError::Datasource(error)
    }
}

type Result<T> = std::result::Result<T, UserError>;

fn invalid<T>(message: impl Into<String>) -> Result<T> {
    Err(UserError::Invalid(message.into()))
}

pub struct CreateUser {
    pub username: String,
    pub password: String,
    pub roles: Vec<String>,
    pub groups: Vec<String>,
    pub is_enabled: Option<bool>,
}

#[derive(Default)]
pub struct UpdateUser {
    pub password: Option<String>,
    pub is_enabled: Option<bool>,
}

pub struct UsersService {
    users: Arc<UsersRepository>,
    roles: Arc<RolesRepository>,
    groups: Arc<GroupsRepository>,
    secrets: Arc<SecretsRepository>,
    secret_types: Arc<SecretTypesRepository>,
    user_secrets: Arc<UserSecretsRepository>,
}

impl UsersService {
    pub fn new(
        users: Arc<UsersRepository>,
        roles: Arc<RolesRepository>,
        groups: Arc<GroupsRepository>,
        secrets: Arc<SecretsRepository>,
        secret_types: Arc<SecretTypesRepository>,
        user_secrets: Arc<UserSecretsRepository>,
    ) -> Self {
        Self { users, roles, groups, secrets, secret_types, user_secrets }
    }

    pub async fn create(&self, input: CreateUser) -> Result<User> {
        let username = input.username.trim().to_string();
        if username.is_empty() {
            return invalid("username is required");
        }
        check_password(&input.password)?;
        if self.find(&username).await?.is_some() {
            return invalid(format!("user \"{username}\" already exists"));
        }
        let roles = by_name(self.roles.read(None, None).try_collect::<Vec<Role>>().await?, &input.roles, "role", |r| r.name.clone())?;
        let groups = by_name(self.groups.read(None, None).try_collect::<Vec<Group>>().await?, &input.groups, "group", |g| g.name.clone())?;
        let secret_type_id = self.password_type_id().await?;
        let hash = hash(&input.password)?;

        let mut item = User::default();
        item.username = username;
        item.is_enabled = input.is_enabled.unwrap_or(true);
        item.roles = roles;
        item.groups = groups;
        let created = self.users.create(item).await?;
        if let Err(error) = self.store_password(created.id, secret_type_id, &hash).await {
            // do not leave a user nobody can log in as
            let _ = self.users.delete(created.clone(), None).await;
            return Err(error);
        }
        Ok(created)
    }

    pub async fn update(&self, username: &str, input: UpdateUser) -> Result<User> {
        if input.password.is_none() && input.is_enabled.is_none() {
            return invalid("nothing to update: pass --password and/or --is_enabled");
        }
        if let Some(password) = &input.password {
            check_password(password)?;
        }
        let Some(mut user) = self.find(username).await? else { return invalid(format!("user \"{username}\" not found")) };
        let prepared = match &input.password {
            Some(password) => Some((self.password_type_id().await?, hash(password)?)),
            None => None,
        };

        if let Some(enabled) = input.is_enabled {
            if enabled != user.is_enabled {
                user.is_enabled = enabled;
                self.users.update(user.clone(), None).await?;
            }
        }
        if let Some((secret_type_id, hash)) = prepared {
            match self.password_secret(user.id, secret_type_id).await? {
                Some(mut secret) => {
                    secret.value = hash;
                    self.secrets.update(secret, None).await?;
                }
                None => self.store_password(user.id, secret_type_id, &hash).await?,
            }
        }
        Ok(user)
    }

    /// True when `plain` matches the user's stored password hash.
    #[allow(dead_code)]
    pub async fn verify_password(&self, username: &str, plain: &str) -> Result<bool> {
        let Some(user) = self.find(username).await? else { return Ok(false) };
        let secret_type_id = self.password_type_id().await?;
        Ok(match self.password_secret(user.id, secret_type_id).await? {
            Some(secret) => bcrypt::verify(plain, &secret.value).unwrap_or(false),
            None => false,
        })
    }

    pub async fn has_users(&self) -> Result<bool> {
        let rows: Vec<User> = self.users.read(None, None).try_collect().await?;
        Ok(!rows.is_empty())
    }

    pub async fn find(&self, username: &str) -> Result<Option<User>> {
        let rows: Vec<User> = self.users.read(None, None).try_collect().await?;
        Ok(rows.into_iter().find(|u| u.username == username))
    }

    async fn password_type_id(&self) -> Result<i64> {
        let types: Vec<crate::generated::SecretType> = self.secret_types.read(None, None).try_collect().await?;
        match types.into_iter().find(|t| t.name == PASSWORD_SECRET_TYPE) {
            Some(found) => Ok(found.id),
            None => invalid(format!("secret type \"{PASSWORD_SECRET_TYPE}\" is missing; run the migrations")),
        }
    }

    async fn store_password(&self, user_id: i64, secret_type_id: i64, hash: &str) -> Result<()> {
        let mut secret = Secret::default();
        secret.secret_type_id = secret_type_id;
        secret.value = hash.into();
        let saved = self.secrets.create(secret).await?;
        let mut link = UserSecret::default();
        link.user_id = user_id;
        link.secret_id = saved.id;
        if let Err(error) = self.user_secrets.create(link).await {
            let _ = self.secrets.delete(saved, None).await;
            return Err(error.into());
        }
        Ok(())
    }

    /// The user's live password secret, if there is one.
    async fn password_secret(&self, user_id: i64, secret_type_id: i64) -> Result<Option<Secret>> {
        let links: Vec<UserSecret> = self.user_secrets.read(None, None).try_collect().await?;
        let ids: HashSet<i64> = links.into_iter().filter(|l| l.user_id == user_id).map(|l| l.secret_id).collect();
        let secrets: Vec<Secret> = self.secrets.read(None, None).try_collect().await?;
        Ok(secrets.into_iter().find(|s| ids.contains(&s.id) && s.secret_type_id == secret_type_id && !s.is_deleted))
    }
}

/// Resolves names to rows; fails listing every unknown name so nothing is half-created.
fn by_name<T>(rows: Vec<T>, names: &[String], kind: &str, name_of: impl Fn(&T) -> String) -> Result<Vec<T>> {
    if names.is_empty() {
        return Ok(vec![]);
    }
    let unknown: Vec<&str> = names.iter().map(String::as_str).filter(|n| !rows.iter().any(|r| name_of(r) == *n)).collect();
    if !unknown.is_empty() {
        let plural = if unknown.len() > 1 { "s" } else { "" };
        return invalid(format!("unknown {kind}{plural}: {} (run \"setup\" to add the defaults)", unknown.join(", ")));
    }
    let mut seen = HashSet::new();
    Ok(rows.into_iter().filter(|r| names.contains(&name_of(r)) && seen.insert(name_of(r))).collect())
}

fn check_password(password: &str) -> Result<()> {
    if password.is_empty() {
        return invalid("password must not be empty");
    }
    if password.len() > MAX_PASSWORD_BYTES {
        return invalid(format!("password is longer than {MAX_PASSWORD_BYTES} bytes (bcrypt limit)"));
    }
    Ok(())
}

fn hash(password: &str) -> Result<String> {
    bcrypt::hash(password, BCRYPT_COST).or_else(|error| invalid(format!("could not hash the password: {error}")))
}
