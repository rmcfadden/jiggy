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

/** Where the loose pieces start, relative to the board. */
export type StartSide = "random" | "top" | "left" | "right" | "bottom";

export const START_SIDES: StartSide[] = ["random", "top", "left", "right", "bottom"];

export type ScatterOptions = {
  /** Which side of the board loose pieces start on. Default `random` (all around). */
  side?: StartSide;
  /** How many pieces start loose; the rest start placed. Default: all. */
  count?: number;
  /** Share of the window the puzzle board fills, 20-80. Default 40. */
  viewPercent?: number;
  /** Size of one piece cell; default {@link PIECE_SIZE} square. Set it when using a custom template. */
  cell?: { width: number; height: number };
};

export const DEFAULT_VIEW_PERCENT = 40;

/** Free space around the board (per side) so the board fills `viewPercent` of the view. */
export function viewMargins(
  spec: PuzzleSpec,
  viewPercent = DEFAULT_VIEW_PERCENT,
  cell = { width: PIECE_SIZE, height: PIECE_SIZE },
): Offset {
  const f = Math.min(0.8, Math.max(0.2, viewPercent / 100));
  const w = spec.cols * cell.width;
  const h = spec.rows * cell.height;
  // Never so tight that a piece can't rest beside the board.
  return {
    x: Math.max(cell.width * 1.25, (w / f - w) / 2),
    y: Math.max(cell.height * 1.25, (h / f - h) / 2),
  };
}

/**
 * Deterministic starting offsets for each piece (row-major), measured from its solved position.
 * Loose pieces are scattered in the free space around the board; pieces outside `count` start placed.
 */
export function scatterOffsets(spec: PuzzleSpec, options: ScatterOptions = {}): Offset[] {
  const { side = "random", viewPercent, cell = { width: PIECE_SIZE, height: PIECE_SIZE } } = options;
  const total = spec.cols * spec.rows;
  const count = Math.min(total, Math.max(1, Math.floor(options.count ?? total)));
  const rng = createRng(spec.seed ^ 0x5bd1e995);
  const m = viewMargins(spec, viewPercent, cell);
  const w = spec.cols * cell.width;
  const h = spec.rows * cell.height;
  const half = Math.max(cell.width, cell.height) / 2;
  const between = (lo: number, hi: number) => lo + rng() * (hi - lo);

  // Target piece-centre ranges [x0, x1, y0, y1] for each side of the board.
  const bands: Record<Exclude<StartSide, "random">, [number, number, number, number]> = {
    top: [-m.x + half, w + m.x - half, -m.y + half, -half],
    bottom: [-m.x + half, w + m.x - half, h + half, h + m.y - half],
    left: [-m.x + half, -half, -m.y + half, h + m.y - half],
    right: [w + half, w + m.x - half, -m.y + half, h + m.y - half],
  };
  const target = (): Offset => {
    if (side !== "random") {
      const [x0, x1, y0, y1] = bands[side];
      return { x: between(x0, x1), y: between(y0, y1) };
    }
    for (;;) {
      const x = between(-m.x + half, w + m.x - half);
      const y = between(-m.y + half, h + m.y - half);
      if (x < -half || x > w + half || y < -half || y > h + half) return { x, y };
    }
  };

  // Pick which pieces are loose with a partial Fisher-Yates shuffle.
  const ids = Array.from({ length: total }, (_, i) => i);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (total - i));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const loose = new Set(ids.slice(0, count));

  return Array.from({ length: total }, (_, i) => {
    if (!loose.has(i)) return { x: 0, y: 0 };
    const t = target();
    const cx = ((i % spec.cols) + 0.5) * cell.width;
    const cy = (Math.floor(i / spec.cols) + 0.5) * cell.height;
    return { x: t.x - cx, y: t.y - cy };
  });
}

/** Locks a piece onto its solved position (offset 0,0) when dropped close enough. */
export function snapPiece(offset: Offset, tolerance = PIECE_SIZE * 0.25): { offset: Offset; snapped: boolean } {
  if (Math.hypot(offset.x, offset.y) <= tolerance) return { offset: { x: 0, y: 0 }, snapped: true };
  return { offset, snapped: false };
}

export const isSolved = (offsets: Offset[]) => offsets.every((o) => o.x === 0 && o.y === 0);
