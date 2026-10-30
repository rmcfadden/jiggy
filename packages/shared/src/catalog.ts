import type { GameConfig } from "./game";

export type Category = {
  id: string;
  name: string;
  description: string;
  children: Category[];
};

export type CatalogImage = {
  name: string;
  /** Public URL path, e.g. `/catalog/mountains/matterhorn.jpg`. */
  location: string;
};

export type Review = {
  /** 1-5 */
  rating: number;
  comment: string;
};

export type Puzzle = {
  id: string;
  name: string;
  /** Ids of the categories the puzzle belongs to. */
  categories: string[];
  /** Piece-count and shape style ids (see the web app's template options). */
  template: { size: string; style: string };
  settings: GameConfig;
  image: CatalogImage;
  reviews: Review[];
};

export type Catalog = {
  categories: Category[];
  puzzles: Puzzle[];
};

export function findCategory(categories: Category[], id: string): Category | undefined {
  for (const c of categories) {
    if (c.id === id) return c;
    const hit = findCategory(c.children, id);
    if (hit) return hit;
  }
  return undefined;
}

/** The category's own id plus the ids of all its descendants. */
export function descendantIds(category: Category): string[] {
  return [category.id, ...category.children.flatMap(descendantIds)];
}

export function allCategoryIds(categories: Category[]): string[] {
  return categories.flatMap(descendantIds);
}

/** Puzzles in the category or any of its sub-categories; every puzzle when `id` is omitted. */
export function puzzlesInCategory(catalog: Catalog, id?: string): Puzzle[] {
  if (!id) return catalog.puzzles;
  const category = findCategory(catalog.categories, id);
  if (!category) return [];
  const ids = new Set(descendantIds(category));
  return catalog.puzzles.filter((p) => p.categories.some((c) => ids.has(c)));
}

/** Mean review rating, or null when there are no reviews. */
export function averageRating(puzzle: Puzzle): number | null {
  if (puzzle.reviews.length === 0) return null;
  return puzzle.reviews.reduce((sum, r) => sum + r.rating, 0) / puzzle.reviews.length;
}

export function findPuzzle(catalog: Catalog, id: string | null): Puzzle | undefined {
  return id ? catalog.puzzles.find((p) => p.id === id) : undefined;
}
