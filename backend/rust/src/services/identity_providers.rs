//! Registers and edits sign-in providers. Everything about a provider except its flags lives in its settings map.
//! Keep the presets in step with the TypeScript and C# copies (identityProviderPresets.ts, IdentityProviderPresets.cs).
use crate::generated::repositories::identityProviderTypesRepository::IdentityProviderTypesRepository;
use crate::generated::repositories::identityProvidersRepository::IdentityProvidersRepository;
use crate::generated::{IdentityProvider, IdentityProviderType};
use futures_util::TryStreamExt;
use std::collections::BTreeMap;
use std::sync::Arc;

/// A bad argument or a missing/duplicate provider (the CLI prints it and exits 1), or a datasource failure.
#[derive(Debug)]
pub enum IdentityProviderError {
    Invalid(String),
    Datasource(datasources::DatasourceError),
}

impl std::fmt::Display for IdentityProviderError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IdentityProviderError::Invalid(message) => write!(f, "{message}"),
            IdentityProviderError::Datasource(error) => write!(f, "{error}"),
        }
    }
}

impl From<datasources::DatasourceError> for IdentityProviderError {
    fn from(error: datasources::DatasourceError) -> Self {
        IdentityProviderError::Datasource(error)
    }
}

type Result<T> = std::result::Result<T, IdentityProviderError>;

fn invalid<T>(message: impl Into<String>) -> Result<T> {
    Err(IdentityProviderError::Invalid(message.into()))
}

pub const PROVIDER_TYPES: [&str; 2] = ["oidc", "oauth2"];
/// Provider-neutral facts a provider can be asked for; `sub` is always taken.
pub const CLAIMS: [&str; 4] = ["email", "first_name", "last_name", "avatar"];
/// Settings the CLI manages itself; `--set`/`--unset` must use the options instead.
const MANAGED_SETTINGS: [&str; 5] = ["preset", "claims", "scopes", "extra_scopes", "userinfo_fields"];
const REQUIRED_SETTINGS: [&str; 3] = ["client_id", "client_secret", "redirect_uri"];

struct Preset {
    ptype: &'static str,
    display_name: &'static str,
    /// Default button image, served by the frontend.
    image_url: &'static str,
    settings: &'static [(&'static str, &'static str)],
    base_scopes: &'static [&'static str],
    /// Scope that supplies each claim; a claim missing here cannot be had from this provider.
    claim_scopes: &'static [(&'static str, &'static str)],
}

const OIDC_CLAIM_SCOPES: &[(&str, &str)] = &[("email", "email"), ("first_name", "profile"), ("last_name", "profile"), ("avatar", "profile")];

static GOOGLE: Preset = Preset {
    ptype: "oidc",
    display_name: "Google",
    image_url: "/sso/google.svg",
    settings: &[
        ("issuer", "https://accounts.google.com"),
        ("authorize_url", "https://accounts.google.com/o/oauth2/v2/auth"),
        ("token_url", "https://oauth2.googleapis.com/token"),
        ("userinfo_url", "https://openidconnect.googleapis.com/v1/userinfo"),
        ("jwks_url", "https://www.googleapis.com/oauth2/v3/certs"),
    ],
    base_scopes: &["openid"],
    claim_scopes: OIDC_CLAIM_SCOPES,
};

static FACEBOOK: Preset = Preset {
    ptype: "oauth2",
    display_name: "Facebook",
    image_url: "/sso/facebook.svg",
    settings: &[
        ("authorize_url", "https://www.facebook.com/v19.0/dialog/oauth"),
        ("token_url", "https://graph.facebook.com/v19.0/oauth/access_token"),
        ("userinfo_url", "https://graph.facebook.com/v19.0/me"),
    ],
    base_scopes: &["public_profile"],
    // first_name, last_name and picture come with public_profile, so only email needs a scope.
    claim_scopes: &[("email", "email"), ("first_name", "public_profile"), ("last_name", "public_profile"), ("avatar", "public_profile")],
};

