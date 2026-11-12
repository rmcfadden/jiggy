use crate::services::game_summaries::GameSummariesService;
use crate::services::reviews::ReviewsService;
use axum::{extract::State, http::StatusCode, routing::get, Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;

type Services = (Arc<GameSummariesService>, Arc<ReviewsService>);

pub fn router(service: Arc<GameSummariesService>, reviews: Arc<ReviewsService>) -> Router {
    Router::new().route("/api/games_summaries", get(list)).with_state((service, reviews))
}

/// Each summary with its `reviewCount` and `averageRating` (null when the game has no reviews).
async fn list(State((service, reviews)): State<Services>) -> Result<Json<Value>, StatusCode> {
    let rows = service.read().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let ratings = reviews.stats().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(Value::Array(
        rows.iter()
            .map(|s| {
                let mut summary = s.to_json();
                let rating = ratings.get(&s.id);
                summary["reviewCount"] = json!(rating.map_or(0, |r| r.0));
                summary["averageRating"] = rating.map_or(Value::Null, |r| json!(r.1));
                summary
            })
            .collect(),
    )))
}
