use crate::generated::repositories::sessionHitsRepository::SessionHitsRepository;
use crate::generated::repositories::sessionTypesRepository::SessionTypesRepository;
use crate::generated::repositories::sessionsRepository::SessionsRepository;
use crate::generated::{Session, SessionHit, SessionType};
use crate::services::tokens::{AuthError, Result, TokenService};
use datasources::chrono::{DateTime, Utc};
use futures_util::TryStreamExt;
use std::net::IpAddr;
use std::sync::Arc;

pub const SIGNIN_SESSION_TYPE: &str = "Signin";

#[derive(Default)]
pub struct CreateSession {
    pub user_id: i64,
    /// Session type name; defaults to "Signin".
    pub session_type: Option<String>,
    pub ip: Option<IpAddr>,
    /// Seconds of inactivity after which the session lapses.
    pub relative_expiration: Option<i32>,
    pub absolute_expiration: Option<DateTime<Utc>>,
}

/// Creates sessions, records each hit with the caller's IP, and revokes sessions along with their tokens.
pub struct SessionService {
    sessions: Arc<SessionsRepository>,
    session_hits: Arc<SessionHitsRepository>,
    session_types: Arc<SessionTypesRepository>,
    tokens: Arc<TokenService>,
}

impl SessionService {
    pub fn new(sessions: Arc<SessionsRepository>, session_hits: Arc<SessionHitsRepository>, session_types: Arc<SessionTypesRepository>, tokens: Arc<TokenService>) -> Self {
        Self { sessions, session_hits, session_types, tokens }
    }

    pub async fn create(&self, input: CreateSession) -> Result<Session> {
        let type_name = input.session_type.as_deref().unwrap_or(SIGNIN_SESSION_TYPE);
        let types: Vec<SessionType> = self.session_types.read(None, None).try_collect().await?;
        let Some(session_type) = types.into_iter().find(|t| t.name == type_name) else {
            return Err(AuthError::Invalid(format!("session type \"{type_name}\" is missing; run the migrations")));
        };
        let mut row = Session::default();
        row.session_type_id = session_type.id;
        row.user_id = Some(input.user_id);
        row.relative_expiration = input.relative_expiration;
        row.absolute_expiration = input.absolute_expiration;
        let created = self.sessions.create(row).await?;
        if let Err(error) = self.record_hit(created.id, input.ip).await {
            let _ = self.sessions.delete(created, None).await;
            return Err(error);
        }
        Ok(created)
    }

    /// Records a hit and returns the session when it is still active; None when unknown, revoked or lapsed.
    #[allow(dead_code)]
    pub async fn hit(&self, uuid: &str, ip: Option<IpAddr>) -> Result<Option<Session>> {
        let Some(found) = self.get(uuid).await? else { return Ok(None) };
        if !self.is_active(&found).await? {
            return Ok(None);
        }
        self.record_hit(found.id, ip).await?;
        Ok(Some(found))
    }

    pub async fn get(&self, uuid: &str) -> Result<Option<Session>> {
        let rows: Vec<Session> = self.sessions.read(None, None).try_collect().await?;
        Ok(rows.into_iter().find(|s| s.uuid.to_string() == uuid))
    }

    /// Active = enabled, not revoked, not past its absolute expiry and not idle longer than its relative expiry.
    pub async fn is_active(&self, session: &Session) -> Result<bool> {
        let now = Utc::now();
        if !session.is_enabled || session.revoked.is_some() || session.expired.is_some() {
            return Ok(false);
        }
        if session.absolute_expiration.is_some_and(|at| at <= now) {
            return Ok(false);
        }
        if let Some(seconds) = session.relative_expiration.filter(|s| *s > 0) {
            let hits: Vec<SessionHit> = self.session_hits.read(None, None).try_collect().await?;
            let last = hits.iter().filter(|h| h.session_id == session.id).map(|h| h.created).fold(session.created, |a, b| a.max(b));
            if last + datasources::chrono::Duration::seconds(seconds as i64) <= now {
                return Ok(false);
            }
        }
        Ok(true)
    }

    /// Revokes the session and every access/refresh token issued for it. Returns false when it does not exist.
    #[allow(dead_code)]
    pub async fn revoke(&self, uuid: &str) -> Result<bool> {
        let Some(mut found) = self.get(uuid).await? else { return Ok(false) };
        if found.revoked.is_none() {
            found.revoked = Some(Utc::now());
            found.is_enabled = false;
            self.sessions.update(found, None).await?;
        }
        self.tokens.revoke_for_session(uuid).await?;
        Ok(true)
    }

    async fn record_hit(&self, session_id: i64, ip: Option<IpAddr>) -> Result<SessionHit> {
        let mut hit = SessionHit::default();
        hit.session_id = session_id;
        hit.ip_address = ip_bytes(ip).to_vec();
        Ok(self.session_hits.create(hit).await?)
    }
}

/// 16-byte (IPv6) form of an address; IPv4 is mapped to ::ffff:a.b.c.d. Unknown is all zeros.
pub fn ip_bytes(ip: Option<IpAddr>) -> [u8; 16] {
    match ip {
        Some(IpAddr::V4(v4)) => v4.to_ipv6_mapped().octets(),
        Some(IpAddr::V6(v6)) => v6.octets(),
        None => [0; 16],
    }
}
