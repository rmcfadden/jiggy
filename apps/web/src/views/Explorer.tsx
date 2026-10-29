import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildPuzzle, encodePuzzleId, type PuzzleSpec } from '@jiggy/shared'
import { JigsawView } from '../designer/JigsawView'

const SIZES = [
  [3, 3],
  [4, 3],
  [4, 4],
  [6, 4],
  [6, 6],
  [8, 6],
] as const

const makeSpecs = (): PuzzleSpec[] =>
  SIZES.map(([cols, rows]) => ({ cols, rows, seed: Math.floor(Math.random() * 1_000_000) }))

function Card({ spec }: { spec: PuzzleSpec }) {
  const id = encodePuzzleId(spec)
  const jigsaw = useMemo(() => buildPuzzle(spec), [spec])
  return (
    <Link
      to={`/puzzle?id=${id}`}
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-amber-500"
    >
      <div className="flex h-40 items-center justify-center">
        <JigsawView jigsaw={jigsaw} />
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{spec.cols * spec.rows} pieces</span>
        <span className="text-slate-500">{id}</span>
      </div>
    </Link>
  )
}

export default function Explorer() {
  const [specs, setSpecs] = useState(makeSpecs)
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Puzzles</h1>
        <button
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium hover:bg-amber-400"
          onClick={() => setSpecs(makeSpecs())}
        >
          Shuffle new
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
        {specs.map((s) => (
          <Card key={encodePuzzleId(s)} spec={s} />
        ))}
      </div>
    </div>
  )
}
