use crate::generated::repositories::gameReviewsRepository::GameReviewsRepository;
use crate::generated::repositories::reviewsRepository::ReviewsRepository;
use crate::generated::{GameReview, Review};
use crate::services::games::GamesService;
use crate::services::users::UsersService;
use datasources::chrono::SecondsFormat;
use datasources::rust_decimal::Decimal;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

pub const MAX_COMMENT: usize = 2000;

/// A refused request (`Refused`, with its HTTP status) or a failure of the datasource.
#[derive(Debug)]
pub enum ReviewError {
    Refused(u16, String),
    Internal(String),
}

impl From<datasources::DatasourceError> for ReviewError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Internal(format!("{err:?}"))
    }
}

type Result<T> = std::result::Result<T, ReviewError>;

fn refused<T>(status: u16, message: impl Into<String>) -> Result<T> {
    Err(ReviewError::Refused(status, message.into()))
}

/// Reviews of games. A review is a `review` row (who, rating, comment) joined to its game by a `game_review` row.
/// Each user can review a game once; ratings are whole stars from 1 to 5.
pub struct ReviewsService {
    reviews: Arc<ReviewsRepository>,
    game_reviews: Arc<GameReviewsRepository>,
    games: Arc<GamesService>,
    users: Arc<UsersService>,
}

impl ReviewsService {
    pub fn new(reviews: Arc<ReviewsRepository>, game_reviews: Arc<GameReviewsRepository>, games: Arc<GamesService>, users: Arc<UsersService>) -> Self {
        Self { reviews, game_reviews, games, users }
    }

    /// The game's reviews, newest first, with their count and average rating (null when there are none).
    pub async fn list(&self, game_id: Option<i64>) -> Result<Value> {
        let game_id = self.require_game(game_id).await?;
        let found = self.for_game(game_id).await?;
        let mut names: HashMap<i64, String> = HashMap::new();
        let mut reviews: Vec<(i64, f64, Value)> = Vec::new();
        for r in &found {
            if !names.contains_key(&r.user_id) {
                let name = self.users.find_by_id(r.user_id).await.map_err(|e| ReviewError::Internal(format!("{e:?}")))?.map(|u| u.username).unwrap_or_else(|| "Unknown".into());
                names.insert(r.user_id, name);
            }
            let rating = rating_of(&r.rating);
            reviews.push((r.id, rating, review_json(r, &names[&r.user_id], rating)));
        }
        reviews.sort_by(|a, b| b.0.cmp(&a.0));
        let average = if reviews.is_empty() { Value::Null } else { json!((reviews.iter().map(|r| r.1).sum::<f64>() / reviews.len() as f64 * 10.0).round() / 10.0) };
        Ok(json!({ "gameId": game_id, "count": reviews.len(), "average": average, "reviews": reviews.into_iter().map(|r| r.2).collect::<Vec<_>>() }))
    }

    /// Review count and average rating (one decimal) for every game that has reviews, by game id.
    pub async fn stats(&self) -> Result<HashMap<i64, (usize, f64)>> {
        let links: Vec<GameReview> = self.game_reviews.read(None, None).try_collect().await?;
        let game_of: HashMap<i64, i64> = links.iter().map(|l| (l.review_id, l.game_id)).collect();
        let rows: Vec<Review> = self.reviews.read(None, None).try_collect().await?;
        let mut sums: HashMap<i64, (usize, f64)> = HashMap::new();
        for row in &rows {
            let Some(game_id) = game_of.get(&row.id) else { continue };
            let sum = sums.entry(*game_id).or_default();
            sum.0 += 1;
            sum.1 += rating_of(&row.rating);
        }
        Ok(sums.into_iter().map(|(game, (count, total))| (game, (count, (total / count as f64 * 10.0).round() / 10.0))).collect())
    }

    /// Adds `user_id`'s review of the game; 400 for a bad rating or comment, 404 for an unknown game, 409 for a second review.
    pub async fn add(&self, game_id: i64, user_id: i64, body: &Value) -> Result<Value> {
        let rating = match body.get("rating") {
            Some(Value::Number(n)) => n.as_i64().filter(|r| (1..=5).contains(r)),
            _ => None,
        };
        let Some(rating) = rating else { return refused(400, "rating must be a whole number from 1 to 5") };
        let comment = match body.get("comment") {
            None | Some(Value::Null) => "",
            Some(Value::String(s)) if s.chars().count() <= MAX_COMMENT => s.as_str(),
            _ => return refused(400, format!("comment must be text of at most {MAX_COMMENT} characters")),
        };
        self.require_game(Some(game_id)).await?;
        if self.for_game(game_id).await?.iter().any(|r| r.user_id == user_id) {
            return refused(409, "you have already reviewed this game");
        }
        let created = self.reviews.create(Review { user_id, comment: comment.trim().to_string(), rating: Decimal::from(rating), ..Review::default() }).await?;
        self.game_reviews.create(GameReview { game_id, review_id: created.id, ..GameReview::default() }).await?;
        let name = self.users.find_by_id(user_id).await.map_err(|e| ReviewError::Internal(format!("{e:?}")))?.map(|u| u.username).unwrap_or_else(|| "Unknown".into());
        Ok(review_json(&created, &name, rating as f64))
    }

    async fn require_game(&self, game_id: Option<i64>) -> Result<i64> {
        match game_id {
            Some(id) if self.games.get(id).await.map_err(|e| ReviewError::Internal(format!("{e:?}")))?.is_some() => Ok(id),
            other => refused(404, format!("unknown game: {}", other.map_or("none".into(), |id| id.to_string()))),
        }
    }

    async fn for_game(&self, game_id: i64) -> Result<Vec<Review>> {
        let links: Vec<GameReview> = self.game_reviews.read(None, None).try_collect().await?;
        let ids: HashSet<i64> = links.iter().filter(|l| l.game_id == game_id).map(|l| l.review_id).collect();
        let rows: Vec<Review> = self.reviews.read(None, None).try_collect().await?;
        Ok(rows.into_iter().filter(|r| ids.contains(&r.id)).collect())
    }
}

fn rating_of(rating: &Decimal) -> f64 {
    rating.to_string().parse().unwrap_or(0.0)
}

fn review_json(r: &Review, user_name: &str, rating: f64) -> Value {
    json!({ "id": r.id, "userId": r.user_id, "userName": user_name, "rating": rating, "comment": r.comment, "created": r.created.to_rfc3339_opts(SecondsFormat::Millis, true) })
}
