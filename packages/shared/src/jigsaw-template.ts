import { overlappingSides } from "./overlap";
import {
  PieceGenerator,
  complement,
  createRng,
  type EdgeShape,
  type EdgeType,
  type PieceParams,
  type Side,
} from "./piece-generator";

/** Row-major grid of piece params: `matrix[row][col]`. */
export type JigsawMatrix = PieceParams[][];

/** Inclusive start/end of a shape value; each seam draws its own value from it. */
export type Range = { min: number; max: number };

export type JigsawTemplateParams = {
  cols: number;
  rows: number;
  /** Total puzzle size; each piece is `width / cols` by `height / rows`. */
  width: number;
  height: number;
  /**
   * Tolerance ranges for the shape values (see {@link EdgeShape}). Every seam
   * draws its own value from its range, so edges differ across the puzzle while
   * the two pieces sharing a seam still agree.
   */
  tabSize: Range;
  neckWidth: Range;
  tabPosition: Range;
  neckAngle: Range;
  jitter: Range;
  /**
   * When a piece's outline crosses itself (a neck or bulb folding over), randomly
   * shrink the tab size and neck width of the seams involved until it no longer does.
   */
  fixOverlap: boolean;
  seed: number;
};

export const DEFAULT_JIGSAW_PARAMS: JigsawTemplateParams = {
  cols: 4,
  rows: 3,
  width: 800,
  height: 600,
  tabSize: { min: 0.16, max: 0.23 },
  neckWidth: { min: 0.1, max: 0.12 },
  tabPosition: { min: 0.47, max: 0.52 },
  neckAngle: { min: -2, max: 5 },
  jitter: { min: 0.48, max: 0.52 },
  fixOverlap: true,
  seed: 1,
};

export type JigsawShapeRanges = Pick<
  JigsawTemplateParams,
  "tabSize" | "neckWidth" | "tabPosition" | "neckAngle" | "jitter"
>;

/** Named shape ranges; applying one leaves grid size and seed alone. */
export const JIGSAW_PRESETS: { name: string; ranges: JigsawShapeRanges }[] = [
  {
    name: "Subtle",
    ranges: {
      tabSize: { min: 0.16, max: 0.23 },
      neckWidth: { min: 0.1, max: 0.12 },
      tabPosition: { min: 0.47, max: 0.52 },
      neckAngle: { min: -2, max: 5 },
      jitter: { min: 0.48, max: 0.52 },
    },
  },
  {
    name: "Varied",
    ranges: {
      tabSize: { min: 0.16, max: 0.28 },
      neckWidth: { min: 0.05, max: 0.1 },
      tabPosition: { min: 0.4, max: 0.6 },
      neckAngle: { min: -12, max: 12 },
      jitter: { min: 0.2, max: 0.8 },
    },
  },
];

const MAX_FIX_PASSES = 40;
const POSITION_TRIES = 8;
/** Tab centre bounds when sliding a tab; matches the Tab position slider. */
const MIN_POSITION = 0.3;
const MAX_POSITION = 0.7;
const MIN_NECK_WIDTH = 0.01;
const MIN_TAB_SIZE = 0.03;

type Cut = { type: EdgeType; seed: number; shape: EdgeShape };

/**
 * Builds a matrix of {@link PieceParams} that tile into a jigsaw.
 *
 * Fitting: every interior seam is decided once (tab direction + shape seed).
 * One neighbour receives that edge type, the other its `complement`, so a tab
 * on one side is always a socket on the other. Border edges are flat.
 *
 * Seamless: both neighbours get the same per-edge seed in `edgeSeeds`, and
 * `PieceGenerator` draws an edge from that seed in a canonical direction
 * (mirrored when walked backwards), so the two curves coincide exactly.
 */
export class JigsawTemplateGenerator {
  readonly params: JigsawTemplateParams;

  constructor(params: Partial<JigsawTemplateParams> = {}) {
    const p = { ...DEFAULT_JIGSAW_PARAMS, ...params };
    this.params = {
      ...p,
      cols: Math.max(1, Math.floor(p.cols)),
      rows: Math.max(1, Math.floor(p.rows)),
    };
  }

