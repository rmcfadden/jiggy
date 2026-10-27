import {
  DEFAULT_PIECE_PARAMS,
  complement,
  createRng,
  type EdgeType,
  type PieceParams,
} from "./piece-generator";

/** Row-major grid of piece params: `matrix[row][col]`. */
export type JigsawMatrix = PieceParams[][];

export type JigsawTemplateParams = {
  cols: number;
  rows: number;
  /** Total puzzle size; each piece is `width / cols` by `height / rows`. */
  width: number;
  height: number;
  /** Shared by every piece, see {@link PieceParams}. */
  tabSize: number;
  neckWidth: number;
  tabPosition: number;
  neckAngle: number;
  jitter: number;
  seed: number;
};

export const DEFAULT_JIGSAW_PARAMS: JigsawTemplateParams = {
  cols: 4,
  rows: 3,
  width: 800,
  height: 600,
  tabSize: DEFAULT_PIECE_PARAMS.tabSize,
  neckWidth: DEFAULT_PIECE_PARAMS.neckWidth,
  tabPosition: DEFAULT_PIECE_PARAMS.tabPosition,
  neckAngle: DEFAULT_PIECE_PARAMS.neckAngle,
  jitter: DEFAULT_PIECE_PARAMS.jitter,
  seed: 1,
};

type Cut = { type: EdgeType; seed: number };

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
    const rng = createRng(seed);
    const pieceWidth = width / cols;
    const pieceHeight = height / rows;

    // Always draw two values per seam, border or not, so changing the grid
    // size does not reshuffle the seams that remain.
    const draw = (): Cut => ({
      type: rng() < 0.5 ? "out" : "in",
      seed: Math.floor(rng() * 2 ** 31),
    });
    // horizontal[r][c]: seam above row r (r = 0..rows); vertical[r][c]: seam left of col c.
    const horizontal = Array.from({ length: rows + 1 }, () => Array.from({ length: cols }, draw));
    const vertical = Array.from({ length: rows }, () => Array.from({ length: cols + 1 }, draw));

    const flat: EdgeType = "flat";
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c): PieceParams => {
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
          tabSize,
          neckWidth,
          tabPosition,
          neckAngle,
          jitter,
          seed,
        };
      }),
    );
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

  /** Random but valid template params. */
  static random(rng: () => number = Math.random): JigsawTemplateParams {
    const between = (lo: number, hi: number) => lo + rng() * (hi - lo);
    const round2 = (v: number) => Math.round(v * 100) / 100;
    return {
      ...DEFAULT_JIGSAW_PARAMS,
      cols: Math.floor(between(2, 9)),
      rows: Math.floor(between(2, 7)),
      tabSize: round2(between(0.15, 0.3)),
      neckWidth: round2(between(0.04, 0.12)),
      tabPosition: round2(between(0.4, 0.6)),
      neckAngle: Math.round(between(-10, 10)),
      jitter: round2(between(0, 1)),
      seed: Math.floor(rng() * 1_000_000),
    };
  }
}

const fits = (a: EdgeType, b: EdgeType, seedA?: number, seedB?: number) =>
  a === complement(b) && seedA === seedB;
