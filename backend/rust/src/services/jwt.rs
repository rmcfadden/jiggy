use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use hmac::{Hmac, KeyInit, Mac};
use serde_json::Value;
use sha2::Sha256;

/// Minimal HS256 JWT sign/verify; enough for our own tokens.
const HEADER: &str = r#"{"alg":"HS256","typ":"JWT"}"#;

fn mac(secret: &str, body: &str) -> Hmac<Sha256> {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("hmac accepts any key length");
    mac.update(body.as_bytes());
    mac
}

pub fn sign(claims: &Value, secret: &str) -> String {
    let body = format!("{}.{}", URL_SAFE_NO_PAD.encode(HEADER), URL_SAFE_NO_PAD.encode(claims.to_string()));
    let signature = URL_SAFE_NO_PAD.encode(mac(secret, &body).finalize().into_bytes());
    format!("{body}.{signature}")
}

/// The claims when the signature matches and the token has not expired; otherwise None.
pub fn verify(token: &str, secret: &str, now: i64) -> Option<Value> {
    let parts: Vec<&str> = token.split('.').collect();
    // an exact header match also rejects alg=none and other algorithms
    if parts.len() != 3 || parts[0] != URL_SAFE_NO_PAD.encode(HEADER) {
        return None;
    }
    let signature = URL_SAFE_NO_PAD.decode(parts[2]).ok()?;
    mac(secret, &format!("{}.{}", parts[0], parts[1])).verify_slice(&signature).ok()?;
    let claims: Value = serde_json::from_slice(&URL_SAFE_NO_PAD.decode(parts[1]).ok()?).ok()?;
    (claims.get("exp")?.as_i64()? > now).then_some(claims)
}
