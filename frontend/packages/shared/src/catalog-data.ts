import type { Catalog, Category, Puzzle, Review } from "./catalog";
import { DEFAULT_GAME_CONFIG, type GameConfig } from "./game";

const cat = (id: string, name: string, description: string, children: Category[] = []): Category => ({
  id,
  name,
  description,
  children,
});

export const CATEGORIES: Category[] = [
  cat("nature", "Nature", "Landscapes and the great outdoors.", [
    cat("mountains", "Mountains", "Peaks, ridges and alpine views."),
    cat("forests", "Forests", "Woodland paths and dense greenery."),
    cat("beaches", "Beaches", "Sand, surf and palm trees."),
    cat("waterfalls", "Waterfalls", "Cascades and rushing water."),
  ]),
  cat("animals", "Animals", "Creatures great and small.", [
    cat("birds", "Birds", "Feathered friends."),
    cat("wildlife", "Wildlife", "Animals in the wild."),
    cat("pets", "Pets", "Cats, dogs and other companions."),
  ]),
  cat("cities", "Cities & Architecture", "Built environments.", [
    cat("skylines", "Skylines", "City silhouettes."),
    cat("bridges", "Bridges", "Famous crossings."),
    cat("castles", "Castles", "Fortresses and fairy-tale towers."),
  ]),
  cat("space", "Space & Sky", "Above us.", [
    cat("galaxies", "Galaxies", "Stars, nebulae and deep space."),
    cat("sunsets", "Sunsets", "Colourful skies at day's end."),
  ]),
  cat("food", "Food & Drink", "Markets, meals and treats."),
  cat("art", "Art & Patterns", "Famous paintings and prints."),
  cat("vehicles", "Vehicles", "Trains, planes and automobiles."),
  cat("seasons", "Seasons", "Scenes from across the year.", [
    cat("autumn", "Autumn", "Falling leaves and warm colours."),
    cat("winter", "Winter", "Snow and ice."),
  ]),
];

const scrambled = (over: Partial<GameConfig> = {}): GameConfig => ({ ...DEFAULT_GAME_CONFIG, type: "scrambled", ...over });
const nextPieces = (over: Partial<GameConfig> = {}): GameConfig => ({ ...DEFAULT_GAME_CONFIG, type: "next-pieces", ...over });

const r = (rating: number, comment: string): Review => ({ rating, comment });

type Spec = {
  id: string;
  name: string;
  /** Leaf category id; also the image folder. */
  category: string;
  /** Extra categories besides `category`. */
  also?: string[];
  size: string;
  style?: string;
  settings?: GameConfig;
  reviews?: Review[];
};

const puzzle = (s: Spec): Puzzle => ({
  id: s.id,
  name: s.name,
  categories: [s.category, ...(s.also ?? [])],
  template: { size: s.size, style: s.style ?? "subtle" },
  settings: s.settings ?? scrambled(),
  image: { name: s.name, location: `/catalog/${s.category}/${s.id}.jpg` },
  reviews: s.reviews ?? [],
});

export const PUZZLES: Puzzle[] = [
  puzzle({ id: "matterhorn", name: "Matterhorn at Sunset", category: "mountains", size: "48", reviews: [r(5, "Gorgeous colours, the sky is a fun challenge."), r(4, "Lots of similar rock pieces.")] }),
  puzzle({ id: "mount-rainier", name: "Over Mount Rainier", category: "mountains", size: "100", style: "varied", settings: scrambled({ viewPercent: 60, spread: 50 }), reviews: [r(4, "Great mix of sky and snow.")] }),
  puzzle({ id: "misty-forest", name: "Forest Path", category: "forests", also: ["autumn"], size: "20", settings: nextPieces({ panelSize: 4 }), reviews: [r(3, "Lots of green, but relaxing."), r(4, "Nice beginner puzzle.")] }),
  puzzle({ id: "tropical-beach", name: "Tropical Beach Scene", category: "beaches", size: "48", reviews: [r(4, "Cheerful and bright.")] }),
  puzzle({ id: "iguazu-falls", name: "Iguazu Falls", category: "waterfalls", also: ["forests"], size: "100", style: "varied", reviews: [r(5, "Water texture makes this a real test."), r(5, "Stunning.")] }),
  puzzle({ id: "puffin", name: "Atlantic Puffin", category: "birds", size: "20", settings: nextPieces(), reviews: [r(5, "Adorable!"), r(4, "Easy once you find the beak.")] }),
  puzzle({ id: "elephants", name: "Elephants on the Savanna", category: "wildlife", size: "48", reviews: [r(4, "Good variety of textures.")] }),
  puzzle({ id: "tabby-cat", name: "Tabby Cat", category: "pets", size: "12", reviews: [r(5, "Quick and cute."), r(4, "Fur pattern is tricky.")] }),
  puzzle({ id: "manhattan-skyline", name: "Manhattan Skyline", category: "skylines", size: "200", style: "varied", settings: scrambled({ looseCount: 40, spread: 60 }), reviews: [r(4, "Window grids go on forever.")] }),
  puzzle({ id: "golden-gate-bridge", name: "Golden Gate Bridge", category: "bridges", size: "100", reviews: [r(5, "Iconic and satisfying.")] }),
  puzzle({ id: "neuschwanstein", name: "Neuschwanstein Castle", category: "castles", size: "48", style: "varied", reviews: [r(5, "Fairy tale vibes."), r(4, "Towers are easy anchors.")] }),
  puzzle({ id: "andromeda", name: "Andromeda Galaxy", category: "galaxies", size: "100", settings: nextPieces({ panelSize: 5, order: "random" }), reviews: [r(3, "Lots of black pieces!"), r(5, "Beautiful when finished.")] }),
  puzzle({ id: "ocean-sunset", name: "Ocean Sunset", category: "sunsets", also: ["beaches"], size: "48", reviews: [r(4, "Gradient sky is the hard part.")] }),
  puzzle({ id: "fruit-market", name: "A Fruit Stall in a Market", category: "food", also: ["art"], size: "48", style: "varied", reviews: [r(4, "Rich painted detail.")] }),
  puzzle({ id: "starry-night", name: "The Starry Night", category: "art", size: "100", settings: scrambled({ viewPercent: 50 }), reviews: [r(5, "Swirls are mesmerising."), r(4, "Tough but fair.")] }),
  puzzle({ id: "great-wave", name: "The Great Wave", category: "art", size: "48", reviews: [r(5, "A classic.")] }),
  puzzle({ id: "steam-locomotive", name: "Steam Locomotive", category: "vehicles", size: "20", reviews: [r(4, "Fun for train fans.")] }),
  puzzle({ id: "autumn-leaves", name: "Autumn Leaves in a Stream", category: "autumn", also: ["forests"], size: "100", style: "varied", reviews: [r(4, "Warm colours, plenty of detail.")] }),
  puzzle({ id: "snowy-mountains", name: "Snowy Mountains", category: "winter", also: ["mountains"], size: "48", settings: nextPieces({ panelDock: "right" }), reviews: [r(3, "Very white!"), r(4, "Peaceful.")] }),
];

export const CATALOG: Catalog = { categories: CATEGORIES, puzzles: PUZZLES };
