import type { PieceVector } from "./piece-generator";

const n = (v: number) => String(Math.round(v * 100) / 100);

/** Converts vector segments to an SVG path `d` string. */
export function toSvgPath(vector: Pick<PieceVector, "segments">): string {
  return vector.segments
    .map((s) => {
      switch (s.type) {
        case "M":
        case "L":
          return `${s.type}${n(s.to.x)} ${n(s.to.y)}`;
        case "C":
          return `C${n(s.c1.x)} ${n(s.c1.y)} ${n(s.c2.x)} ${n(s.c2.y)} ${n(s.to.x)} ${n(s.to.y)}`;
        case "Z":
          return "Z";
      }
    })
    .join(" ");
}
