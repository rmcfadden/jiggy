use crate::services::slug::slug;
use std::collections::HashSet;

/// One page of the site: a path such as `/puzzles/matterhorn-at-sunset` and, when known, the UTC date it last changed (`YYYY-MM-DD`).
#[derive(Debug, PartialEq)]
pub struct SitemapUrl {
    pub path: String,
    pub lastmod: Option<String>,
}

/// A file the `sitemap` command writes.
pub struct SitemapFile {
    pub name: String,
    pub xml: String,
}

/// The protocol allows 50,000 URLs (and 50 MB) per file.
pub const MAX_URLS_PER_FILE: usize = 50_000;

const NS: &str = "http://www.sitemaps.org/schemas/sitemap/0.9";

/// Escapes text for use in XML element content.
pub fn xml_escape(text: &str) -> String {
    text.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;").replace('\'', "&apos;")
}

/// The pages of the site: the puzzle list, a page per category and a page per puzzle (`name`, UTC `updated` date), named by the slug of their names.
pub fn site_pages(categories: &[String], puzzles: &[(String, String)]) -> Vec<SitemapUrl> {
    let mut pages = vec![SitemapUrl { path: "/puzzles".into(), lastmod: None }];
    let mut seen = HashSet::new();
    for name in categories {
        let s = slug(name);
        if !s.is_empty() && seen.insert(format!("c/{s}")) {
            pages.push(SitemapUrl { path: format!("/category/{s}"), lastmod: None });
        }
    }
    for (name, updated) in puzzles {
        let s = slug(name);
        if !s.is_empty() && seen.insert(format!("p/{s}")) {
            pages.push(SitemapUrl { path: format!("/puzzles/{s}"), lastmod: Some(updated.clone()) });
        }
    }
    pages
}

/// The sitemaps.org XML for `urls`. One file named `file_name` when they fit; otherwise numbered files
/// (`sitemap-1.xml`, ...) of at most `max` URLs plus a sitemap index under `file_name` that lists them.
pub fn build_sitemaps(base_url: &str, urls: &[SitemapUrl], file_name: &str, max: usize) -> Vec<SitemapFile> {
    let base = base_url.trim_end_matches('/');
    let (stem, ext) = match file_name.rfind('.') {
        Some(dot) if dot > 0 => file_name.split_at(dot),
        _ => (file_name, ""),
    };
    let urlset = |chunk: &[SitemapUrl]| {
        let mut xml = format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"{NS}\">\n");
        for u in chunk {
            xml.push_str(&format!("  <url>\n    <loc>{}</loc>", xml_escape(&format!("{base}{}", u.path))));
            if let Some(date) = &u.lastmod {
                xml.push_str(&format!("\n    <lastmod>{}</lastmod>", xml_escape(date)));
            }
            xml.push_str("\n  </url>\n");
        }
        xml.push_str("</urlset>\n");
        xml
    };
    if urls.len() <= max {
        return vec![SitemapFile { name: file_name.into(), xml: urlset(urls) }];
    }
    let mut files: Vec<SitemapFile> = urls.chunks(max).enumerate().map(|(i, chunk)| SitemapFile { name: format!("{stem}-{}{ext}", i + 1), xml: urlset(chunk) }).collect();
    let mut index = format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<sitemapindex xmlns=\"{NS}\">\n");
    for f in &files {
        index.push_str(&format!("  <sitemap>\n    <loc>{}</loc>\n  </sitemap>\n", xml_escape(&format!("{base}/{}", f.name))));
    }
    index.push_str("</sitemapindex>\n");
    files.push(SitemapFile { name: file_name.into(), xml: index });
    files
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn site_pages_lists_the_puzzle_list_categories_and_puzzles_by_slug_once_each() {
        let cats = ["Churches & Cathedrals", "Cities", "cities", "!!!"].map(String::from);
        let puzzles = [("Matterhorn at Sunset".to_string(), "2026-11-12".to_string()), ("Matterhorn at sunset".to_string(), "2026-11-13".to_string())];
        let paths: Vec<_> = site_pages(&cats, &puzzles).into_iter().map(|u| (u.path, u.lastmod)).collect();
        assert_eq!(
            paths,
            vec![
                ("/puzzles".to_string(), None),
                ("/category/churches-cathedrals".to_string(), None),
                ("/category/cities".to_string(), None),
                ("/puzzles/matterhorn-at-sunset".to_string(), Some("2026-11-12".to_string())),
            ]
        );
    }

    #[test]
    fn writes_one_escaped_urlset() {
        let urls = [SitemapUrl { path: "/puzzles".into(), lastmod: None }, SitemapUrl { path: "/puzzles/a&b".into(), lastmod: Some("2026-11-12".into()) }];
        let files = build_sitemaps("https://example.com/", &urls, "sitemap.xml", MAX_URLS_PER_FILE);
        assert_eq!(files.len(), 1);
        assert_eq!(files[0].name, "sitemap.xml");
        assert_eq!(
            files[0].xml,
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/puzzles</loc>\n  </url>\n  <url>\n    <loc>https://example.com/puzzles/a&amp;b</loc>\n    <lastmod>2026-11-12</lastmod>\n  </url>\n</urlset>\n"
        );
    }

    #[test]
    fn splits_past_the_limit_and_writes_an_index() {
        let urls: Vec<_> = (1..=3).map(|n| SitemapUrl { path: format!("/puzzles/p{n}"), lastmod: None }).collect();
        let files = build_sitemaps("https://example.com", &urls, "site.xml", 2);
        assert_eq!(files.iter().map(|f| f.name.as_str()).collect::<Vec<_>>(), ["site-1.xml", "site-2.xml", "site.xml"]);
        assert!(files[0].xml.contains("p1") && files[0].xml.contains("p2") && !files[0].xml.contains("p3"));
        assert!(files[2].xml.contains("<sitemapindex") && files[2].xml.contains("https://example.com/site-1.xml") && files[2].xml.contains("site-2.xml"));
    }
}