static APPLE: Preset = Preset {
    ptype: "oidc",
    display_name: "Apple",
    image_url: "/sso/apple.svg",
    settings: &[
        ("issuer", "https://appleid.apple.com"),
        ("authorize_url", "https://appleid.apple.com/auth/authorize"),
        ("token_url", "https://appleid.apple.com/auth/token"),
        ("jwks_url", "https://appleid.apple.com/auth/keys"),
        ("response_mode", "form_post"),
    ],
    base_scopes: &[],
    // Apple sends the name only on the first sign-in and has no avatar.
    claim_scopes: &[("email", "email"), ("first_name", "name"), ("last_name", "name")],
};

fn preset(name: &str) -> Option<&'static Preset> {
    match name {
        "google" => Some(&GOOGLE),
        "facebook" => Some(&FACEBOOK),
        "apple" => Some(&APPLE),
        _ => None,
    }
}

/// The claim -> scope table for a provider: its preset's, the standard OIDC one for a custom oidc provider, else none.
fn claim_table(preset_name: &str, ptype: &str) -> Option<&'static [(&'static str, &'static str)]> {
    match preset(preset_name) {
        Some(p) => Some(p.claim_scopes),
        None if ptype == "oidc" => Some(OIDC_CLAIM_SCOPES),
        None => None,
    }
}

/// What the add and update commands accept; every field except the name is optional on update.
#[derive(Default, Clone, Debug)]
pub struct ProviderInput {
    pub preset: Option<String>,
    pub provider_type: Option<String>,
    pub description: Option<String>,
    pub is_enabled: Option<bool>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub image_url: Option<String>,
    pub display_name: Option<String>,
    pub claims: Option<String>,
    pub scopes: Option<String>,
    pub authorize_url: Option<String>,
    pub token_url: Option<String>,
    pub userinfo_url: Option<String>,
    pub issuer: Option<String>,
    pub jwks_url: Option<String>,
    pub redirect_uri: Option<String>,
    /// `key=value` pairs from `--set`.
    pub set: Vec<String>,
    /// Setting names from `--unset`.
    pub unset: Vec<String>,
}

pub struct ProviderResult {
    pub provider: IdentityProvider,
    pub warnings: Vec<String>,
    pub changed: Vec<String>,
}

pub fn parse_claims(value: &str) -> Result<Vec<String>> {
    let mut names: Vec<String> = vec![];
    for name in value.split(',').map(str::trim).filter(|s| !s.is_empty()) {
        if !names.iter().any(|n| n == name) {
            names.push(name.to_string());
        }
    }
    let unknown: Vec<&String> = names.iter().filter(|n| !CLAIMS.contains(&n.as_str())).collect();
    if !unknown.is_empty() {
        let list = unknown.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", ");
        return invalid(format!("unknown claim{}: {list} (choose from {})", if unknown.len() > 1 { "s" } else { "" }, CLAIMS.join(", ")));
    }
    Ok(names)
}

fn words(value: &str) -> Vec<String> {
    value.split(|c: char| c.is_whitespace() || c == ',').filter(|s| !s.is_empty()).map(String::from).collect()
}

/// Claims the provider cannot supply, so the CLI can warn instead of failing.
pub fn unsupported_claims(preset_name: &str, ptype: &str, claims: &[String]) -> Vec<String> {
    match claim_table(preset_name, ptype) {
        Some(table) => claims.iter().filter(|c| !table.iter().any(|(k, _)| k == c)).cloned().collect(),
        None => vec![], // a custom oauth2 provider's claims are unknown, so never warn
    }
}

/// The scope list for a provider: base scopes, one per requested claim, then any extra scopes.
pub fn compute_scopes(preset_name: &str, ptype: &str, claims: &[String], extra: &[String]) -> Vec<String> {
    let base: Vec<&str> = match preset(preset_name) {
        Some(p) => p.base_scopes.to_vec(),
        None if ptype == "oidc" => vec!["openid"],
        None => vec![],
    };
    let table = claim_table(preset_name, ptype).unwrap_or(&[]);
    let mut scopes: Vec<String> = vec![];
    let candidates = base.iter().map(|s| s.to_string()).chain(claims.iter().filter_map(|c| table.iter().find(|(k, _)| k == c).map(|(_, s)| s.to_string()))).chain(extra.iter().cloned());
    for scope in candidates {
        if !scopes.contains(&scope) {
            scopes.push(scope);
        }
    }
    scopes
}

