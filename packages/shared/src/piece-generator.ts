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

export type Side = keyof PieceEdges;

/** The numeric shape of one edge's tab. */
export type EdgeShape = {
  /** Tab height as a fraction of the shorter piece side. */
  tabSize: number;
  /** Half-width of the tab neck as a fraction of the shorter piece side. */
  neckWidth: number;
  /** Tab center along its edge, 0..1. */
  tabPosition: number;
  /**
   * Lean of the tab in degrees, positive towards the end of the seam's
   * canonical direction (left->right for top/bottom, top->bottom for left/right).
   * It is stored in that canonical frame so both pieces sharing a seam hold the
   * same value and the generator flips it for whichever side walks backwards.
   */
  neckAngle: number;
  /** 0..1, amount of seeded random offset applied to the tab shape. */
  jitter: number;
};

export const SHAPE_KEYS = ["tabSize", "neckWidth", "tabPosition", "neckAngle", "jitter"] as const;

export type PieceParams = EdgeShape & {
  width: number;
  height: number;
  edges: PieceEdges;
  /** Per-side overrides of the shape values above. */
  sides?: Partial<Record<Side, Partial<EdgeShape>>>;
  seed: number;
  /**
   * Optional per-edge seeds. An edge with a seed draws its shape from that seed
   * alone, so two neighbouring pieces given the same seed (and complementary
   * edge types) produce exactly mirrored curves along their shared seam.
   */
  edgeSeeds?: Partial<Record<keyof PieceEdges, number>>;
};

export const SIDES = ["top", "right", "bottom", "left"] as const;

const OPPOSITE: Record<Side, Side> = { top: "bottom", right: "left", bottom: "top", left: "right" };

export const EDGE_TYPES: readonly EdgeType[] = ["flat", "in", "out"];

export const DEFAULT_PIECE_PARAMS: PieceParams = {
  width: 200,
  height: 200,
  edges: { top: "out", right: "out", bottom: "in", left: "in" },
  tabSize: 0.22,
  neckWidth: 0.07,
  tabPosition: 0.5,
  neckAngle: 0,
  jitter: 0.3,
  seed: 1,
};

/** The matching edge on the neighbouring piece: out <-> in, flat stays flat. */
export function complement(edge: EdgeType): EdgeType {
  return edge === "out" ? "in" : edge === "in" ? "out" : "flat";
}

export function createRng(seed: number): () => number {
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

/** Shifts a vector by (dx, dy). */
export function translateVector(vector: PieceVector, dx: number, dy: number): PieceVector {
  const move = (p: Point): Point => ({ x: p.x + dx, y: p.y + dy });
  return {
    ...vector,
    segments: vector.segments.map((s) => {
      switch (s.type) {
        case "M":
        case "L":
          return { type: s.type, to: move(s.to) };
        case "C":
          return { type: "C", c1: move(s.c1), c2: move(s.c2), to: move(s.to) };
        case "Z":
          return s;
      }
    }),
    bounds: {
      minX: vector.bounds.minX + dx,
      minY: vector.bounds.minY + dy,
      maxX: vector.bounds.maxX + dx,
      maxY: vector.bounds.maxY + dy,
    },
  };
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
    const { width, height, edges, seed, edgeSeeds } = this.params;
    const rng = createRng(seed);
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
      const drawn = [rng(), rng(), rng(), rng()];
      const edgeSeed = edgeSeeds?.[SIDES[i]];
      const source = edgeSeed === undefined ? drawn : (() => {
        const edgeRng = createRng(edgeSeed);
        return [edgeRng(), edgeRng(), edgeRng(), edgeRng()];
      })();
      const shape = this.shapeOf(SIDES[i]);
      const r = source.map((v) => (v * 2 - 1) * shape.jitter);
      // Bottom and left edges are walked against the canonical direction
      // (left->right, top->bottom), so their shape is mirrored.
      this.appendEdge(segments, corners[i], corners[(i + 1) % 4], order[i], shape, r, i >= 2);
    }
    segments.push({ type: "Z" });

    return { width, height, segments, bounds: computeBounds(segments) };
  }

  /** The piece-wide shape with this side's overrides applied. */
  shapeOf(side: Side): EdgeShape {
    const p = this.params;
    return {
      tabSize: p.tabSize,
      neckWidth: p.neckWidth,
      tabPosition: p.tabPosition,
      neckAngle: p.neckAngle,
      jitter: p.jitter,
      ...p.sides?.[side],
    };
  }

  /**
   * Params for the piece across `side` so the two fit: the facing edge is the
   * complement, with the same seed and shape values. Returns both pieces
   * because the shared edge must have a seed; one is assigned if missing.
   */
  static pair(params: PieceParams, side: Side): [PieceParams, PieceParams] {
    const opposite = OPPOSITE[side];
    const edgeSeed = params.edgeSeeds?.[side] ?? params.seed + SIDES.indexOf(side) + 1;
    const shape = new PieceGenerator(params).shapeOf(side);
    const flat: EdgeType = "flat";
    const piece: PieceParams = { ...params, edgeSeeds: { ...params.edgeSeeds, [side]: edgeSeed } };
    const neighbour: PieceParams = {
      ...params,
      edges: { top: flat, right: flat, bottom: flat, left: flat, [opposite]: complement(params.edges[side]) },
      edgeSeeds: { [opposite]: edgeSeed },
      // The angle is canonical, so it is copied unchanged, not negated.
      sides: { [opposite]: shape },
    };
    return [piece, neighbour];
  }

  private appendEdge(
    out: PathSegment[],
    a: Point,
    b: Point,
    type: EdgeType,
    shape: EdgeShape,
    r: number[],
    reversed: boolean,
  ) {
    if (type === "flat") {
      out.push({ type: "L", to: b });
      return;
    }

    const { width, height } = this.params;
    const { tabSize, neckWidth, tabPosition } = shape;
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
    const tabH = tabSize * base * (1 + 0.8 * r[0]);
    // Mirror position when walking backwards so both sides of a seam agree.
    const position = reversed ? 1 - tabPosition : tabPosition;
    const offset = reversed ? -r[3] : r[3];
    const center = clamp(position + 0.2 * offset, 0.2, 0.8) * len;
    // Keep the neck symmetric about the centre so the shape reverses exactly.
    const neckMax = Math.min(0.45 * len, center - 0.05 * len, 0.95 * len - center);
    const neck = clamp(neckWidth * base * (1 + 0.8 * r[1]), 0.01 * base, neckMax);
    const bulb = neck * 1.8 * (1 + 0.8 * r[2]);
    const x1 = center - neck;
    const x2 = center + neck;

    // Shear along the edge in proportion to height. Walking backwards flips
    // the edge direction, so the canonical lean flips with it.
    const angle = clamp(shape.neckAngle, -45, 45);
    const lean = Math.tan((angle * Math.PI) / 180) * (reversed ? -1 : 1);
    const pt = (t: number, h: number): Point => ({
      x: a.x + ux * (t + h * lean) + nx * h * sign,
      y: a.y + uy * (t + h * lean) + ny * h * sign,
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
      neckAngle: Math.round(between(-10, 10)),
      jitter: round2(between(0, 1)),
      seed: Math.floor(rng() * 1_000_000),
    };
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100;
