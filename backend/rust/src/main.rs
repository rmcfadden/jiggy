mod datasources_providers;
mod generated;

use axum::{extract::State, http::StatusCode, routing::get, Json, Router};
use datasources::{default, CRUDRepository};
use futures_util::TryStreamExt;
use generated::{Category, Repositories};
use serde_json::{json, Value};
use std::sync::Arc;

type Repo = Arc<CRUDRepository<Category>>;

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

/// Categories as a tree: `[{ id, name, description, children }]`, where `id` is the lowercased name.
async fn categories(State(repo): State<Repo>) -> Result<Json<Value>, StatusCode> {
    let rows: Vec<Category> = repo
        .read(&())
        .try_collect()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows: Vec<Category> = rows.into_iter().filter(|c| c.is_enabled && !c.is_deleted).collect();
    Ok(Json(Value::Array(children(&rows, None))))
}

fn children(rows: &[Category], parent: Option<i64>) -> Vec<Value> {
    rows.iter()
        .filter(|c| c.category_id == parent)
        .map(|c| {
            json!({
                "id": c.name.to_lowercase(),
                "name": c.name,
                "description": c.description,
                "children": children(rows, Some(c.id)),
            })
        })
        .collect()
}

#[tokio::main]
async fn main() {
    datasources_providers::register();
    let repo: Repo = default().expect("datasource").categories();

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/categories", get(categories))
        .with_state(repo);
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app).await.unwrap();
}
