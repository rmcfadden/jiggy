use unicode_normalization::UnicodeNormalization;

/// The URL form of a name: diacritics stripped, lowercased, apostrophes dropped, every other run of characters
/// outside `a-z0-9` collapsed to one `-`, no leading or trailing `-`. Puzzle and category names are looked up by
/// this form, so the same algorithm lives in the TypeScript and C# backends and in `@jiggy/shared`; the cases in
/// `backend/data/slug-cases.json` keep the four in step.
pub fn slug(name: &str) -> String {
    let mut out = String::new();
    let mut pending_dash = false;
    for c in name.nfkd() {
        if ('\u{300}'..='\u{36f}').contains(&c) || c == '\'' || c == '\u{2019}' {
            continue;
        }
        for l in c.to_lowercase() {
            if l.is_ascii_alphanumeric() {
                if pending_dash && !out.is_empty() {
                    out.push('-');
                }
                pending_dash = false;
                out.push(l);
            } else {
                pending_dash = true;
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::slug;

    #[test]
    fn matches_the_shared_cases() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../data/slug-cases.json");
        let cases: Vec<serde_json::Value> = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
        assert!(!cases.is_empty());
        for case in cases {
            let name = case["name"].as_str().unwrap();
            assert_eq!(slug(name), case["slug"].as_str().unwrap(), "{name}");
        }
    }
}
