import { JigsawTemplateGenerator } from "./jigsaw-template";
import { JigsawVectorizer, type JigsawVector } from "./jigsaw-vectorizer";
import { createRng } from "./piece-generator";

export type PuzzleSpec = { cols: number; rows: number; seed: number };

/** Size of one piece cell, in puzzle units. */
export const PIECE_SIZE = 100;

export type Offset = { x: number; y: number };

/** `"4x3-42"` for 4 columns, 3 rows, seed 42. */
export const encodePuzzleId = ({ cols, rows, seed }: PuzzleSpec) => `${cols}x${rows}-${seed}`;

export function decodePuzzleId(id: string | null | undefined): PuzzleSpec | null {
  const m = /^(\d+)x(\d+)-(\d+)$/.exec(id ?? "");
  if (!m) return null;
  const [cols, rows, seed] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (cols < 1 || rows < 1 || cols > 30 || rows > 30) return null;
  return { cols, rows, seed };
}

export function buildPuzzle(spec: PuzzleSpec): JigsawVector {
  const matrix = new JigsawTemplateGenerator({
    ...spec,
    width: spec.cols * PIECE_SIZE,
    height: spec.rows * PIECE_SIZE,
  }).generate();
  return new JigsawVectorizer().vectorize(matrix);
}

/**
 * Deterministic starting offsets for each piece (row-major), measured from its solved position.
 * Pieces are scattered over an area around the board and never start already placed.
 */
export function scatterOffsets(spec: PuzzleSpec): Offset[] {
  const rng = createRng(spec.seed ^ 0x5bd1e995);
  const spread = Math.max(spec.cols, spec.rows) * PIECE_SIZE * 0.75;
  return Array.from({ length: spec.cols * spec.rows }, () => {
    const angle = rng() * Math.PI * 2;
    const dist = PIECE_SIZE * 1.5 + rng() * spread;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  });
}

/** Locks a piece onto its solved position (offset 0,0) when dropped close enough. */
export function snapPiece(offset: Offset, tolerance = PIECE_SIZE * 0.25): { offset: Offset; snapped: boolean } {
  if (Math.hypot(offset.x, offset.y) <= tolerance) return { offset: { x: 0, y: 0 }, snapped: true };
  return { offset, snapped: false };
}

export const isSolved = (offsets: Offset[]) => offsets.every((o) => o.x === 0 && o.y === 0);
