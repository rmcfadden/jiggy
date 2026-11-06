mod datasources_providers;
mod generated;
mod routes;
mod services;

use axum::{routing::get, Json, Router};
use datasources::default;
use serde_json::{json, Value};
use generated::Repositories;
use services::categories::CategoriesService;
use std::sync::Arc;

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    datasources_providers::register();
    let ds = default().expect("datasource");
    let categories = Arc::new(CategoriesService::new(ds.categories()));

    let app = Router::new()
        .route("/health", get(health))
        .merge(routes::categories::router(categories));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app).await.unwrap();
}
