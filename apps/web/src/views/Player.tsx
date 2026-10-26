import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  PIECE_SIZE,
  buildPuzzle,
  decodePuzzleId,
  encodePuzzleId,
  isSolved,
  scatterOffsets,
  snapPiece,
  toSvgPath,
  type Offset,
  type PuzzleSpec,
} from '@jiggy/shared'

const DEFAULT_SPEC: PuzzleSpec = { cols: 4, rows: 3, seed: 1 }

export default function Player() {
  const [params] = useSearchParams()
  const spec = decodePuzzleId(params.get('id')) ?? DEFAULT_SPEC
  const id = encodePuzzleId(spec)
  // Remount on id change so the game state resets.
  return <Game key={id} spec={spec} />
}

function Game({ spec }: { spec: PuzzleSpec }) {
  const puzzle = useMemo(() => buildPuzzle(spec), [spec])
  const paths = useMemo(() => puzzle.pieces.map((p) => toSvgPath(p.vector)), [puzzle])
  const [offsets, setOffsets] = useState<Offset[]>(() => scatterOffsets(spec))
  // Pieces drawn last are on top; dragging brings a piece to the front.
  const [order, setOrder] = useState(() => puzzle.pieces.map((_, i) => i))
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ index: number; last: Offset } | null>(null)

  const solved = isSolved(offsets)
  const placed = offsets.filter((o) => o.x === 0 && o.y === 0).length

  const margin = PIECE_SIZE * 2 + Math.max(spec.cols, spec.rows) * PIECE_SIZE * 0.75
  const { minX, minY } = puzzle.bounds
  const viewBox = `${minX - margin} ${minY - margin} ${puzzle.width + margin * 2} ${puzzle.height + margin * 2}`

  const toPuzzle = (e: React.PointerEvent): Offset => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const m = svg.getScreenCTM()
    if (!m) return { x: e.clientX, y: e.clientY }
    const p = pt.matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  const onDown = (index: number) => (e: React.PointerEvent) => {
    if (offsets[index].x === 0 && offsets[index].y === 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { index, last: toPuzzle(e) }
    setOrder((o) => [...o.filter((i) => i !== index), index])
  }

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const now = toPuzzle(e)
    const dx = now.x - d.last.x
    const dy = now.y - d.last.y
    d.last = now
    setOffsets((os) => os.map((o, i) => (i === d.index ? { x: o.x + dx, y: o.y + dy } : o)))
  }

  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    setOffsets((os) => os.map((o, i) => (i === d.index ? snapPiece(o).offset : o)))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-100 px-4 py-2">
        <h1 className="text-lg font-bold">Puzzle Player</h1>
        <span className="text-sm text-slate-600">
          {encodePuzzleId(spec)} · {placed}/{offsets.length} placed
        </span>
        {solved && <span className="rounded bg-green-600 px-2 py-0.5 text-sm font-medium text-white">Solved!</span>}
        <button
          className="ml-auto rounded bg-amber-500 px-3 py-1.5 text-sm font-medium hover:bg-amber-400"
          onClick={() => {
            setOffsets(scatterOffsets(spec))
            setOrder(puzzle.pieces.map((_, i) => i))
          }}
        >
          Restart
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="h-full w-full touch-none select-none"
          role="img"
          aria-label="Puzzle board"
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <rect
            x={minX}
            y={minY}
            width={puzzle.width}
            height={puzzle.height}
            fill="none"
            stroke="#94a3b8"
            strokeDasharray="8 6"
            strokeWidth={2}
          />
          {order.map((i) => {
            const { row, col } = puzzle.pieces[i]
            const o = offsets[i]
            const home = o.x === 0 && o.y === 0
            return (
              <path
                key={i}
                data-testid={`piece-${i}`}
                d={paths[i]}
                transform={`translate(${o.x} ${o.y})`}
                fill={`hsl(${(row * 40 + col * 25) % 360} 85% 80%)`}
                stroke="#92400e"
                strokeWidth={1.5}
                strokeLinejoin="round"
                className={home ? '' : 'cursor-grab'}
                onPointerDown={onDown(i)}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