/// Graph fields to ask Facebook for, from the claims (`id` is always needed).
pub fn facebook_fields(claims: &[String]) -> String {
    let has = |c: &str| claims.iter().any(|x| x == c);
    let mut fields = vec!["id"];
    if has("email") {
        fields.push("email");
    }
    if has("first_name") {
        fields.push("first_name");
    }
    if has("last_name") {
        fields.push("last_name");
    }
    if has("avatar") {
        fields.push("picture.type(large)");
    }
    fields.join(",")
}

type Settings = BTreeMap<String, String>;

fn check_type(ptype: &str) -> Result<()> {
    if PROVIDER_TYPES.contains(&ptype) { Ok(()) } else { invalid(format!("--type must be {}, got \"{ptype}\"", PROVIDER_TYPES.join(" or "))) }
}

fn apply_endpoints(settings: &mut Settings, input: &ProviderInput) {
    for (key, value) in [
        ("authorize_url", &input.authorize_url),
        ("token_url", &input.token_url),
        ("userinfo_url", &input.userinfo_url),
        ("issuer", &input.issuer),
        ("jwks_url", &input.jwks_url),
    ] {
        if let Some(value) = value {
            settings.insert(key.into(), value.clone());
        }
    }
}

/// Stores the extra scopes as given and the full scope list the sign-in flow will request.
fn apply_scopes(settings: &mut Settings, preset_name: &str, ptype: &str, claims: &[String], extra: &[String], extra_given: bool) {
    if extra_given {
        if extra.is_empty() {
            settings.remove("extra_scopes");
        } else {
            settings.insert("extra_scopes".into(), extra.join(" "));
        }
    }
    settings.insert("scopes".into(), compute_scopes(preset_name, ptype, claims, extra).join(" "));
    if preset_name == "facebook" {
        settings.insert("userinfo_fields".into(), facebook_fields(claims));
    }
}

fn check_setting_name(key: &str) -> Result<()> {
    let mut chars = key.chars();
    let first_ok = chars.next().is_some_and(|c| c.is_ascii_lowercase());
    if !first_ok || !chars.all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_') {
        return invalid(format!("setting name \"{key}\" must be lowercase letters, digits and _"));
    }
    if MANAGED_SETTINGS.contains(&key) {
        return invalid(format!("\"{key}\" is managed by --claims/--scopes; use those options"));
    }
    Ok(())
}

/// `--set key=value` adds or overwrites a setting; `--unset key` removes one. The CLI-managed names are refused.
fn apply_set(settings: &mut Settings, input: &ProviderInput) -> Result<()> {
    for pair in &input.set {
        let (key, value) = pair.split_once('=').unwrap_or((pair.as_str(), ""));
        if key.is_empty() || value.is_empty() {
            return invalid(format!("--set needs key=value, got \"{pair}\""));
        }
        check_setting_name(key)?;
        settings.insert(key.into(), value.into());
    }
    for key in &input.unset {
        check_setting_name(key)?;
        if REQUIRED_SETTINGS.contains(&key.as_str()) {
            return invalid(format!("{key} is required and cannot be unset"));
        }
        settings.remove(key);
    }
    Ok(())
}

fn warn(preset_name: &str, ptype: &str, claims: &[String]) -> Vec<String> {
    let missing = unsupported_claims(preset_name, ptype, claims);
    if missing.is_empty() { vec![] } else { vec![format!("{preset_name} cannot supply: {}; those claims will be skipped", missing.join(", "))] }
}

pub fn check_name(name: &str) -> Result<()> {
    let mut chars = name.chars();
    let ok = chars.next().is_some_and(|c| c.is_ascii_lowercase()) && chars.all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '_');
    if ok { Ok(()) } else { invalid("name must be lowercase letters, digits, - or _, starting with a letter (e.g. google)") }
}

