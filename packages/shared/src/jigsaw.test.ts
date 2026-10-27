import { describe, expect, it } from "vitest";
import { JigsawTemplateGenerator } from "./jigsaw-template";
import { JigsawVectorizer } from "./jigsaw-vectorizer";
import type { PathSegment, Point } from "./piece-generator";

describe("JigsawTemplateGenerator", () => {
  const gen = (p = {}) => new JigsawTemplateGenerator({ cols: 5, rows: 4, seed: 9, ...p });

  it("builds a rows x cols matrix with pieces that divide the puzzle evenly", () => {
    const m = gen({ width: 500, height: 400 }).generate();
    expect(m).toHaveLength(4);
    expect(m[0]).toHaveLength(5);
    expect(m[2][3]).toMatchObject({ width: 100, height: 100 });
  });

  it("has flat borders and complementary, same-seed interior seams", () => {
    for (const seed of [1, 2, 3, 99]) {
      const m = gen({ seed }).generate();
      expect(JigsawTemplateGenerator.findMismatches(m)).toEqual([]);
      m[0].forEach((p) => expect(p.edges.top).toBe("flat"));
      m.at(-1)!.forEach((p) => expect(p.edges.bottom).toBe("flat"));
      m.forEach((row) => {
        expect(row[0].edges.left).toBe("flat");
        expect(row.at(-1)!.edges.right).toBe("flat");
      });
    }
  });

  it("is deterministic and varies with the seed", () => {
    expect(gen().generate()).toEqual(gen().generate());
    expect(gen({ seed: 10 }).generate()).not.toEqual(gen().generate());
  });

  it("draws a different shape for every seam, within the ranges", () => {
    const ranges = {
      tabSize: { min: 0.1, max: 0.3 },
      neckWidth: { min: 0.04, max: 0.1 },
      tabPosition: { min: 0.35, max: 0.65 },
      neckAngle: { min: -15, max: 15 },
      jitter: { min: 0.1, max: 0.9 },
    };
    const m = gen({ cols: 6, rows: 6, ...ranges }).generate();
    expect(JigsawTemplateGenerator.findMismatches(m)).toEqual([]);
    const keys = Object.keys(ranges) as (keyof typeof ranges)[];
    for (const key of keys) {
      const values = m.flat().flatMap((p) => Object.values(p.sides!).map((s) => s![key]!));
      values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(ranges[key].min);
        expect(v).toBeLessThanOrEqual(ranges[key].max);
      });
      expect(new Set(values.map((v) => v.toFixed(4))).size).toBeGreaterThan(20);
    }
    // Both pieces of a seam hold the same shape.
    expect(m[2][2].sides!.right).toEqual(m[2][3].sides!.left);
    expect(m[2][2].sides!.bottom).toEqual(m[3][2].sides!.top);
  });

  it("collapses to one shape when a range has no spread", () => {
    const fixed = { min: 0.2, max: 0.2 };
    const m = gen({ tabSize: fixed }).generate();
    new Set(m.flat().map((p) => p.sides!.top!.tabSize)).forEach((v) => expect(v).toBe(0.2));
  });

  it("detects a broken seam", () => {
    const m = gen().generate();
    m[0][0].edges.right = m[0][1].edges.left;
    expect(JigsawTemplateGenerator.findMismatches(m).length).toBeGreaterThan(0);
  });
});

/** Walks the outline and returns the points of each edge, in walk order. */
function edgePoints(segments: PathSegment[]): Point[][] {
  const edges: Point[][] = [];
  let cur: Point = { x: 0, y: 0 };
  let edge: Point[] = [];
  for (const s of segments) {
    if (s.type === "M") cur = s.to;
    else if (s.type === "L") {
      edges.push([cur, s.to]);
      cur = s.to;
    } else if (s.type === "C") {
      const u = 1 / 8;
      for (let i = 0; i <= 8; i++) {
        const t = i * u, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
        edge.push({
          x: a * cur.x + b * s.c1.x + c * s.c2.x + d * s.to.x,
          y: a * cur.y + b * s.c1.y + c * s.c2.y + d * s.to.y,
        });
      }
      cur = s.to;
      // An edge is three consecutive curves.
      if (edge.length === 27) {
        edges.push(edge);
        edge = [];
      }
    }
  }
  return edges;
}

describe("JigsawVectorizer", () => {
  const matrix = new JigsawTemplateGenerator({ cols: 3, rows: 3, jitter: { min: 1, max: 1 }, seed: 5 }).generate();
  const vec = new JigsawVectorizer().vectorize(matrix);

  it("places one piece per cell, offset into puzzle coordinates", () => {
    expect(vec.pieces).toHaveLength(9);
    const p = vec.pieces.find((q) => q.row === 1 && q.col === 2)!;
    const first = p.vector.segments[0];
    expect(first.type === "M" && first.to).toEqual({ x: 2 * matrix[1][2].width, y: matrix[1][2].height });
  });

  it("makes neighbouring edges coincide (seamless)", () => {
    const at = (r: number, c: number) =>
      edgePoints(vec.pieces.find((p) => p.row === r && p.col === c)!.vector.segments);
    const close = (a: Point[], b: Point[]) => {
      expect(a).toHaveLength(b.length);
      a.forEach((p, i) => {
        expect(p.x).toBeCloseTo(b[b.length - 1 - i].x, 6);
        expect(p.y).toBeCloseTo(b[b.length - 1 - i].y, 6);
      });
    };
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        if (c < 2) close(at(r, c)[1], at(r, c + 1)[3]); // right vs left
        if (r < 2) close(at(r, c)[2], at(r + 1, c)[0]); // bottom vs top
      }
  });

  it("spreads pieces apart with a gap", () => {
    const spread = new JigsawVectorizer().vectorize(matrix, { gap: 10 });
    expect(spread.width).toBeCloseTo(vec.width + 20, 6);
  });

  it("emits an SVG path per piece", () => {
    const paths = new JigsawVectorizer().toSvgPaths(vec);
    expect(paths).toHaveLength(9);
    paths.forEach((d) => expect(d).toMatch(/^M.*Z$/));
  });
});
