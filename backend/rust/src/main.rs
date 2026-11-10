mod datasources_providers;
mod generated;
mod routes;
mod services;

use axum::{routing::get, Json, Router};
use datasources::default;
use serde_json::{json, Value};
use generated::repositories::templatesRepository::TemplatesRepository;
use generated::Repositories;
use services::categories::CategoriesService;
use services::game_parents::GameParentsService;
use services::game_summaries::GameSummariesService;
use services::games::GamesService;
use services::images::ImagesService;
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
    let categories = Arc::new(CategoriesService::new(ds.categories()));
    let templates = Arc::new(TemplatesService::new(Arc::new(TemplatesRepository::new(ds.bind_connection(None)).expect("templates"))));
    let images = Arc::new(ImagesService::new(ds.resources(), ds.mime_types()));
    let games = Arc::new(GamesService::new(
        ds.games(),
        ds.puzzle_games(),
        ds.game_categories(),
        categories.clone(),
        game_parents.clone(),
        templates.clone(),
        images.clone(),
    ));
    let summaries = Arc::new(GameSummariesService::new(ds.bind_connection(None), images.clone()).expect("game summaries"));
    if std::env::args().nth(1).as_deref() == Some("setup") {
        setup(&game_parents, &categories, &templates, &images, &games).await;
        return;
    }

    let app = Router::new()
        .route("/health", get(health))
        .merge(routes::categories::router(categories))
        .merge(routes::game_parents::router(game_parents))
        .merge(routes::templates::router(templates))
        .merge(routes::images::router(images))
        .merge(routes::games::router(games))
        .merge(routes::game_summaries::router(summaries));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app).await.unwrap();
}

/// A seed file: the environment variable when set, otherwise `default` relative to this crate.
fn seed_path(env: &str, default: &str) -> std::path::PathBuf {
    std::env::var(env).map(std::path::PathBuf::from).unwrap_or_else(|_| std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(default))
}

fn report(added: &[String], what: &str, present: &str) {
    if added.is_empty() { println!("{present} already present") } else { println!("added {what}: {}", added.join(", ")) }
}

/// Seeds the database; every step is idempotent and later steps need the earlier ones.
async fn setup(game_parents: &GameParentsService, categories: &CategoriesService, templates: &TemplatesService, images: &ImagesService, games: &GamesService) {
    let added = game_parents.add_parent_games().await.expect("add parent games");
    report(&added, "parent games", "parent games");
    let added = categories.add_categories(&seed_path("CATEGORIES_SEED_PATH", "../data/categories.json")).await.expect("add categories");
    if added.is_empty() { println!("categories already present") } else { println!("added {} categories", added.len()) }
    let added = templates.add_templates(&seed_path("TEMPLATES_SEED_PATH", "../data/templates.json")).await.expect("add templates");
    report(&added, "templates", "templates");
    let added = images.add_samples(&seed_path("IMAGES_SAMPLES_PATH", "../../frontend/apps/web/public/catalog")).await.expect("add sample images");
    report(&added, "sample images", "sample images");
    let added = games.add_puzzles(&seed_path("PUZZLES_SEED_PATH", "../data/puzzles.json")).await.expect("add puzzles");
    if added.is_empty() { println!("puzzles already present") } else { println!("added {} puzzles", added.len()) }
    let added = games.add_attributes().await.expect("add game attributes");
    if added.is_empty() { println!("game attributes already present") } else { println!("added attributes to {} games", added.len()) }
}
