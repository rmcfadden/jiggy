import { SIDES, type PieceVector, type Point, type Side } from "./piece-generator";

type Line = { a: Point; b: Point; edge: number };

/** Samples per cubic curve when flattening an outline. */
const STEPS = 12;

/** Flattens an outline into line segments, tagging each with the edge (0 top .. 3 left) it belongs to. */
function flatten({ segments }: PieceVector): Line[] {
  const lines: Line[] = [];
  let cur: Point = { x: 0, y: 0 };
  let edge = 0;
  let curves = 0;
  for (const s of segments) {
    if (s.type === "M") cur = s.to;
    else if (s.type === "L") {
      lines.push({ a: cur, b: s.to, edge: edge++ });
      cur = s.to;
    } else if (s.type === "C") {
      let prev = cur;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
        const p = {
          x: a * cur.x + b * s.c1.x + c * s.c2.x + d * s.to.x,
          y: a * cur.y + b * s.c1.y + c * s.c2.y + d * s.to.y,
        };
        lines.push({ a: prev, b: p, edge });
        prev = p;
      }
      cur = s.to;
      // A tab or socket is three consecutive curves.
      if (++curves % 3 === 0) edge++;
    }
  }
  return lines;
}

const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

/** True when the two segments properly cross (touching ends do not count). */
function crosses(p: Line, q: Line): boolean {
  const d1 = cross(q.a, q.b, p.a), d2 = cross(q.a, q.b, p.b);
  const d3 = cross(p.a, p.b, q.a), d4 = cross(p.a, p.b, q.b);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/**
 * Sides of a piece whose outline crosses itself, for example when a wide
 * bulb folds over its own neck or a tab runs into the one on the next edge.
 */
export function overlappingSides(vector: PieceVector): Side[] {
  const lines = flatten(vector);
  const hit = new Set<number>();
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 2; j < lines.length; j++) {
      // The first and last segments meet at the start point.
      if (i === 0 && j === lines.length - 1) continue;
      if (crosses(lines[i], lines[j])) {
        hit.add(lines[i].edge);
        hit.add(lines[j].edge);
      }
    }
  return SIDES.filter((_, i) => hit.has(i));
}
