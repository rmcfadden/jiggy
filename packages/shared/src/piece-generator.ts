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
  /** Head height / head width. Above 1 is a tall oval knob, below 1 a wide one. */
  headAspect: number;
  /** 0..1, how gradually the edge curves up into the neck (0 is a sharp corner). */
  flare: number;
  /** 0..1, how far the whole edge, tab included, waves off the straight line. */
  wobble: number;
};

export const SHAPE_KEYS = [
  "tabSize",
  "neckWidth",
  "tabPosition",
  "neckAngle",
  "jitter",
  "headAspect",
  "flare",
  "wobble",
] as const;

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

/** A tab or socket is this many consecutive cubic curves. */
export const CURVES_PER_TAB = 6;

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
  headAspect: 1,
  flare: 0.7,
  wobble: 0,
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
      const drawn = [rng(), rng(), rng(), rng(), rng(), rng()];
      const edgeSeed = edgeSeeds?.[SIDES[i]];
      const source = edgeSeed === undefined ? drawn : (() => {
        const edgeRng = createRng(edgeSeed);
        return [edgeRng(), edgeRng(), edgeRng(), edgeRng(), edgeRng(), edgeRng()];
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
      headAspect: p.headAspect,
      flare: p.flare,
      wobble: p.wobble,
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
    const tabH = tabSize * base * (1 + 0.5 * r[0]);
    // Mirror position when walking backwards so both sides of a seam agree.
    const position = reversed ? 1 - tabPosition : tabPosition;
    const offset = reversed ? -r[3] : r[3];
    const center = clamp(position + 0.2 * offset, 0.2, 0.8) * len;
    // Keep the neck symmetric about the centre so the shape reverses exactly.
    const room = Math.min(center - 0.05 * len, 0.95 * len - center);
    const neck = clamp(neckWidth * base * (1 + 0.4 * r[1]), 0.01 * base, Math.min(0.45 * len, room));
    // The head is an ellipse whose half-width is a steady multiple of the neck, so it never
    // balloons or collapses. headAspect is its height over its width, limited by the tab height.
    const headRx = Math.max(neck * 1.05, Math.min(neck * clamp(1.5 * (1 + 0.2 * r[2]), 1.2, 2.4), room));
    const aspect = clamp(shape.headAspect ?? 1, 0.4, 2);

    // Shear along the edge in proportion to height. Walking backwards flips
    // the edge direction, so the canonical lean flips with it.
    const angle = clamp(shape.neckAngle, -45, 45);
    const lean = Math.tan((angle * Math.PI) / 180) * (reversed ? -1 : 1);
    // The wave is a function of the position along the seam in its canonical direction, pushed
    // along the canonical normal, so both pieces sharing the seam move the same way.
    const amp = clamp(shape.wobble ?? 0, 0, 1) * base * 0.05;
    const flip = reversed ? -1 : 1;
    const wave = (t: number) => {
      const u = reversed ? 1 - t / len : t / len;
      return amp * (r[4] * Math.sin(Math.PI * u) + 0.6 * r[5] * Math.sin(2 * Math.PI * u));
    };
    const pt = (t: number, h: number): Point => {
      const w = wave(t) * flip;
      return {
        x: a.x + ux * (t + h * lean) + nx * (h * sign + w),
        y: a.y + uy * (t + h * lean) + ny * (h * sign + w),
      };
    };
    // The head is an ellipse centred at height `hc`; the neck rises straight into it where it
    // meets the ellipse at (center ± neck, hNeck). Both are fixed by the tab height.
    const s = Math.sqrt(1 - (neck / headRx) ** 2);
    const headRy = Math.min(headRx * aspect, (0.85 * tabH) / (1 + s));
    const hc = tabH - headRy;
    const hNeck = hc - headRy * s;
    const headPt = (theta: number): Point => pt(center + headRx * Math.cos(theta), hc + headRy * Math.sin(theta));
    // Cubic along the ellipse from angle `from` to `to` (radians, either direction).
    const arc = (from: number, to: number): PathSegment => {
      const k = (4 / 3) * Math.tan((to - from) / 4);
      const tan = (th: number): [number, number] => [-headRx * Math.sin(th), headRy * Math.cos(th)];
      const [t1x, t1y] = tan(from);
      const [t2x, t2y] = tan(to);
      const along = (th: number, kx: number, ky: number) =>
        pt(center + headRx * Math.cos(th) + kx, hc + headRy * Math.sin(th) + ky);
      return {
        type: "C",
        c1: along(from, k * t1x, k * t1y),
        c2: along(to, -k * t2x, -k * t2y),
        to: headPt(to),
      };
    };
    // Lower flare lifts the last control point, giving a sharper corner where the neck starts.
    const flareH = hNeck * 0.6 * (1 - clamp(shape.flare ?? 0.7, 0, 1));
    // The edge stays straight until this far from the neck; more flare starts the curve earlier.
    const lead = neck * (0.4 + 1.6 * clamp(shape.flare ?? 0.7, 0, 1));
    const l = center - neck;
    const r2 = center + neck;
    // Angle where the neck meets the ellipse: lower left, then clockwise round to lower right.
    const alpha = Math.acos(neck / headRx);
    const th1 = Math.PI + alpha;
    const th2 = -alpha;

    out.push({ type: "C", c1: pt(Math.max(l * 0.5, l - lead), 0), c2: pt(l, flareH), to: pt(l, hNeck) });
    out.push(arc(th1, Math.PI));
    out.push(arc(Math.PI, Math.PI / 2));
    out.push(arc(Math.PI / 2, 0));
    out.push(arc(0, th2));
    out.push({ type: "C", c1: pt(r2, flareH), c2: pt(Math.min(r2 + (len - r2) * 0.5, r2 + lead), 0), to: b });
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
      headAspect: round2(between(0.8, 1.3)),
      flare: round2(between(0.4, 1)),
      wobble: round2(between(0, 0.6)),
      seed: Math.floor(rng() * 1_000_000),
    };
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100;