  generate(): JigsawMatrix {
    const { cols, rows, width, height, tabSize, neckWidth, tabPosition, neckAngle, jitter, seed } =
      this.params;
    const mid = ({ min, max }: Range) => (min + max) / 2;
    const rng = createRng(seed);
    const pieceWidth = width / cols;
    const pieceHeight = height / rows;

    // Always draw the same values per seam, border or not, so changing the grid
    // size does not reshuffle the seams that remain.
    const pick = ({ min, max }: Range) => min + rng() * (max - min);
    const draw = (): Cut => ({
      type: rng() < 0.5 ? "out" : "in",
      seed: Math.floor(rng() * 2 ** 31),
      shape: {
        tabSize: pick(tabSize),
        neckWidth: pick(neckWidth),
        tabPosition: pick(tabPosition),
        neckAngle: pick(neckAngle),
        jitter: pick(jitter),
      },
    });
    // horizontal[r][c]: seam above row r (r = 0..rows); vertical[r][c]: seam left of col c.
    const horizontal = Array.from({ length: rows + 1 }, () => Array.from({ length: cols }, draw));
    const vertical = Array.from({ length: rows }, () => Array.from({ length: cols + 1 }, draw));

    const flat: EdgeType = "flat";
    const pieceAt = (r: number, c: number): PieceParams => {
      const top = horizontal[r][c];
      const bottom = horizontal[r + 1][c];
      const left = vertical[r][c];
      const right = vertical[r][c + 1];
      // The cut's type belongs to the piece below / right of the seam.
      return {
        width: pieceWidth,
        height: pieceHeight,
        edges: {
          top: r === 0 ? flat : top.type,
          bottom: r === rows - 1 ? flat : complement(bottom.type),
          left: c === 0 ? flat : left.type,
          right: c === cols - 1 ? flat : complement(right.type),
        },
        edgeSeeds: { top: top.seed, bottom: bottom.seed, left: left.seed, right: right.seed },
        // Piece-wide values are only fallbacks; each side carries its seam's shape.
        tabSize: mid(tabSize),
        neckWidth: mid(neckWidth),
        tabPosition: mid(tabPosition),
        neckAngle: mid(neckAngle),
        jitter: mid(jitter),
        sides: { top: top.shape, bottom: bottom.shape, left: left.shape, right: right.shape },
        seed,
      };
    };
    const build = (): JigsawMatrix =>
      Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => pieceAt(r, c)));

    let matrix = build();
    if (!this.params.fixOverlap) return matrix;

    // Separate stream so fixing never reshuffles the seams drawn above.
    const fixRng = createRng((seed ^ 0x9e3779b9) >>> 0);
    const cutOf = (r: number, c: number, side: Side) =>
      side === "top" ? horizontal[r][c]
        : side === "bottom" ? horizontal[r + 1][c]
        : side === "left" ? vertical[r][c]
        : vertical[r][c + 1];
    // The piece across a seam, and the side of it the seam is on.
    const across = (r: number, c: number, side: Side): [number, number, Side] =>
      side === "top" ? [r - 1, c, "bottom"]
        : side === "bottom" ? [r + 1, c, "top"]
        : side === "left" ? [r, c - 1, "right"]
        : [r, c + 1, "left"];
    const crossing = (r: number, c: number, side: Side) =>
      r >= 0 && r < rows && c >= 0 && c < cols &&
      overlappingSides(new PieceGenerator(pieceAt(r, c)).generate()).includes(side);

    for (let pass = 0; pass < MAX_FIX_PASSES; pass++) {
      let changed = false;
      matrix.forEach((row, r) =>
        row.forEach((piece, c) => {
          for (const side of overlappingSides(new PieceGenerator(piece).generate())) {
            // A flat edge only crosses because its neighbour does; fix that one.
            if (piece.edges[side] === "flat") continue;
            const cut = cutOf(r, c, side);
            const [nr, nc, nside] = across(r, c, side);
            const shape = cut.shape;

            // First choice: slide the tab along its edge to somewhere it fits.
            let moved = false;
            for (let i = 0; i < POSITION_TRIES && !moved; i++) {
              cut.shape = { ...shape, tabPosition: MIN_POSITION + fixRng() * (MAX_POSITION - MIN_POSITION) };
              moved = !crossing(r, c, side) && !crossing(nr, nc, nside);
            }
            if (moved) {
              changed = true;
              continue;
            }
            cut.shape = shape;

            // Otherwise make the tab smaller and its neck narrower.
            const neckWidth = Math.max(MIN_NECK_WIDTH, shape.neckWidth * (0.8 + fixRng() * 0.15));
            const tabSize = Math.max(MIN_TAB_SIZE, shape.tabSize * (0.8 + fixRng() * 0.15));
            if (neckWidth < shape.neckWidth || tabSize < shape.tabSize) {
              cut.shape = { ...shape, neckWidth, tabSize };
              changed = true;
            }
          }
        }),
      );
      if (!changed) break;
      matrix = build();
    }
    return matrix;
  }

  /** Lists every seam whose two sides are not complementary; empty means the pieces fit. */
  static findMismatches(matrix: JigsawMatrix): string[] {
    const bad: string[] = [];
    matrix.forEach((row, r) =>
      row.forEach((piece, c) => {
        const right = row[c + 1];
        if (right && !fits(piece.edges.right, right.edges.left, piece.edgeSeeds?.right, right.edgeSeeds?.left))
          bad.push(`(${r},${c}) right / (${r},${c + 1}) left`);
        const below = matrix[r + 1]?.[c];
        if (below && !fits(piece.edges.bottom, below.edges.top, piece.edgeSeeds?.bottom, below.edgeSeeds?.top))
          bad.push(`(${r},${c}) bottom / (${r + 1},${c}) top`);
      }),
    );
    return bad;
  }

  /** Random but valid shape ranges and seed; grid and size stay at the defaults. */
  static random(rng: () => number = Math.random): JigsawTemplateParams {
    const between = (lo: number, hi: number) => lo + rng() * (hi - lo);
    const round2 = (v: number) => Math.round(v * 100) / 100;
    const range = (lo1: number, hi1: number, lo2: number, hi2: number): Range => ({
      min: round2(between(lo1, hi1)),
      max: round2(between(lo2, hi2)),
    });
    return {
      ...DEFAULT_JIGSAW_PARAMS,
      tabSize: range(0.12, 0.2, 0.2, 0.32),
      neckWidth: range(0.03, 0.07, 0.07, 0.12),
      tabPosition: range(0.3, 0.45, 0.55, 0.7),
      neckAngle: { min: Math.round(between(-20, -2)), max: Math.round(between(2, 20)) },
      jitter: range(0, 0.4, 0.5, 1),
      seed: Math.floor(rng() * 1_000_000),
    };
  }
}

const fits = (a: EdgeType, b: EdgeType, seedA?: number, seedB?: number) =>
  a === complement(b) && seedA === seedB;