/// The type and settings a new provider is created with.
#[derive(Debug)]
pub struct NewProvider {
    pub ptype: String,
    pub preset: String,
    pub claims: Vec<String>,
    pub settings: Settings,
}

/// Validates the add options and builds the settings map (pure; no datasource access).
pub fn build_create(name: &str, input: &ProviderInput, site_base_url: Option<&str>) -> Result<NewProvider> {
    check_name(name)?;
    let preset_name = input.preset.clone().unwrap_or_else(|| "custom".into());
    let known = preset(&preset_name);
    if known.is_none() && preset_name != "custom" {
        return invalid(format!("unknown preset \"{preset_name}\" (choose from google, facebook, apple, custom)"));
    }
    let ptype = input.provider_type.clone().or_else(|| known.map(|p| p.ptype.to_string())).unwrap_or_else(|| "oidc".into());
    check_type(&ptype)?;
    if let (Some(p), Some(given)) = (known, &input.provider_type) {
        if given != p.ptype {
            return invalid(format!("preset {preset_name} is {}; drop --type or use --preset=custom", p.ptype));
        }
    }
    let Some(client_id) = &input.client_id else { return invalid("--client-id is required") };
    let Some(client_secret) = &input.client_secret else { return invalid("--client-secret is required") };

    let claims = match &input.claims {
        Some(value) => parse_claims(value)?,
        None => vec!["email".to_string()],
    };
    let extra = words(input.scopes.as_deref().unwrap_or(""));
    let mut settings = Settings::new();
    if let Some(p) = known {
        for (key, value) in p.settings {
            settings.insert((*key).into(), (*value).into());
        }
    }
    settings.insert("preset".into(), preset_name.clone());
    settings.insert("client_id".into(), client_id.clone());
    settings.insert("client_secret".into(), client_secret.clone());
    settings.insert("display_name".into(), input.display_name.clone().or_else(|| known.map(|p| p.display_name.to_string())).unwrap_or_else(|| name.to_string()));
    settings.insert("claims".into(), claims.join(","));
    if let Some(image) = input.image_url.clone().or_else(|| known.map(|p| p.image_url.to_string())) {
        settings.insert("image_url".into(), image);
    }
    apply_endpoints(&mut settings, input);
    let redirect = match (&input.redirect_uri, site_base_url.map(str::trim).filter(|s| !s.is_empty())) {
        (Some(uri), _) => uri.clone(),
        (None, Some(base)) => format!("{}/api/identity-providers/{name}/callback", base.trim_end_matches('/')),
        (None, None) => return invalid("the callback URL is unknown: pass --redirect-uri or set SITE_BASE_URL"),
    };
    settings.insert("redirect_uri".into(), redirect);
    apply_scopes(&mut settings, &preset_name, &ptype, &claims, &extra, input.scopes.is_some());
    apply_set(&mut settings, input)?;

    if preset_name == "custom" {
        let mut missing: Vec<String> = ["authorize_url", "token_url"].iter().chain(if ptype == "oauth2" { &["userinfo_url"][..] } else { &[][..] }).filter(|k| !settings.contains_key(**k)).map(|k| format!("--{}", k.replace('_', "-"))).collect();
        if ptype == "oidc" && !settings.contains_key("issuer") && !settings.contains_key("jwks_url") {
            missing.push("--issuer (or --jwks-url)".into());
        }
        if !missing.is_empty() {
            return invalid(format!("a custom {ptype} provider needs {}", missing.join(", ")));
        }
    }
    Ok(NewProvider { ptype, preset: preset_name, claims, settings })
}

/// The result of applying update options to a stored provider.
#[derive(Debug)]
pub struct UpdatedProvider {
    pub preset: String,
    pub ptype: String,
    pub claims: Vec<String>,
    pub settings: Settings,
    pub is_enabled: bool,
    pub description: Option<String>,
    pub changed: Vec<String>,
}

