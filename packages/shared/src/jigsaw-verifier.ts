import type { JigsawMatrix } from "./jigsaw-template";
import { overlappingSides } from "./overlap";
import { JigsawTemplateGenerator } from "./jigsaw-template";
import type { JigsawVector, PlacedPiece } from "./jigsaw-vectorizer";
import type { PathSegment, Point, Side } from "./piece-generator";

export type VerifyOptions = {
  /** Largest allowed distance between matching points on a shared seam. Default 1e-6. */
  tolerance?: number;
  /** Largest allowed tab protrusion, as a fraction of the smaller piece dimension. Default 0.6. */
  maxTabRatio?: number;
};

export type VerifyIssue = {
  kind: "seam" | "closed" | "bounds" | "tab" | "overlap";
  row: number;
  col: number;
  side?: Side;
  message: string;
};

export type VerifyReport = {
  ok: boolean;
  /** Largest point distance found across all shared seams. */
  maxSeamDeviation: number;
  issues: VerifyIssue[];
};

/** Samples per cubic curve when comparing seams. */
const SAMPLES = 8;

/** Points of each edge in walk order (top, right, bottom, left); a flat edge is just its two ends. */
function edgePoints(segments: PathSegment[]): Point[][] {
  const edges: Point[][] = [];
  let cur: Point = { x: 0, y: 0 };
  let curve: Point[] = [];
  for (const s of segments) {
    if (s.type === "M") cur = s.to;
    else if (s.type === "L") {
      edges.push([cur, s.to]);
      cur = s.to;
    } else if (s.type === "C") {
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
        curve.push({
          x: a * cur.x + b * s.c1.x + c * s.c2.x + d * s.to.x,
          y: a * cur.y + b * s.c1.y + c * s.c2.y + d * s.to.y,
        });
      }
      cur = s.to;
      // A tab or socket is three consecutive curves.
      if (curve.length === 3 * (SAMPLES + 1)) {
        edges.push(curve);
        curve = [];
      }
    }
  }
  return edges;
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Checks a built puzzle: every shared seam must coincide within `tolerance`,
 * every outline must be closed, and tabs must stay within `maxTabRatio`.
 * Works at any vectorizer `gap` by comparing seams relative to each piece's placement.
 */
export function verifyJigsaw(
  matrix: JigsawMatrix,
  vector: JigsawVector,
  { tolerance = 1e-6, maxTabRatio = 0.6 }: VerifyOptions = {},
): VerifyReport {
  const issues: VerifyIssue[] = [];
  let maxSeamDeviation = 0;

  JigsawTemplateGenerator.findMismatches(matrix).forEach((message) =>
    issues.push({ kind: "seam", row: 0, col: 0, message }),
  );

  const placed = new Map<string, PlacedPiece>();
  vector.pieces.forEach((p) => placed.set(`${p.row},${p.col}`, p));

  // Where each piece's local origin landed, so a gap shift does not read as a seam gap.
  const offsets = new Map<string, Point>();
  let y = 0;
  matrix.forEach((row, r) => {
    let x = 0;
    row.forEach((params, c) => {
      const m = placed.get(`${r},${c}`)?.vector.segments[0];
      if (m?.type === "M") offsets.set(`${r},${c}`, { x: m.to.x - x, y: m.to.y - y });
      x += params.width;
    });
    y += row[0]?.height ?? 0;
  });

  const edges = new Map<string, Point[][]>();
  const edgesAt = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (!edges.has(key)) {
      const off = offsets.get(key) ?? { x: 0, y: 0 };
      const piece = placed.get(key);
      edges.set(
        key,
        piece ? edgePoints(piece.vector.segments).map((e) => e.map((p) => ({ x: p.x - off.x, y: p.y - off.y }))) : [],
      );
    }
    return edges.get(key)!;
  };

  const compare = (r: number, c: number, side: Side, a: Point[] | undefined, b: Point[] | undefined) => {
    if (!a || !b || a.length !== b.length) {
      issues.push({ kind: "seam", row: r, col: c, side, message: `Seam shape differs at row ${r}, col ${c} (${side})` });
      return;
    }
    // The neighbour walks the seam backwards.
    const worst = Math.max(...a.map((p, i) => dist(p, b[b.length - 1 - i])));
    maxSeamDeviation = Math.max(maxSeamDeviation, worst);
    if (worst > tolerance) {
      issues.push({
        kind: "seam",
        row: r,
        col: c,
        side,
        message: `Seam deviates by ${worst.toPrecision(3)} at row ${r}, col ${c} (${side})`,
      });
    }
  };

  matrix.forEach((row, r) => {
    row.forEach((params, c) => {
      const piece = placed.get(`${r},${c}`);
      if (!piece) {
        issues.push({ kind: "closed", row: r, col: c, message: `Missing piece at row ${r}, col ${c}` });
        return;
      }

      if (c < row.length - 1) compare(r, c, "right", edgesAt(r, c)[1], edgesAt(r, c + 1)[3]);
      if (r < matrix.length - 1) compare(r, c, "bottom", edgesAt(r, c)[2], edgesAt(r + 1, c)[0]);

      const segs = piece.vector.segments;
      const first = segs[0];
      const end = segs.at(-2);
      const endPoint = end && end.type !== "Z" ? end.to : undefined;
      if (first?.type !== "M" || segs.at(-1)?.type !== "Z" || !endPoint || dist(first.to, endPoint) > tolerance) {
        issues.push({ kind: "closed", row: r, col: c, message: `Outline not closed at row ${r}, col ${c}` });
      }

      overlappingSides(piece.vector).forEach((side) =>
        issues.push({ kind: "overlap", row: r, col: c, side, message: `Outline crosses itself near ${side} at row ${r}, col ${c}` }),
      );

      // The outline starts at the piece's own (placed) top-left corner.
      const origin = first?.type === "M" ? first.to : { x: 0, y: 0 };
      const { bounds } = piece.vector;
      const over: Record<Side, number> = {
        top: origin.y - bounds.minY,
        left: origin.x - bounds.minX,
        bottom: bounds.maxY - (origin.y + params.height),
        right: bounds.maxX - (origin.x + params.width),
      };
      const size = Math.min(params.width, params.height);

      (Object.keys(over) as Side[]).forEach((side) => {
        if (!Number.isFinite(over[side])) {
          issues.push({ kind: "bounds", row: r, col: c, side, message: `Invalid bounds at row ${r}, col ${c}` });
        } else if (params.edges[side] === "flat" && over[side] > 1e-3) {
          issues.push({ kind: "bounds", row: r, col: c, side, message: `Flat ${side} edge bulges at row ${r}, col ${c}` });
        } else if (over[side] > maxTabRatio * size) {
          issues.push({
            kind: "tab",
            row: r,
            col: c,
            side,
            message: `Tab on ${side} is ${(over[side] / size).toFixed(2)} of piece size at row ${r}, col ${c}`,
          });
        }
      });
    });
  });

  return { ok: issues.length === 0, maxSeamDeviation, issues };
}
