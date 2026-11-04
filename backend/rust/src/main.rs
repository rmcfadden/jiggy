mod datasources_providers;

use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    datasources_providers::register();

    let app = Router::new().route("/health", get(health));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app).await.unwrap();
}
