//! Application log kept in the database (`logs` rows with a type and optional name/value attributes).
#![allow(dead_code)] // all four levels are API, even where nothing writes them yet
use crate::generated::repositories::logsRepository::LogsRepository;
use crate::generated::Log;
use std::collections::HashMap;
use std::sync::Arc;

/// The seeded log type names.
pub const ERROR: &str = "Error";
pub const INFORMATION: &str = "Information";
pub const VERBOSE: &str = "Verbose";
pub const TRACE: &str = "Trace";

pub struct LogsService {
    logs: Arc<LogsRepository>,
}

impl LogsService {
    pub fn new(logs: Arc<LogsRepository>) -> Self {
        Self { logs }
    }

    /// Writes one entry. A failure to log is printed and swallowed: logging must never break the request that caused it.
    pub async fn write(&self, level: &str, message: &str, attributes: &[(&str, &str)]) {
        let mut row = Log::default();
        row.log_type_name = level.to_string();
        row.message = message.to_string();
        row.attributes = attributes.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect::<HashMap<_, _>>();
        if let Err(error) = self.logs.create(row).await {
            eprintln!("log {level}: {message} (not stored: {error})");
        }
    }

    pub async fn error(&self, message: &str, attributes: &[(&str, &str)]) {
        self.write(ERROR, message, attributes).await
    }

    pub async fn information(&self, message: &str, attributes: &[(&str, &str)]) {
        self.write(INFORMATION, message, attributes).await
    }

    pub async fn verbose(&self, message: &str, attributes: &[(&str, &str)]) {
        self.write(VERBOSE, message, attributes).await
    }

    pub async fn trace(&self, message: &str, attributes: &[(&str, &str)]) {
        self.write(TRACE, message, attributes).await
    }
}
