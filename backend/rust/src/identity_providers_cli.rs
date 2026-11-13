//! `add-identity-provider` and `update-identity-provider`: argument parsing and output around `IdentityProvidersService`.
use crate::services::identity_providers::{IdentityProviderError, IdentityProvidersService, ProviderInput, ProviderResult};

const ADD_USAGE: &str = "add-identity-provider <name> --preset=google|facebook|apple|custom --client-id=<id> --client-secret=<secret> [--type=oidc|oauth2] \
[--image-url=<url>] [--display-name=<label>] [--claims=email,first_name,last_name,avatar] [--scopes=\"a b\"] \
[--authorize-url=..] [--token-url=..] [--userinfo-url=..] [--issuer=..] [--jwks-url=..] [--redirect-uri=..] \
[--set key=value]... [--description=<text>] [--is_enabled=true|false]";
const UPDATE_USAGE: &str = "update-identity-provider <name> [--client-id=<id>] [--client-secret=<secret>] [--image-url=<url>] [--display-name=<label>] [--claims=..] [--scopes=\"a b\"] \
[--authorize-url=..] [--token-url=..] [--userinfo-url=..] [--issuer=..] [--jwks-url=..] [--redirect-uri=..] \
[--set key=value]... [--unset key]... [--description=<text>] [--is_enabled=true|false]";

/// Setting names that hold credentials; their values are never printed.
const SECRET_SETTINGS: [&str; 1] = ["client_secret"];

fn parse_bool(value: &str) -> Result<bool, IdentityProviderError> {
    match value {
        "true" => Ok(true),
        "false" => Ok(false),
        other => Err(IdentityProviderError::Invalid(format!("--is_enabled must be true or false, got \"{other}\""))),
    }
}

/// The provider name and the `--name=value` / `--name value` options of one command line.
pub fn parse(args: &[String], usage: &str) -> Result<(String, ProviderInput), IdentityProviderError> {
    let bad = |message: String| IdentityProviderError::Invalid(format!("{message}\nusage: {usage}"));
    let mut input = ProviderInput::default();
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
        let some = Some(value.clone());
        match name {
            "preset" => input.preset = some,
            "type" => input.provider_type = some,
            "description" => input.description = some,
            "is_enabled" => input.is_enabled = Some(parse_bool(&value)?),
            "client-id" => input.client_id = some,
            "client-secret" => input.client_secret = some,
            "image-url" => input.image_url = some,
            "display-name" => input.display_name = some,
            "claims" => input.claims = some,
            "scopes" => input.scopes = some,
            "authorize-url" => input.authorize_url = some,
            "token-url" => input.token_url = some,
            "userinfo-url" => input.userinfo_url = some,
            "issuer" => input.issuer = some,
            "jwks-url" => input.jwks_url = some,
            "redirect-uri" => input.redirect_uri = some,
            "set" => input.set.push(value),
            "unset" => input.unset.push(value),
            _ => return Err(bad(format!("unknown option --{name}"))),
        }
    }
    if positionals.len() != 1 {
        return Err(IdentityProviderError::Invalid(format!("usage: {usage}")));
    }
    Ok((positionals.remove(0), input))
}

fn report(verb: &str, name: &str, result: &ProviderResult) -> String {
    let changed: Vec<String> = result.changed.iter().map(|k| if SECRET_SETTINGS.contains(&k.as_str()) { format!("{k} (hidden)") } else { k.clone() }).collect();
    for warning in &result.warnings {
        eprintln!("warning: {warning}");
    }
    format!("{verb} identity provider {name} (id {}); {}: {}", result.provider.id, if verb == "added" { "settings" } else { "changed" }, changed.join(", "))
}

/// Runs `add-identity-provider` or `update-identity-provider` (`args` are the words after the command); returns the process exit code.
pub async fn run(command: &str, service: &IdentityProvidersService, args: &[String]) -> i32 {
    let adding = command == "add-identity-provider";
    let result = async {
        let (name, input) = parse(args, if adding { ADD_USAGE } else { UPDATE_USAGE })?;
        let done = if adding { service.create(&name, input).await? } else { service.update(&name, input).await? };
        Ok::<_, IdentityProviderError>(report(if adding { "added" } else { "updated" }, name.trim(), &done))
    }
    .await;
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

#[cfg(test)]
mod tests {
    use super::*;

    fn args(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn parses_both_option_forms_and_repeated_set() {
        let (name, input) = parse(&args(&["google", "--preset=google", "--client-id", "abc", "--set", "a=1", "--set=b=2", "--is_enabled=false"]), ADD_USAGE).unwrap();
        assert_eq!(name, "google");
        assert_eq!((input.preset.as_deref(), input.client_id.as_deref(), input.is_enabled), (Some("google"), Some("abc"), Some(false)));
        assert_eq!(input.set, vec!["a=1".to_string(), "b=2".to_string()]);
    }

    #[test]
    fn rejects_unknown_options_missing_names_and_bad_booleans() {
        assert!(parse(&args(&["g", "--bogus=1"]), ADD_USAGE).unwrap_err().to_string().contains("unknown option --bogus"));
        assert!(parse(&args(&["--preset=google"]), ADD_USAGE).unwrap_err().to_string().contains("usage:"));
        assert!(parse(&args(&["g", "--is_enabled=maybe"]), ADD_USAGE).unwrap_err().to_string().contains("true or false"));
        assert!(parse(&args(&["g", "--client-id"]), ADD_USAGE).unwrap_err().to_string().contains("needs a value"));
    }
}
