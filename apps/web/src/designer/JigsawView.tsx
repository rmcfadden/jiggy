import { JigsawVectorizer, type JigsawVector } from '@jiggy/shared'

const PAD = 16
const vectorizer = new JigsawVectorizer()

export function JigsawView({ jigsaw }: { jigsaw: JigsawVector }) {
  const { minX, minY } = jigsaw.bounds
  const w = jigsaw.width + PAD * 2
  const h = jigsaw.height + PAD * 2
  const paths = vectorizer.toSvgPaths(jigsaw)
  return (
    <svg
      className="max-h-full max-w-full"
      viewBox={`${minX - PAD} ${minY - PAD} ${w} ${h}`}
      style={{ aspectRatio: `${w} / ${h}` }}
      role="img"
      aria-label="Jigsaw template"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={`hsl(${(jigsaw.pieces[i].row * 40 + jigsaw.pieces[i].col * 25) % 360} 85% 80%)`}
          stroke="#92400e"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
