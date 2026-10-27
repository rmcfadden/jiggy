import { describe, expect, it } from "vitest";
import { JigsawTemplateGenerator } from "./jigsaw-template";
import { JigsawVectorizer } from "./jigsaw-vectorizer";
import { verifyJigsaw } from "./jigsaw-verifier";

const build = (p = {}, gap = 0) => {
  const matrix = new JigsawTemplateGenerator(p).generate();
  return { matrix, vector: new JigsawVectorizer().vectorize(matrix, { gap }) };
};

describe("verifyJigsaw", () => {
  it("passes generated puzzles across seeds, sizes and gaps", () => {
    for (const [cols, rows] of [[1, 1], [2, 2], [4, 3], [8, 8]])
      for (const seed of [1, 2, 3, 7, 20])
        for (const gap of [0, 12]) {
          const { matrix, vector } = build({ cols, rows, seed }, gap);
          const report = verifyJigsaw(matrix, vector);
          expect(report.issues).toEqual([]);
          expect(report.ok).toBe(true);
          expect(report.maxSeamDeviation).toBeLessThan(1e-6);
        }
  });

  it("flags a perturbed piece only when it exceeds the tolerance", () => {
    const { matrix, vector } = build({ cols: 3, rows: 3, seed: 5 });
    const seg = vector.pieces.find((p) => p.row === 1 && p.col === 1)!.vector.segments.find((s) => s.type === "C")!;
    if (seg.type === "C") seg.c1 = { x: seg.c1.x + 0.01, y: seg.c1.y };
    const strict = verifyJigsaw(matrix, vector, { tolerance: 1e-6 });
    expect(strict.ok).toBe(false);
    expect(strict.issues.some((i) => i.kind === "seam")).toBe(true);
    expect(verifyJigsaw(matrix, vector, { tolerance: 0.1 }).ok).toBe(true);
  });

  it("flags tabs larger than the threshold", () => {
    const { matrix, vector } = build({ cols: 3, rows: 3, seed: 5 });
    expect(verifyJigsaw(matrix, vector, { maxTabRatio: 0.01 }).issues.some((i) => i.kind === "tab")).toBe(true);
  });

  it("flags an unclosed outline", () => {
    const { matrix, vector } = build({ cols: 2, rows: 2 });
    vector.pieces[0].vector.segments.pop();
    expect(verifyJigsaw(matrix, vector).issues.some((i) => i.kind === "closed")).toBe(true);
  });
});
