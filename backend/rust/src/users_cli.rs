//! `add-user` and `update-user`: argument parsing and output around `UsersService`.
use crate::services::users::{CreateUser, UpdateUser, UserError, UsersService};

const ADD_USAGE: &str = "add-user <username> --password=<pw> [--groups=a,b] [--roles=a,b] [--is_enabled=true|false]";
const UPDATE_USAGE: &str = "update-user <username> [--password=<pw>] [--is_enabled=true|false]";

/// The username and the `--name=value` / `--name value` options of one command line.
struct Args {
    username: String,
    password: Option<String>,
    groups: Option<String>,
    roles: Option<String>,
    is_enabled: Option<String>,
}

fn parse(args: &[String], usage: &str) -> Result<Args, UserError> {
    let bad = |message: String| UserError::Invalid(format!("{message}\nusage: {usage}"));
    let mut parsed = Args { username: String::new(), password: None, groups: None, roles: None, is_enabled: None };
    let mut positionals = vec![];
    let mut iter = args.iter();
    while let Some(arg) = iter.next() {
        let Some(option) = arg.strip_prefix("--") else {
            positionals.push(arg.clone());
            continue;
        };
        let (name, value) = match option.split_once('=') {
            Some((name, value)) => (name, value.to_string()),
            None => (option, iter.next().cloned().ok_or_else(|| bad(format!("option --{option} needs a value")))?),
        };
        match name {
            "password" => parsed.password = Some(value),
            "groups" => parsed.groups = Some(value),
            "roles" => parsed.roles = Some(value),
            "is_enabled" => parsed.is_enabled = Some(value),
            _ => return Err(bad(format!("unknown option --{name}"))),
        }
    }
    if positionals.len() != 1 {
        return Err(UserError::Invalid(format!("usage: {usage}")));
    }
    parsed.username = positionals.remove(0);
    Ok(parsed)
}

fn list(value: &Option<String>) -> Vec<String> {
    value.as_deref().unwrap_or("").split(',').map(str::trim).filter(|s| !s.is_empty()).map(String::from).collect()
}

fn parse_bool(value: &Option<String>) -> Result<Option<bool>, UserError> {
    match value.as_deref() {
        None => Ok(None),
        Some("true") => Ok(Some(true)),
        Some("false") => Ok(Some(false)),
        Some(other) => Err(UserError::Invalid(format!("--is_enabled must be true or false, got \"{other}\""))),
    }
}

async fn add(service: &UsersService, args: &[String]) -> Result<String, UserError> {
    let args = parse(args, ADD_USAGE)?;
    let Some(password) = args.password.clone() else { return Err(UserError::Invalid("--password is required".into())) };
    let created = service
        .create(CreateUser { username: args.username.clone(), password, roles: list(&args.roles), groups: list(&args.groups), is_enabled: parse_bool(&args.is_enabled)? })
        .await?;
    Ok(format!("added user {} (id {})", created.username, created.id))
}

async fn update(service: &UsersService, args: &[String]) -> Result<String, UserError> {
    let args = parse(args, UPDATE_USAGE)?;
    if args.groups.is_some() || args.roles.is_some() {
        return Err(UserError::Invalid("update-user only changes --password and --is_enabled".into()));
    }
    let updated = service.update(&args.username, UpdateUser { password: args.password.clone(), is_enabled: parse_bool(&args.is_enabled)? }).await?;
    Ok(format!("updated user {}", updated.username))
}

/// Runs `add-user` or `update-user` (`args` are the words after the command); returns the process exit code.
pub async fn run(command: &str, service: &UsersService, args: &[String]) -> i32 {
    let result = if command == "add-user" { add(service, args).await } else { update(service, args).await };
    match result {
        Ok(message) => {
            println!("{message}");
            0
        }
        Err(error) => {
            eprintln!("{error}");
            1
        }
    }
}
