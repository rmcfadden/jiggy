import { toSvgPath, type PieceVector } from '@jiggy/shared'

const PAD = 16

export function PieceView({ piece }: { piece: PieceVector }) {
  const { minX, minY, maxX, maxY } = piece.bounds
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
      <path
        d={toSvgPath(piece)}
        fill="#fcd34d"
        stroke="#92400e"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}
