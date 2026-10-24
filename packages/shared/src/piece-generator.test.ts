import { describe, expect, it } from "vitest";
import { PieceGenerator, complement } from "./piece-generator";
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
