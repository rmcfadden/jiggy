//! The code that runs a puzzle game: the rules of each game type, with no knowledge of the database.
pub mod puzzle;
pub mod registry;
pub mod rng;
pub mod scrambled;
pub mod service;
pub mod tray;
pub mod types;

#[cfg(test)]
mod tests;
