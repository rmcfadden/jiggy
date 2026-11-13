//! Settings from the environment, falling back to `.env` then `.env.development` (dev-only defaults, skipped in production)
//! in the working directory. The real environment wins, then `.env`.
pub fn lookup() -> impl Fn(&str) -> Option<String> {
    let production = ["APP_ENV", "NODE_ENV", "ASPNETCORE_ENVIRONMENT"].iter().any(|k| std::env::var(k).is_ok_and(|v| v.eq_ignore_ascii_case("production")));
    let files: &[&str] = if production { &[".env"] } else { &[".env", ".env.development"] };
    let file = files.iter().map(|f| std::fs::read_to_string(f).unwrap_or_default()).collect::<Vec<_>>().join("\n");
    move |key: &str| {
        std::env::var(key).ok().filter(|v| !v.is_empty()).or_else(|| {
            file.lines().filter_map(|l| l.split_once('=')).find(|(k, _)| k.trim() == key).map(|(_, v)| v.trim().to_string()).filter(|v| !v.is_empty())
        })
    }
}
