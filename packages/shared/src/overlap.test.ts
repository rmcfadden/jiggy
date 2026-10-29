import { describe, expect, it } from "vitest";
import { JigsawTemplateGenerator } from "./jigsaw-template";
import { JigsawVectorizer } from "./jigsaw-vectorizer";
import { verifyJigsaw } from "./jigsaw-verifier";
import { overlappingSides } from "./overlap";
import { PieceGenerator } from "./piece-generator";

const wide = {
  cols: 6,
  rows: 6,
  neckWidth: { min: 0.15, max: 0.2 },
  tabSize: { min: 0.3, max: 0.4 },
  neckAngle: { min: -20, max: 20 },
  jitter: { min: 0.5, max: 1 },
};
const overlapping = (m: ReturnType<JigsawTemplateGenerator["generate"]>) =>
  m.flat().filter((p) => overlappingSides(new PieceGenerator(p).generate()).length > 0).length;

describe("neck overlap fix", () => {
  it("finds overlaps in wide, angled necks when the fix is off", () => {
    const m = new JigsawTemplateGenerator({ ...wide, seed: 3, fixOverlap: false }).generate();
    expect(overlapping(m)).toBeGreaterThan(0);
  });

  it("removes them by shrinking tabs and necks, keeping seams matched", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const off = new JigsawTemplateGenerator({ ...wide, seed, fixOverlap: false }).generate();
      const on = new JigsawTemplateGenerator({ ...wide, seed }).generate();
      expect(overlapping(on)).toBe(0);
      expect(JigsawTemplateGenerator.findMismatches(on)).toEqual([]);
      const vector = new JigsawVectorizer().vectorize(on);
      expect(verifyJigsaw(on, vector, { maxTabRatio: 1 }).issues.filter((i) => i.kind !== "tab")).toEqual([]);
      // Only shrinks: every shape value is at most what it was.
      on.flat().forEach((p, i) =>
        (["top", "right", "bottom", "left"] as const).forEach((side) => {
          expect(p.sides![side]!.tabSize!).toBeLessThanOrEqual(off.flat()[i].sides![side]!.tabSize! + 1e-12);
          expect(p.sides![side]!.neckWidth!).toBeLessThanOrEqual(off.flat()[i].sides![side]!.neckWidth! + 1e-12);
        }),
      );
    }
  });

  it("slides the tab first and only shrinks when that is not enough", () => {
    let moved = 0, shrunk = 0, untouched = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      const off = new JigsawTemplateGenerator({ ...wide, seed, fixOverlap: false }).generate().flat();
      const on = new JigsawTemplateGenerator({ ...wide, seed }).generate().flat();
      on.forEach((p, i) =>
        (["top", "right", "bottom", "left"] as const).forEach((side) => {
          const a = off[i].sides![side]!, b = p.sides![side]!;
          if (b.tabSize !== a.tabSize || b.neckWidth !== a.neckWidth) shrunk++;
          else if (b.tabPosition !== a.tabPosition) {
            moved++;
            expect(b.tabPosition!).toBeGreaterThanOrEqual(0.3);
            expect(b.tabPosition!).toBeLessThanOrEqual(0.7);
          } else untouched++;
        }),
      );
    }
    expect(moved).toBeGreaterThan(0);
    expect(moved).toBeGreaterThan(shrunk);
    expect(untouched).toBeGreaterThan(0);
  });

  it("leaves non-overlapping puzzles untouched and is deterministic", () => {
    const base = { cols: 5, rows: 4, seed: 7 };
    expect(new JigsawTemplateGenerator(base).generate()).toEqual(
      new JigsawTemplateGenerator({ ...base, fixOverlap: false }).generate(),
    );
    const gen = () => new JigsawTemplateGenerator({ ...wide, seed: 3 }).generate();
    expect(gen()).toEqual(gen());
  });

  it("is reported by the verifier when the fix is off", () => {
    const m = new JigsawTemplateGenerator({ ...wide, seed: 3, fixOverlap: false }).generate();
    const report = verifyJigsaw(m, new JigsawVectorizer().vectorize(m), { maxTabRatio: 1 });
    expect(report.issues.some((i) => i.kind === "overlap")).toBe(true);
  });
});
