import { ZoomControls, useZoom } from '../designer/zoom'
import { DEFAULT_PIECE_BORDERS, PieceBorderPath, type PieceBorders } from '../designer/controls'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NextPiecesGame } from './NextPiecesGame'
import {
  buildPuzzle,
  decodePuzzleId,
  encodePuzzleId,
  isSolved,
  scatterOffsets,
  snapPiece,
  toSvgPath,
  viewMargins,
  type JigsawVector,
  type Offset,
  type ScatterOptions,
  type PuzzleSpec,
} from '@jiggy/shared'

const DEFAULT_SPEC: PuzzleSpec = { cols: 4, rows: 3, seed: 1 }

export default function Player() {
  const [params, setParams] = useSearchParams()
  const spec = decodePuzzleId(params.get('id')) ?? DEFAULT_SPEC
  const id = encodePuzzleId(spec)
  const mode: Mode = params.get('mode') === 'next-pieces' ? 'next-pieces' : 'scrambled'
  const setMode = (m: Mode) => {
    const next = new URLSearchParams(params)
    next.set('mode', m)
    setParams(next, { replace: true })
  }
  // Remount on id or mode change so the game state resets.
  return mode === 'next-pieces' ? (
    <NextPiecesGame key={id} spec={spec} modeControls={<ModeControls mode={mode} onMode={setMode} />} />
  ) : (
    <Game key={id} spec={spec} modeControls={<ModeControls mode={mode} onMode={setMode} />} />
  )
}

type Mode = 'scrambled' | 'next-pieces'

const MODES: { id: Mode; label: string }[] = [
  { id: 'scrambled', label: 'Scrambled pieces' },
  { id: 'next-pieces', label: 'Next pieces in panel' },
]

function ModeControls({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <div role="group" aria-label="Game mode" className="flex gap-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          aria-pressed={m.id === mode}
          className={`rounded border px-3 py-1.5 text-sm font-medium ${
            m.id === mode
              ? 'border-amber-500 bg-amber-50 text-amber-800'
              : 'border-slate-300 bg-white hover:bg-slate-100'
          }`}
          onClick={() => onMode(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export function Game({
  spec,
  scatter,
  jigsaw,
  photo,
  showGuide = false,
  outline = 'solid',
  outlineScale = 1,
  borders = DEFAULT_PIECE_BORDERS,
  modeControls,
}: {
  spec: PuzzleSpec
  scatter?: ScatterOptions
  /** Custom template outlines; defaults to a plain grid built from `spec`. */
  jigsaw?: JigsawVector
  /** Picture clipped into each piece; pieces are flat colours without it. */
  photo?: string
  showGuide?: boolean
  /** Draw the template's piece outlines on the board as a placement hint. */
  outline?: 'none' | 'solid' | 'dotted'
  /** Multiplier on the outline width (thin 0.5, medium 1, thick 2). */
  outlineScale?: number
  /** Border looks for loose (moving) and home (set) pieces. */
  borders?: PieceBorders
  modeControls?: React.ReactNode
}) {
  const puzzle = useMemo(() => jigsaw ?? buildPuzzle(spec), [jigsaw, spec])
  const paths = useMemo(() => puzzle.pieces.map((p) => toSvgPath(p.vector)), [puzzle])
  const [offsets, setOffsets] = useState<Offset[]>(() => scatterOffsets(spec, scatter))
  // Pieces drawn last are on top; dragging brings a piece to the front.
  const [order, setOrder] = useState(() => puzzle.pieces.map((_, i) => i))
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ index: number; last: Offset } | null>(null)

  const solved = isSolved(offsets)
  const placed = offsets.filter((o) => o.x === 0 && o.y === 0).length

  // Snap distance follows the piece size, so small pieces of big puzzles don't snap from afar.
  const snapTolerance = scatter?.cell ? Math.min(scatter.cell.width, scatter.cell.height) * 0.25 : undefined
  const margin = viewMargins(spec, scatter?.viewPercent, scatter?.cell)
  const { minX, minY } = puzzle.bounds
  const viewBox = `${minX - margin.x} ${minY - margin.y} ${puzzle.width + margin.x * 2} ${puzzle.height + margin.y * 2}`

  // Solid outline about a pixel wide whatever the grid size (dashes turn to noise on big grids).
  const pixel = Math.max(2, (puzzle.width + margin.x * 2) / 800)
  const outlineWidth = pixel * outlineScale

  const z = useZoom((puzzle.width + margin.x * 2) / (puzzle.height + margin.y * 2))

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
    setOffsets((os) => os.map((o, i) => (i === d.index ? snapPiece(o, snapTolerance).offset : o)))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-100 px-4 py-2">
        <h1 className="text-lg font-bold">Puzzle</h1>
        {modeControls}
        <span className="text-sm text-slate-600">
          {encodePuzzleId(spec)} · {placed}/{offsets.length} placed
        </span>
        {solved && <span className="rounded bg-green-600 px-2 py-0.5 text-sm font-medium text-white">Solved!</span>}
        <button
          className="ml-auto rounded bg-amber-500 px-3 py-1.5 text-sm font-medium hover:bg-amber-400"
          onClick={() => {
            setOffsets(scatterOffsets(spec, scatter))
            setOrder(puzzle.pieces.map((_, i) => i))
          }}
        >
          Restart
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 bg-slate-50">
      <div ref={z.frameRef} {...z.frameProps} className="flex min-h-0 min-w-0 flex-1 overflow-auto">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={z.svgStyle}
          className="m-auto h-full w-full touch-none select-none"
          role="img"
          aria-label="Puzzle board"
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {outline !== 'none' && (
            <g fill="none" stroke="#94a3b8" strokeWidth={outlineWidth}
              strokeDasharray={outline === 'dotted' ? `${outlineWidth * 4} ${outlineWidth * 3}` : undefined} pointerEvents="none" data-testid="outline">
              {paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          )}
          <defs>
            {photo &&
              paths.map((d, i) => (
                <clipPath key={i} id={`scatter-clip-${i}`}>
                  <path d={d} />
                </clipPath>
              ))}
          </defs>
          {photo && showGuide && (
            <image
              href={photo}
              x={minX}
              y={minY}
              width={puzzle.width}
              height={puzzle.height}
              preserveAspectRatio="xMidYMid slice"
              opacity={0.18}
            />
          )}
          {order.map((i) => {
            const { row, col } = puzzle.pieces[i]
            const o = offsets[i]
            const home = o.x === 0 && o.y === 0
            return (
              <g
                key={i}
                data-testid={`piece-${i}`}
                transform={`translate(${o.x} ${o.y})`}
                className={home ? '' : 'cursor-grab'}
                data-nopan={home ? undefined : ''}
                onPointerDown={onDown(i)}
              >
                <path
                  d={paths[i]}
                  fill={photo ? '#ffffff' : `hsl(${(row * 40 + col * 25) % 360} 85% 80%)`}
                  stroke={photo ? 'none' : '#92400e'}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                {photo && (
                  <>
                    <image
                      href={photo}
                      x={minX}
                      y={minY}
                      width={puzzle.width}
                      height={puzzle.height}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#scatter-clip-${i})`}
                    />
                    <PieceBorderPath d={paths[i]} border={home ? borders.set : borders.moving} unit={pixel / 2} color={home ? '#ffffff88' : '#92400e'} />
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <ZoomControls z={z} />
      </div>
    </div>
  )
}
