//! Sends mail over SMTP. Settings: SMTP_HOST (unset = log the message instead of sending), SMTP_PORT, SMTP_USERNAME,
//! SMTP_PASSWORD, SMTP_FROM (default "no-reply@localhost"), SMTP_SECURE = starttls (default) | tls | none.
use crate::services::logs::LogsService;
use lettre::message::{header::ContentType, MultiPart, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use std::sync::Arc;

pub struct EmailService {
    transport: Option<AsyncSmtpTransport<Tokio1Executor>>,
    from: String,
    logs: Arc<LogsService>,
}

impl EmailService {
    pub fn from_env(logs: Arc<LogsService>) -> Result<Self, String> {
        let get = crate::services::config::lookup();
        let from = get("SMTP_FROM").unwrap_or_else(|| "no-reply@localhost".into());
        let transport = match get("SMTP_HOST") {
            None => None,
            Some(host) => {
                let secure = get("SMTP_SECURE").unwrap_or_else(|| "starttls".into()).to_lowercase();
                let mut builder = match secure.as_str() {
                    "tls" => AsyncSmtpTransport::<Tokio1Executor>::relay(&host),
                    "starttls" => AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&host),
                    "none" => Ok(AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(&host)),
                    other => return Err(format!("SMTP_SECURE must be starttls, tls or none, not \"{other}\"")),
                }
                .map_err(|e| format!("SMTP_HOST: {e}"))?;
                if let Some(port) = get("SMTP_PORT") {
                    builder = builder.port(port.parse().map_err(|_| "SMTP_PORT must be a number".to_string())?);
                }
                if let (Some(user), Some(password)) = (get("SMTP_USERNAME"), get("SMTP_PASSWORD")) {
                    builder = builder.credentials(Credentials::new(user, password));
                }
                Some(builder.build())
            }
        };
        Ok(Self { transport, from, logs })
    }

    /// Sends a text + html message. Without SMTP settings the message is written to the log (Information) and counts as sent,
    /// so a developer can follow the link in it.
    pub async fn send(&self, to: &str, subject: &str, text: &str, html: &str) -> Result<(), String> {
        let Some(transport) = &self.transport else {
            self.logs.information("email not sent: SMTP_HOST is not set", &[("to", to), ("subject", subject), ("text", text)]).await;
            return Ok(());
        };
        let message = Message::builder()
            .from(self.from.parse().map_err(|e| format!("SMTP_FROM: {e}"))?)
            .to(to.parse().map_err(|e| format!("recipient: {e}"))?)
            .subject(subject)
            .multipart(MultiPart::alternative().singlepart(SinglePart::builder().header(ContentType::TEXT_PLAIN).body(text.to_string())).singlepart(SinglePart::builder().header(ContentType::TEXT_HTML).body(html.to_string())))
            .map_err(|e| format!("message: {e}"))?;
        match transport.send(message).await {
            Ok(_) => {
                self.logs.information("email sent", &[("to", to), ("subject", subject)]).await;
                Ok(())
            }
            Err(error) => {
                self.logs.error("email failed", &[("to", to), ("subject", subject), ("error", &error.to_string())]).await;
                Err(error.to_string())
            }
        }
    }
}