/// Applies the update options to a copy of the stored settings (pure). The whole map is written back, since view update replaces it.
pub fn build_update(existing: &IdentityProvider, input: &ProviderInput) -> Result<UpdatedProvider> {
    if input.preset.is_some() || input.provider_type.is_some() {
        return invalid("update-identity-provider cannot change the preset or type; add a new provider instead");
    }
    let before: Settings = existing.settings.iter().map(|(k, v)| (k.clone(), v.clone())).collect();
    let mut settings = before.clone();
    let preset_name = settings.get("preset").cloned().unwrap_or_else(|| "custom".into());
    let ptype = existing.identity_provider_type_name.clone();
    check_type(&ptype)?;
    for (key, value) in [("client_id", &input.client_id), ("client_secret", &input.client_secret), ("image_url", &input.image_url), ("display_name", &input.display_name), ("redirect_uri", &input.redirect_uri)] {
        if let Some(value) = value {
            settings.insert(key.into(), value.clone());
        }
    }
    apply_endpoints(&mut settings, input);
    let claims = parse_claims(input.claims.as_deref().unwrap_or_else(|| before.get("claims").map(String::as_str).unwrap_or("")))?;
    let extra = words(input.scopes.as_deref().unwrap_or_else(|| before.get("extra_scopes").map(String::as_str).unwrap_or("")));
    if input.claims.is_some() {
        settings.insert("claims".into(), claims.join(","));
    }
    if input.claims.is_some() || input.scopes.is_some() {
        apply_scopes(&mut settings, &preset_name, &ptype, &claims, &extra, input.scopes.is_some());
    }
    apply_set(&mut settings, input)?;

    let mut changed: Vec<String> = vec![];
    let is_enabled = input.is_enabled.unwrap_or(existing.is_enabled);
    if is_enabled != existing.is_enabled {
        changed.push("is_enabled".into());
    }
    let description = input.description.clone().or_else(|| existing.description.clone());
    if description != existing.description {
        changed.push("description".into());
    }
    let keys: std::collections::BTreeSet<&String> = settings.keys().chain(before.keys()).collect();
    changed.extend(keys.into_iter().filter(|k| settings.get(*k) != before.get(*k)).cloned());
    if changed.is_empty() {
        return invalid("nothing to update: pass at least one option that changes a value");
    }
    Ok(UpdatedProvider { preset: preset_name, ptype, claims, settings, is_enabled, description, changed })
}

pub struct IdentityProvidersService {
    providers: Arc<IdentityProvidersRepository>,
    types: Arc<IdentityProviderTypesRepository>,
    site_base_url: Option<String>,
}

impl IdentityProvidersService {
    pub fn new(providers: Arc<IdentityProvidersRepository>, types: Arc<IdentityProviderTypesRepository>, site_base_url: Option<String>) -> Self {
        Self { providers, types, site_base_url }
    }

    pub async fn all(&self) -> Result<Vec<IdentityProvider>> {
        Ok(self.providers.read(None, None).try_collect::<Vec<IdentityProvider>>().await?)
    }

    pub async fn find(&self, name: &str) -> Result<Option<IdentityProvider>> {
        Ok(self.providers.read(None, None).try_collect::<Vec<IdentityProvider>>().await?.into_iter().find(|p| p.name == name))
    }

    pub async fn create(&self, name: &str, input: ProviderInput) -> Result<ProviderResult> {
        let name = name.trim();
        check_name(name)?;
        if let Some(existing) = self.find(name).await? {
            return invalid(format!("identity provider \"{name}\" already exists{}", if existing.is_deleted { " (deleted)" } else { "" }));
        }
        let plan = build_create(name, &input, self.site_base_url.as_deref())?;
        self.require_type(&plan.ptype).await?;
        let mut item = IdentityProvider::default();
        item.name = name.to_string();
        item.description = input.description.clone();
        item.identity_provider_type_name = plan.ptype.clone();
        item.is_enabled = input.is_enabled.unwrap_or(true);
        item.settings = plan.settings.clone().into_iter().collect();
        let created = self.providers.create(item).await?;
        Ok(ProviderResult { provider: created, warnings: warn(&plan.preset, &plan.ptype, &plan.claims), changed: plan.settings.keys().cloned().collect() })
    }

