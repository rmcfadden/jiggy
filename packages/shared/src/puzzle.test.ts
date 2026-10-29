import { describe, expect, it } from "vitest";
import { PIECE_SIZE, viewMargins, buildPuzzle, decodePuzzleId, encodePuzzleId, isSolved, scatterOffsets, snapPiece } from "./puzzle";

const spec = { cols: 4, rows: 3, seed: 42 };

describe("puzzle", () => {
  it("round-trips ids and rejects bad ones", () => {
    expect(decodePuzzleId(encodePuzzleId(spec))).toEqual(spec);
    expect(decodePuzzleId("nope")).toBeNull();
    expect(decodePuzzleId(null)).toBeNull();
    expect(decodePuzzleId("0x3-1")).toBeNull();
  });

  it("builds one piece per cell, deterministically", () => {
    const p = buildPuzzle(spec);
    expect(p.pieces).toHaveLength(12);
    expect(buildPuzzle(spec)).toEqual(p);
  });

  it("scatters pieces away from their solved positions", () => {
    const offsets = scatterOffsets(spec);
    expect(offsets).toHaveLength(12);
    expect(scatterOffsets(spec)).toEqual(offsets);
    expect(isSolved(offsets)).toBe(false);
  });

  it("snaps close pieces and leaves far ones", () => {
    expect(snapPiece({ x: 10, y: -10 })).toEqual({ offset: { x: 0, y: 0 }, snapped: true });
    expect(snapPiece({ x: 90, y: 0 }).snapped).toBe(false);
    expect(isSolved([{ x: 0, y: 0 }])).toBe(true);
  });
});

describe("scatter options", () => {
  const spec = { cols: 6, rows: 5, seed: 3 };
  const centre = (o: { x: number; y: number }, i: number) => ({
    x: o.x + ((i % spec.cols) + 0.5) * PIECE_SIZE,
    y: o.y + (Math.floor(i / spec.cols) + 0.5) * PIECE_SIZE,
  });

  it("scatters only `count` pieces and leaves the rest placed", () => {
    const loose = scatterOffsets(spec, { count: 10 }).filter((o) => o.x !== 0 || o.y !== 0);
    expect(loose).toHaveLength(10);
  });

  it("starts loose pieces on the chosen side", () => {
    const side = (s: "top" | "bottom" | "left" | "right") => scatterOffsets(spec, { side: s }).map(centre);
    expect(side("top").every((c) => c.y < 0)).toBe(true);
    expect(side("bottom").every((c) => c.y > spec.rows * PIECE_SIZE)).toBe(true);
    expect(side("left").every((c) => c.x < 0)).toBe(true);
    expect(side("right").every((c) => c.x > spec.cols * PIECE_SIZE)).toBe(true);
  });

  it("gives a larger view margin for a smaller puzzle share", () => {
    expect(viewMargins(spec, 25).x).toBeGreaterThan(viewMargins(spec, 70).x);
  });
});
