import { describe, expect, it } from "vitest";
import { DEFAULT_PIECE_PARAMS, PieceGenerator, complement, translateVector } from "./piece-generator";
import { toSvgPath } from "./svg";

const path = (p: ConstructorParameters<typeof PieceGenerator>[0]) =>
  toSvgPath(new PieceGenerator(p).generate());

describe("PieceGenerator", () => {
  it("is deterministic for the same params and seed", () => {
    expect(path({ seed: 7 })).toBe(path({ seed: 7 }));
  });

  it("changes with the seed when jitter > 0", () => {
    expect(path({ seed: 1, jitter: 0.5 })).not.toBe(path({ seed: 2, jitter: 0.5 }));
  });

  it("draws a plain rectangle when all edges are flat", () => {
    const edges = { top: "flat", right: "flat", bottom: "flat", left: "flat" } as const;
    expect(path({ width: 100, height: 50, edges })).toBe("M0 0 L100 0 L100 50 L0 50 L0 0 Z");
  });

  it("draws in and out tabs differently", () => {
    const flat = { top: "flat", right: "flat", bottom: "flat", left: "flat" } as const;
    const out = path({ edges: { ...flat, top: "out" } });
    const inn = path({ edges: { ...flat, top: "in" } });
    expect(out).not.toBe(inn);
  });

  it("points out tabs away from, and in tabs into, the piece", () => {
    const flat = { top: "flat", right: "flat", bottom: "flat", left: "flat" } as const;
    expect(new PieceGenerator({ edges: { ...flat, top: "out" } }).generate().bounds.minY).toBeLessThan(0);
    const inner = new PieceGenerator({ edges: { ...flat, top: "in" } }).generate().bounds;
    expect(inner.minY).toBe(0);
  });

  it("starts with M, ends with Z, and keeps every point inside bounds", () => {
    const v = new PieceGenerator({ seed: 3 }).generate();
    expect(v.segments[0].type).toBe("M");
    expect(v.segments.at(-1)?.type).toBe("Z");
    for (const s of v.segments) {
      if (s.type === "Z") continue;
      expect(s.to.x).toBeGreaterThanOrEqual(v.bounds.minX);
      expect(s.to.x).toBeLessThanOrEqual(v.bounds.maxX);
      expect(s.to.y).toBeGreaterThanOrEqual(v.bounds.minY);
      expect(s.to.y).toBeLessThanOrEqual(v.bounds.maxY);
    }
  });

  it("random() yields valid params from the given rng", () => {
    const p = PieceGenerator.random(() => 0.5);
    expect(p.tabPosition).toBeGreaterThanOrEqual(0.4);
    expect(p.tabPosition).toBeLessThanOrEqual(0.6);
    expect(p.jitter).toBeLessThanOrEqual(1);
    expect(() => new PieceGenerator(p).generate()).not.toThrow();
  });
});

describe("complement", () => {
  it("swaps in and out and keeps flat", () => {
    expect(complement("out")).toBe("in");
    expect(complement("in")).toBe("out");
    expect(complement("flat")).toBe("flat");
  });
});

describe("toSvgPath", () => {
  it("formats M/L/C/Z", () => {
    const d = toSvgPath({
      segments: [
        { type: "M", to: { x: 0, y: 0 } },
        { type: "L", to: { x: 1, y: 2 } },
        { type: "C", c1: { x: 1, y: 1 }, c2: { x: 2, y: 2 }, to: { x: 3, y: 3 } },
        { type: "Z" },
      ],
    });
    expect(d).toBe("M0 0 L1 2 C1 1 2 2 3 3 Z");
  });
});

describe("neck angle and per-side shape", () => {
  const flat = { top: "flat", right: "flat", bottom: "flat", left: "flat" } as const;

  it("leans the tab: angle changes the path, and opposite angles mirror it", () => {
    const base = { edges: { ...flat, top: "out" as const }, jitter: 0 };
    const straight = path({ ...base, neckAngle: 0 });
    const left = new PieceGenerator({ ...base, neckAngle: -10 }).generate();
    const right = new PieceGenerator({ ...base, neckAngle: 10 }).generate();
    expect(path({ ...base, neckAngle: 10 })).not.toBe(straight);
    // With a centred tab the two leans are mirror images about x = width / 2.
    const peak = (v: typeof left) => v.bounds.minY;
    expect(peak(left)).toBeCloseTo(peak(right), 6);
    expect(left.bounds.minX).toBeCloseTo(200 - right.bounds.maxX, 6);
  });

  it("applies per-side overrides only to that side", () => {
    const edges = { ...flat, top: "out" as const, bottom: "out" as const };
    const a = new PieceGenerator({ edges, jitter: 0 }).generate();
    const b = new PieceGenerator({ edges, jitter: 0, sides: { top: { tabSize: 0.3 } } }).generate();
    expect(b.bounds.minY).toBeLessThan(a.bounds.minY);
    expect(b.bounds.maxY).toBeCloseTo(a.bounds.maxY, 9);
  });

  it("pair() gives a neighbour whose facing edge is the exact reverse, for every side", () => {
    for (const side of ["top", "right", "bottom", "left"] as const) {
      const [a, b] = PieceGenerator.pair(
        {
          ...DEFAULT_PIECE_PARAMS,
          edges: { ...flat, [side]: "out" },
          neckAngle: 12,
          tabPosition: 0.42,
          jitter: 0.6,
          seed: 5,
        },
        side,
      );
      const facing = { top: "bottom", right: "left", bottom: "top", left: "right" } as const;
      expect(b.edges[facing[side]]).toBe("in");
      const dx = side === "right" ? a.width : side === "left" ? -a.width : 0;
      const dy = side === "bottom" ? a.height : side === "top" ? -a.height : 0;
      const va = new PieceGenerator(a).generate();
      const vb = translateVector(new PieceGenerator(b).generate(), dx, dy);
      // The tab (out side) must sit exactly on the neighbour's socket: sample
      // the curves of both pieces and require each seam point to appear in both.
      const key = (p: { x: number; y: number }) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`;
      const ptsA = new Set(va.segments.flatMap((s) => (s.type === "C" ? [key(s.to), key(s.c1), key(s.c2)] : [])));
      const shared = vb.segments.flatMap((s) => (s.type === "C" ? [key(s.to), key(s.c1), key(s.c2)] : [])).filter((k) => ptsA.has(k));
      expect(shared.length).toBeGreaterThanOrEqual(6);
    }
  });
});
