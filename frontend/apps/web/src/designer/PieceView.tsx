import { toSvgPath, type PieceVector } from '@jiggy/shared'

const PAD = 16
const FILLS = ['#fcd34d', '#93c5fd']

/** Draws one piece, or a piece followed by its neighbours (tinted differently). */
export function PieceView({ pieces }: { pieces: PieceVector[] }) {
  const minX = Math.min(...pieces.map((p) => p.bounds.minX))
  const minY = Math.min(...pieces.map((p) => p.bounds.minY))
  const maxX = Math.max(...pieces.map((p) => p.bounds.maxX))
  const maxY = Math.max(...pieces.map((p) => p.bounds.maxY))
  const w = maxX - minX + PAD * 2
  const h = maxY - minY + PAD * 2
  return (
    <svg
      className="max-h-full max-w-full"
      style={{ width: w * 2, height: h * 2 }}
      viewBox={`${minX - PAD} ${minY - PAD} ${w} ${h}`}
      role="img"
      aria-label="Puzzle piece"
    >
      {pieces.map((piece, i) => (
        <path
          key={i}
          d={toSvgPath(piece)}
          fill={FILLS[i % FILLS.length]}
          fillOpacity={i === 0 ? 1 : 0.7}
          stroke="#92400e"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
