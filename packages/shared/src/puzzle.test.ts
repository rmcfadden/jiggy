import { describe, expect, it } from "vitest";
import { buildPuzzle, decodePuzzleId, encodePuzzleId, isSolved, scatterOffsets, snapPiece } from "./puzzle";

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
