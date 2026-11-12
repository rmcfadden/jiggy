use super::scrambled::ScrambledGameService;
use super::service::PuzzleGameService;
use super::tray::{LastXGameService, NextPiecesGameService};
use super::types::{refuse, GameResult};
use std::collections::HashMap;

/// Maps a parent game's `location` to the service that runs its games.
pub struct GameServiceRegistry {
    services: HashMap<&'static str, Box<dyn PuzzleGameService>>,
}

impl GameServiceRegistry {
    pub fn new() -> Self {
        Self::with(vec![Box::new(ScrambledGameService::default()), Box::new(NextPiecesGameService::default()), Box::new(LastXGameService::default())])
    }

    pub fn with(all: Vec<Box<dyn PuzzleGameService>>) -> Self {
        Self { services: all.into_iter().map(|s| (s.kind(), s)).collect() }
    }

    /// The service for a parent `location`; 422 when no service runs that kind of game.
    pub fn for_parent(&self, location: &str) -> GameResult<&dyn PuzzleGameService> {
        match self.services.get(location) {
            Some(service) => Ok(service.as_ref()),
            None => refuse(422, format!("no game service for \"{location}\"")),
        }
    }
}