    pub async fn update(&self, name: &str, input: ProviderInput) -> Result<ProviderResult> {
        let name = name.trim();
        let Some(mut existing) = self.find(name).await?.filter(|p| !p.is_deleted) else { return invalid(format!("identity provider \"{name}\" not found")) };
        let plan = build_update(&existing, &input)?;
        existing.is_enabled = plan.is_enabled;
        existing.description = plan.description.clone();
        existing.settings = plan.settings.clone().into_iter().collect();
        self.providers.update(existing.clone(), None).await?;
        Ok(ProviderResult { provider: existing, warnings: warn(&plan.preset, &plan.ptype, &plan.claims), changed: plan.changed })
    }

    /// The view is written by type name, so only check the lookup row exists (it comes from the seeds).
    async fn require_type(&self, name: &str) -> Result<()> {
        let rows = self.types.read(None, None).try_collect::<Vec<IdentityProviderType>>().await?;
        if rows.iter().any(|t| t.name == name) { Ok(()) } else { invalid(format!("identity provider type \"{name}\" is missing; run the migrations")) }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn input(preset: &str) -> ProviderInput {
        ProviderInput { preset: Some(preset.into()), client_id: Some("cid".into()), client_secret: Some("sec".into()), ..Default::default() }
    }
    fn create(name: &str, input: &ProviderInput) -> Result<NewProvider> {
        build_create(name, input, Some("https://example.com"))
    }
    fn err(result: Result<impl Sized>) -> String {
        result.err().expect("expected an error").to_string()
    }
    fn stored(plan: NewProvider) -> IdentityProvider {
        let mut p = IdentityProvider::default();
        p.name = "x".into();
        p.identity_provider_type_name = plan.ptype;
        p.settings = plan.settings.into_iter().collect();
        p
    }
    fn strings(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn claims_parse_dedupe_and_reject_unknown() {
        assert_eq!(parse_claims("email, first_name,email").unwrap(), strings(&["email", "first_name"]));
        assert!(err(parse_claims("email,phone")).contains("unknown claim: phone"));
    }

    #[test]
    fn scopes_per_preset() {
        let s = |preset: &str, ptype: &str, claims: &[&str], extra: &[&str]| compute_scopes(preset, ptype, &strings(claims), &strings(extra)).join(" ");
        assert_eq!(s("google", "oidc", &["email"], &[]), "openid email");
        assert_eq!(s("google", "oidc", &["email", "first_name", "last_name", "avatar"], &[]), "openid email profile");
        assert_eq!(s("facebook", "oauth2", &["email", "avatar"], &[]), "public_profile email");
        assert_eq!(s("apple", "oidc", &["email", "first_name", "last_name"], &[]), "email name");
        assert_eq!(s("custom", "oauth2", &["email"], &["read:user"]), "read:user");
        assert_eq!(s("google", "oidc", &["email"], &["openid", "calendar"]), "openid email calendar");
    }

    #[test]
    fn claims_a_provider_cannot_supply() {
        assert_eq!(unsupported_claims("apple", "oidc", &strings(&["email", "avatar"])), strings(&["avatar"]));
        assert!(unsupported_claims("custom", "oauth2", &strings(&["avatar"])).is_empty());
        assert_eq!(facebook_fields(&strings(&["email", "avatar"])), "id,email,picture.type(large)");
    }

    #[test]
    fn create_fills_a_google_preset() {
        let plan = create("google", &input("google")).unwrap();
        assert_eq!(plan.ptype, "oidc");
        assert_eq!(plan.settings["authorize_url"], "https://accounts.google.com/o/oauth2/v2/auth");
        assert_eq!(plan.settings["claims"], "email");
        assert_eq!(plan.settings["scopes"], "openid email");
        assert_eq!(plan.settings["redirect_uri"], "https://example.com/api/identity-providers/google/callback");
        assert_eq!(plan.settings["display_name"], "Google");
    }

    #[test]
    fn create_validates_its_input() {
        assert!(err(create("Google", &input("google"))).contains("name must be"));
        assert!(err(create("google", &ProviderInput { client_secret: None, ..input("google") })).contains("--client-secret is required"));
        assert!(err(create("google", &input("nope"))).contains("unknown preset"));
        assert!(err(create("google", &ProviderInput { provider_type: Some("oauth2".into()), ..input("google") })).contains("preset google is oidc"));
        assert!(err(create("google", &ProviderInput { claims: Some("ssn".into()), ..input("google") })).contains("unknown claim"));
        assert!(err(build_create("google", &input("google"), Some(""))).contains("callback URL is unknown"));
        let custom = ProviderInput { client_id: Some("a".into()), client_secret: Some("b".into()), ..Default::default() };
        assert!(err(create("corp", &custom)).contains("custom oidc provider needs --authorize-url, --token-url"));
        let oauth2 = ProviderInput { provider_type: Some("oauth2".into()), authorize_url: Some("x".into()), token_url: Some("y".into()), ..custom };
        assert!(err(create("corp", &oauth2)).contains("--userinfo-url"));
    }

    #[test]
    fn apple_warns_that_avatar_is_unavailable() {
        let plan = create("apple", &ProviderInput { claims: Some("email,avatar".into()), ..input("apple") }).unwrap();
        assert!(warn(&plan.preset, &plan.ptype, &plan.claims)[0].contains("apple cannot supply: avatar"));
        assert_eq!(plan.settings["scopes"], "email");
        assert_eq!(plan.settings["response_mode"], "form_post");
    }

    #[test]
    fn update_edits_a_copy_of_the_settings_and_recomputes_scopes() {
        let existing = stored(create("google", &input("google")).unwrap());
        let next = build_update(&existing, &ProviderInput { claims: Some("email,first_name".into()), image_url: Some("https://img/g.png".into()), set: strings(&["hd=example.com"]), ..Default::default() }).unwrap();
        assert_eq!(next.settings["scopes"], "openid email profile");
        assert_eq!(next.settings["hd"], "example.com");
        assert_eq!(next.settings["client_secret"], "sec"); // untouched settings survive the whole-map rewrite
        assert!(next.changed.contains(&"scopes".to_string()) && next.changed.contains(&"hd".to_string()) && !next.changed.contains(&"client_secret".to_string()));
        let mut again = existing.clone();
        again.settings = next.settings.into_iter().collect();
        let off = build_update(&again, &ProviderInput { unset: strings(&["hd"]), is_enabled: Some(false), ..Default::default() }).unwrap();
        assert!(!off.settings.contains_key("hd"));
        assert!(!off.is_enabled);
    }

    #[test]
    fn update_refuses_empty_unknown_managed_and_required_changes() {
        let existing = stored(create("google", &input("google")).unwrap());
        let update = |input: ProviderInput| err(build_update(&existing, &input));
        assert!(update(ProviderInput::default()).contains("nothing to update"));
        assert!(update(ProviderInput { client_id: Some("cid".into()), ..Default::default() }).contains("nothing to update"));
        assert!(update(ProviderInput { preset: Some("apple".into()), ..Default::default() }).contains("cannot change the preset"));
        assert!(update(ProviderInput { set: strings(&["scopes=x"]), ..Default::default() }).contains("managed by --claims"));
        assert!(update(ProviderInput { unset: strings(&["client_secret"]), ..Default::default() }).contains("cannot be unset"));
        assert!(update(ProviderInput { set: strings(&["novalue"]), ..Default::default() }).contains("key=value"));
    }

    #[test]
    fn extra_scopes_are_kept_across_later_claim_changes() {
        let existing = stored(create("google", &ProviderInput { scopes: Some("calendar".into()), ..input("google") }).unwrap());
        let next = build_update(&existing, &ProviderInput { claims: Some("email,avatar".into()), ..Default::default() }).unwrap();
        assert_eq!(next.settings["scopes"], "openid email profile calendar");
        assert_eq!(next.settings["extra_scopes"], "calendar");
    }
}
