export type Point = { x: number; y: number };

export type PathSegment =
  | { type: "M"; to: Point }
  | { type: "L"; to: Point }
  | { type: "C"; c1: Point; c2: Point; to: Point }
  | { type: "Z" };

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export type PieceVector = {
  width: number;
  height: number;
  segments: PathSegment[];
  bounds: Bounds;
};

export type EdgeType = "flat" | "in" | "out";

export type PieceEdges = {
  top: EdgeType;
  right: EdgeType;
  bottom: EdgeType;
  left: EdgeType;
};

export type PieceParams = {
  width: number;
  height: number;
  edges: PieceEdges;
  /** Tab height as a fraction of the shorter piece side. */
  tabSize: number;
  /** Half-width of the tab neck as a fraction of the shorter piece side. */
  neckWidth: number;
  /** Tab center along its edge, 0..1. */
  tabPosition: number;
  /** 0..1, amount of seeded random offset applied to the tab shape. */
  jitter: number;
  seed: number;
};

export const EDGE_TYPES: readonly EdgeType[] = ["flat", "in", "out"];

export const DEFAULT_PIECE_PARAMS: PieceParams = {
  width: 200,
  height: 200,
  edges: { top: "out", right: "out", bottom: "in", left: "in" },
  tabSize: 0.22,
  neckWidth: 0.07,
  tabPosition: 0.5,
  jitter: 0.3,
  seed: 1,
};

/** The matching edge on the neighbouring piece: out <-> in, flat stays flat. */
export function complement(edge: EdgeType): EdgeType {
  return edge === "out" ? "in" : edge === "in" ? "out" : "flat";
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function cubicAt(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  };
}

function computeBounds(segments: PathSegment[]): Bounds {
  const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const add = (p: Point) => {
    bounds.minX = Math.min(bounds.minX, p.x);
    bounds.minY = Math.min(bounds.minY, p.y);
    bounds.maxX = Math.max(bounds.maxX, p.x);
    bounds.maxY = Math.max(bounds.maxY, p.y);
  };
  let cur: Point = { x: 0, y: 0 };
  for (const seg of segments) {
    if (seg.type === "Z") continue;
    if (seg.type === "C") {
      // Sample the curve so bounds hug the drawn shape, not the control hull.
      for (let i = 1; i < 16; i++) add(cubicAt(cur, seg.c1, seg.c2, seg.to, i / 16));
    }
    add(seg.to);
    cur = seg.to;
  }
  return bounds;
}

export class PieceGenerator {
  readonly params: PieceParams;

  constructor(params: Partial<PieceParams> = {}) {
    this.params = {
      ...DEFAULT_PIECE_PARAMS,
      ...params,
      edges: { ...DEFAULT_PIECE_PARAMS.edges, ...params.edges },
    };
  }

  /** Builds the piece outline as renderer-agnostic vector data (clockwise from top-left). */
  generate(): PieceVector {
    const { width, height, edges, jitter, seed } = this.params;
    const rng = mulberry32(seed);
    const corners: Point[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    const order: EdgeType[] = [edges.top, edges.right, edges.bottom, edges.left];

    const segments: PathSegment[] = [{ type: "M", to: corners[0] }];
    for (let i = 0; i < 4; i++) {
      // Always draw the same number of random values per edge so changing one
      // edge's type does not reshuffle the jitter on the others.
      const r = [rng(), rng(), rng(), rng()].map((v) => (v * 2 - 1) * jitter);
      this.appendEdge(segments, corners[i], corners[(i + 1) % 4], order[i], r);
    }
    segments.push({ type: "Z" });

    return { width, height, segments, bounds: computeBounds(segments) };
  }

  private appendEdge(
    out: PathSegment[],
    a: Point,
    b: Point,
    type: EdgeType,
    r: number[],
  ) {
    if (type === "flat") {
      out.push({ type: "L", to: b });
      return;
    }

    const { width, height, tabSize, neckWidth, tabPosition } = this.params;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    // Outward normal for a clockwise walk in y-down coordinates.
    const nx = uy;
    const ny = -ux;
    const sign = type === "out" ? 1 : -1;

    const base = Math.min(width, height);
    const tabH = tabSize * base * (1 + 0.25 * r[0]);
    const neck = clamp(neckWidth * base * (1 + 0.3 * r[1]), 0.01 * base, 0.45 * len);
    const bulb = neck * 1.8 * (1 + 0.3 * r[2]);
    const center = clamp(tabPosition + 0.05 * r[3], 0.2, 0.8) * len;
    const x1 = clamp(center - neck, 0.05 * len, 0.8 * len);
    const x2 = clamp(center + neck, x1 + 0.01 * len, 0.95 * len);

    const pt = (t: number, h: number): Point => ({
      x: a.x + ux * t + nx * h * sign,
      y: a.y + uy * t + ny * h * sign,
    });
    const shoulder = tabH * 0.3;
    const peak = tabH * 1.35;

    out.push({ type: "C", c1: pt(x1 * 0.5, 0), c2: pt(x1, 0), to: pt(x1, shoulder) });
    out.push({ type: "C", c1: pt(x1 - bulb, peak), c2: pt(x2 + bulb, peak), to: pt(x2, shoulder) });
    out.push({ type: "C", c1: pt(x2, 0), c2: pt(x2 + (len - x2) * 0.5, 0), to: b });
  }

  /** Random but valid params. Pass a custom `rng` (returning [0,1)) for determinism. */
  static random(rng: () => number = Math.random): PieceParams {
    const between = (lo: number, hi: number) => lo + rng() * (hi - lo);
    const pick = (): EdgeType => EDGE_TYPES[Math.floor(rng() * EDGE_TYPES.length)];
    return {
      width: Math.round(between(140, 260)),
      height: Math.round(between(140, 260)),
      edges: { top: pick(), right: pick(), bottom: pick(), left: pick() },
      tabSize: round2(between(0.15, 0.3)),
      neckWidth: round2(between(0.04, 0.12)),
      tabPosition: round2(between(0.4, 0.6)),
      jitter: round2(between(0, 1)),
      seed: Math.floor(rng() * 1_000_000),
    };
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100;
