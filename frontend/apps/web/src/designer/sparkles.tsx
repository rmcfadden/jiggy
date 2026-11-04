import { useId } from 'react'

type Box = { minX: number; minY: number; maxX: number; maxY: number }

/** Positions inside a piece's bounds, as fractions of width and height. */
const SPOTS: [number, number][] = [
  [0.5, 0.16],
  [0.8, 0.4],
  [0.2, 0.36],
  [0.64, 0.74],
  [0.32, 0.8],
]

/**
 * Diamond-style glints on a piece, plus a glossy shine that sweeps across it when `d` (its outline) is given.
 * Hidden until an ancestor has `.fx-sparkle` (see index.css).
 */
export function PieceSparkles({ bounds, d }: { bounds: Box; d?: string }) {
  const id = useId().replace(/:/g, '')
  const w = bounds.maxX - bounds.minX
  const h = bounds.maxY - bounds.minY
  const arm = Math.min(w, h) * 0.1
  return (
    <g className="fx-sparkles" aria-hidden>
      <defs>
        {/* Facets: light, ice-blue and white bands, like light off a cut stone. */}
        <linearGradient id={`${id}-facet`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#bae6fd" />
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {d && (
          <clipPath id={`${id}-clip`}>
            <path d={d} />
          </clipPath>
        )}
      </defs>
      {d && (
        <g clipPath={`url(#${id}-clip)`}>
          <g transform={`skewX(-20) translate(${bounds.minX + h * 0.36} 0)`}>
            <rect
              className="fx-shine"
              x={bounds.minX - w * 0.5}
              y={bounds.minY}
              width={w * 0.45}
              height={h}
              fill={`url(#${id}-shine)`}
              style={{ '--travel': `${w * 1.6}px` } as React.CSSProperties}
            />
          </g>
        </g>
      )}
      {SPOTS.map(([x, y], i) => (
        <g key={i} transform={`translate(${bounds.minX + x * w} ${bounds.minY + y * h})`}>
          <g className="fx-spark">
            <path d={glint(arm)} fill={`url(#${id}-facet)`} stroke="#7dd3fc" strokeWidth={arm * 0.05} strokeLinejoin="round" />
            <circle r={arm * 0.12} fill="#fff" />
          </g>
        </g>
      ))}
    </g>
  )
}

/** A long four-point glint with a faceted diamond core. */
function glint(arm: number) {
  const inner = arm * 0.2
  return `M0 ${-arm} L${inner} ${-inner} L${arm} 0 L${inner} ${inner} L0 ${arm} L${-inner} ${inner} L${-arm} 0 L${-inner} ${-inner} Z`
}
