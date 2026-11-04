import {
  PieceGenerator,
  translateVector,
  type Bounds,
  type PieceVector,
} from "./piece-generator";
import type { JigsawMatrix } from "./jigsaw-template";
import { toSvgPath } from "./svg";

export type PlacedPiece = {
  row: number;
  col: number;
  /** Outline in puzzle coordinates (already offset to the piece's cell). */
  vector: PieceVector;
};

export type JigsawVector = {
  width: number;
  height: number;
  bounds: Bounds;
  pieces: PlacedPiece[];
};

export type VectorizeOptions = {
  /** Extra space between neighbouring pieces, for an "exploded" view. Default 0. */
  gap?: number;
};

/** Turns a {@link JigsawMatrix} into renderer-agnostic vectors laid out as a puzzle. */
export class JigsawVectorizer {
  vectorize(matrix: JigsawMatrix, { gap = 0 }: VectorizeOptions = {}): JigsawVector {
    const pieces: PlacedPiece[] = [];
    let y = 0;
    matrix.forEach((row, r) => {
      let x = 0;
      row.forEach((params, c) => {
        const local = new PieceGenerator(params).generate();
        pieces.push({ row: r, col: c, vector: translateVector(local, x + c * gap, y + r * gap) });
        x += params.width;
      });
      y += row[0]?.height ?? 0;
    });

    const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const { vector: v } of pieces) {
      bounds.minX = Math.min(bounds.minX, v.bounds.minX);
      bounds.minY = Math.min(bounds.minY, v.bounds.minY);
      bounds.maxX = Math.max(bounds.maxX, v.bounds.maxX);
      bounds.maxY = Math.max(bounds.maxY, v.bounds.maxY);
    }
    if (pieces.length === 0) return { width: 0, height: 0, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, pieces };
    return { width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY, bounds, pieces };
  }

  /** One SVG path `d` string per piece, row-major. */
  toSvgPaths(vector: JigsawVector): string[] {
    return vector.pieces.map((p) => toSvgPath(p.vector));
  }
}
