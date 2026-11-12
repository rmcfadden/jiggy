use crate::services::categories::CategoriesService;
use crate::services::games::GamesService;
use crate::services::sitemap::{build_sitemaps, site_pages, MAX_URLS_PER_FILE};
use std::path::{Path, PathBuf};

/// Where `npm run dev` serves the frontend; `--test` builds the URLs on it.
pub const TEST_BASE_URL: &str = "http://localhost:5174";

const USAGE: &str = "usage: sitemap [--test] [--base-url <https://your-site>] [--out <file>]   (base URL defaults to $SITE_BASE_URL; --test uses the local dev frontend, http://localhost:5174; file to sitemap.xml)";

/// The `--base-url` and `--out` options after the command name; `env_base` is the `SITE_BASE_URL` fallback.
pub fn parse_args(args: &[String], env_base: Option<String>) -> Result<(String, PathBuf), String> {
    let (mut base, mut out, mut test) = (None, None, false);
    let mut it = args.iter();
    while let Some(flag) = it.next() {
        match (flag.as_str(), it.as_slice().first()) {
            ("--test", _) => test = true,
            ("--base-url", Some(v)) => {
                base = Some(v.clone());
                it.next();
            }
            ("--out", Some(v)) => {
                out = Some(v.clone());
                it.next();
            }
            _ => return Err(USAGE.into()),
        }
    }
    let fallback = if test { Some(TEST_BASE_URL.to_string()) } else { env_base };
    let base = base.or(fallback).map(|b| b.trim().to_string()).unwrap_or_default();
    if base.is_empty() {
        return Err(format!("the site's base URL is required: pass --base-url or set SITE_BASE_URL\n{USAGE}"));
    }
    let host = base.strip_prefix("https://").or_else(|| base.strip_prefix("http://")).unwrap_or("");
    if host.is_empty() || host.starts_with('/') || host.contains(char::is_whitespace) {
        return Err(format!("the base URL must start with http:// or https://: {base}"));
    }
    Ok((base, PathBuf::from(out.unwrap_or_else(|| "sitemap.xml".into()))))
}

/// Writes the sitemap of every category and puzzle (see `build_sitemaps`) for search engines; returns the exit code.
pub async fn run(args: &[String], categories: &CategoriesService, games: &GamesService) -> i32 {
    let (base, out) = match parse_args(args, std::env::var("SITE_BASE_URL").ok()) {
        Ok(options) => options,
        Err(message) => {
            eprintln!("{message}");
            return 1;
        }
    };
    match write(&base, &out, categories, games).await {
        Ok(message) => {
            println!("{message}");
            0
        }
        Err(err) => {
            eprintln!("sitemap: {err}");
            1
        }
    }
}

async fn write(base: &str, out: &Path, categories: &CategoriesService, games: &GamesService) -> Result<String, Box<dyn std::error::Error>> {
    let names: Vec<String> = categories.flat().await?.iter().filter_map(|c| c["name"].as_str().map(String::from)).collect();
    let puzzles: Vec<(String, String)> = games
        .list()
        .await
        .map_err(|err| format!("{err:?}"))?
        .iter()
        .map(|g| (g["name"].as_str().unwrap_or_default().to_string(), g["updated"].as_str().unwrap_or_default().chars().take(10).collect()))
        .collect();
    let pages = site_pages(&names, &puzzles);
    let dir = out.parent().filter(|d| !d.as_os_str().is_empty()).unwrap_or(Path::new("."));
    std::fs::create_dir_all(dir)?;
    let file_name = out.file_name().and_then(|n| n.to_str()).unwrap_or("sitemap.xml");
    let files = build_sitemaps(base, &pages, file_name, MAX_URLS_PER_FILE);
    for file in &files {
        std::fs::write(dir.join(&file.name), &file.xml)?;
    }
    let extra = if files.len() > 1 { format!(" ({} files plus the index)", files.len() - 1) } else { String::new() };
    Ok(format!("wrote {} URLs to {}{extra}", pages.len(), std::path::absolute(out)?.display()))
}

#[cfg(test)]
mod tests {
    use super::parse_args;

    fn args(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn flags_override_the_environment_and_the_base_url_is_required() {
        let (base, out) = parse_args(&args(&["--base-url", "https://a.example", "--out", "x/map.xml"]), Some("https://b.example".into())).unwrap();
        assert_eq!((base.as_str(), out.to_str().unwrap()), ("https://a.example", "x/map.xml"));
        let (base, out) = parse_args(&[], Some("https://b.example".into())).unwrap();
        assert_eq!((base.as_str(), out.to_str().unwrap()), ("https://b.example", "sitemap.xml"));
        assert!(parse_args(&[], None).is_err());
        assert!(parse_args(&args(&["--base-url", "example.com"]), None).is_err());
        assert!(parse_args(&args(&["--bogus", "1"]), Some("https://b.example".into())).is_err());
        let (base, _) = parse_args(&args(&["--test"]), Some("https://b.example".into())).unwrap();
        assert_eq!(base, "http://localhost:5174");
        let (base, _) = parse_args(&args(&["--test", "--base-url", "https://a.example"]), None).unwrap();
        assert_eq!(base, "https://a.example");
    }
}
