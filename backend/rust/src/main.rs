mod datasources_providers;
mod generated;
mod routes;
mod services;

use axum::{routing::get, Json, Router};
use datasources::default;
use serde_json::{json, Value};
use generated::Repositories;
use services::categories::CategoriesService;
use services::game_parents::GameParentsService;
use services::templates::TemplatesService;
use std::sync::Arc;

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

#[tokio::main]
async fn main() {
    datasources_providers::register();
    let ds = default().expect("datasource");
    let game_parents = Arc::new(GameParentsService::new(ds.game_parents()));
    if std::env::args().nth(1).as_deref() == Some("setup") {
        let added = game_parents.add_parent_games().await.expect("add parent games");
        if added.is_empty() {
            println!("parent games already present");
        } else {
            println!("added parent games: {}", added.join(", "));
        }
        return;
    }
    let categories = Arc::new(CategoriesService::new(ds.categories()));
    let templates = Arc::new(TemplatesService::new(ds.templates(), ds.template_types()));

    let app = Router::new()
        .route("/health", get(health))
        .merge(routes::categories::router(categories))
        .merge(routes::game_parents::router(game_parents))
        .merge(routes::templates::router(templates));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app).await.unwrap();
}
