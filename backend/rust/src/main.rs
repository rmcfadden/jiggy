mod datasources_providers;
mod generated;
mod routes;
mod services;
mod users_cli;

use axum::{routing::get, Json, Router};
use datasources::default;
use serde_json::{json, Value};
use generated::repositories::templatesRepository::TemplatesRepository;
use generated::Repositories;
use services::categories::CategoriesService;
use services::game_parents::GameParentsService;
use services::game_plays::GamePlaysService;
use services::reviews::ReviewsService;
use services::game_summaries::GameSummariesService;
use services::games::GamesService;
use services::images::ImagesService;
use services::oauth::OAuthService;
use services::sessions::SessionService;
use services::setup::SetupService;
use services::signin::SigninService;
use services::signup::SignupService;
use services::templates::TemplatesService;
use services::tokens::{TokenService, TokenSettings};
use services::users::UsersService;
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
        ds.game_categories(),
        categories.clone(),
        game_parents.clone(),
        templates.clone(),
        images.clone(),
    ));
    let summaries = Arc::new(GameSummariesService::new(ds.bind_connection(None), images.clone(), ds.games()).expect("game summaries"));
    let users = Arc::new(UsersService::new(ds.users(), ds.roles(), ds.groups(), ds.secrets(), ds.secret_types(), ds.user_secrets()));
    let settings = TokenSettings::from_env().expect("token settings");
    let tokens = Arc::new(TokenService::new(ds.tokens(), ds.user_tokens(), ds.token_types(), settings.clone()));
    let sessions = Arc::new(SessionService::new(ds.sessions(), ds.session_hits(), ds.session_types(), tokens.clone()));
    let signin = Arc::new(SigninService::new(users.clone(), tokens.clone(), ds.contacts(), ds.emails()));
    let signup = Arc::new(SignupService::new(users.clone(), tokens.clone(), ds.contacts(), ds.emails(), ds.email_types(), ds.genders()));
    let oauth = Arc::new(OAuthService::new(users.clone(), tokens.clone(), sessions, settings));
    let game_plays = Arc::new(GamePlaysService::new(ds.game_plays(), ds.game_play_states(), ds.game_play_actions(), ds.game_play_users(), games.clone(), templates.clone()));
    let reviews = Arc::new(ReviewsService::new(ds.reviews(), ds.game_reviews(), games.clone(), users.clone()));
    let identity = SetupService::new(ds.roles(), ds.groups(), users.clone());
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.first().map(String::as_str) {
        Some("setup") => {
            setup(&game_parents, &categories, &templates, &images, &games, &identity).await;
            return;
        }
        Some(command @ ("add-user" | "update-user")) => std::process::exit(users_cli::run(command, &users, &args[1..]).await),
        _ => {}
    }

    let app = Router::new()
        .route("/health", get(health))
        .merge(routes::categories::router(categories))
        .merge(routes::game_parents::router(game_parents))
        .merge(routes::templates::router(templates))
        .merge(routes::images::router(images))
        .merge(routes::games::router(games))
        .merge(routes::game_summaries::router(summaries))
        .merge(routes::signin::router(signin))
        .merge(routes::signup::router(signup))
        .merge(routes::oauth::router(oauth))
        .merge(routes::reviews::router(reviews, tokens.clone()))
        .merge(routes::game_plays::router(game_plays, tokens));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    println!("listening on :{port}");
    axum::serve(listener, app.into_make_service_with_connect_info::<std::net::SocketAddr>()).await.unwrap();
}

/// A seed file: the environment variable when set, otherwise `default` relative to this crate.
fn seed_path(env: &str, default: &str) -> std::path::PathBuf {
    std::env::var(env).map(std::path::PathBuf::from).unwrap_or_else(|_| std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(default))
}

fn report(added: &[String], what: &str, present: &str) {
    if added.is_empty() { println!("{present} already present") } else { println!("added {what}: {}", added.join(", ")) }
}

/// Seeds the database; every step is idempotent and later steps need the earlier ones.
async fn setup(game_parents: &GameParentsService, categories: &CategoriesService, templates: &TemplatesService, images: &ImagesService, games: &GamesService, identity: &SetupService) {
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
    let (roles, groups) = identity.add_defaults().await.expect("add roles and groups");
    report(&roles, "roles", "roles");
    report(&groups, "groups", "groups");
    let password = std::env::var("ADMIN_PASSWORD").ok().filter(|p| !p.is_empty());
    match identity.add_admin(password).await.expect("add admin user") {
        None => println!("users already present, no admin added"),
        Some((password, true)) => println!("added user admin with password {password} (shown once; change it with update-user)"),
        Some((_, false)) => println!("added user admin with the password from ADMIN_PASSWORD"),
    }
    let user_password = std::env::var("USER_PASSWORD").ok().filter(|p| !p.is_empty());
    match identity.add_user(user_password).await.expect("add user") {
        None => println!("user already present, no user added"),
        Some((password, true)) => println!("added user user (no admin role) with password {password} (shown once; change it with update-user)"),
        Some((_, false)) => println!("added user user (no admin role) with the password from USER_PASSWORD"),
    }
}
