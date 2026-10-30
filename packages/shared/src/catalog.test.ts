import { describe, expect, it } from "vitest";
import { allCategoryIds, averageRating, descendantIds, findCategory, findPuzzle, puzzlesInCategory } from "./catalog";
import { CATALOG } from "./catalog-data";

describe("catalog helpers", () => {
  it("finds nested categories and lists descendants", () => {
    const nature = findCategory(CATALOG.categories, "nature")!;
    expect(findCategory(CATALOG.categories, "waterfalls")?.name).toBe("Waterfalls");
    expect(descendantIds(nature)).toEqual(["nature", "mountains", "forests", "beaches", "waterfalls"]);
    expect(findCategory(CATALOG.categories, "nope")).toBeUndefined();
  });

  it("includes sub-category puzzles when filtering by a parent", () => {
    const mountains = puzzlesInCategory(CATALOG, "mountains").map((p) => p.id);
    expect(mountains).toContain("matterhorn");
    const nature = puzzlesInCategory(CATALOG, "nature").map((p) => p.id);
    expect(nature).toEqual(expect.arrayContaining(mountains));
    expect(puzzlesInCategory(CATALOG)).toBe(CATALOG.puzzles);
    expect(puzzlesInCategory(CATALOG, "nope")).toEqual([]);
  });

  it("averages ratings", () => {
    const p = { ...CATALOG.puzzles[0], reviews: [{ rating: 5, comment: "" }, { rating: 4, comment: "" }] };
    expect(averageRating(p)).toBe(4.5);
    expect(averageRating({ ...p, reviews: [] })).toBeNull();
  });

  it("looks puzzles up by id", () => {
    expect(findPuzzle(CATALOG, "puffin")?.name).toBe("Atlantic Puffin");
    expect(findPuzzle(CATALOG, null)).toBeUndefined();
  });
});

describe("catalog data", () => {
  it("has unique category and puzzle ids", () => {
    const cats = allCategoryIds(CATALOG.categories);
    expect(new Set(cats).size).toBe(cats.length);
    const ids = CATALOG.puzzles.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only existing categories and has images and valid ratings", () => {
    const cats = new Set(allCategoryIds(CATALOG.categories));
    for (const p of CATALOG.puzzles) {
      expect(p.categories.length).toBeGreaterThan(0);
      for (const c of p.categories) expect(cats.has(c), `${p.id} -> ${c}`).toBe(true);
      expect(p.image.location).toMatch(/^\/catalog\/.+\.jpg$/);
      for (const rv of p.reviews) expect(rv.rating).toBeGreaterThanOrEqual(1), expect(rv.rating).toBeLessThanOrEqual(5);
    }
  });
});
