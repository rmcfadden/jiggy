import { ZoomControls, useZoom } from '../designer/zoom'
import { PieceSparkles } from '../designer/sparkles'
import { NEAR_COLOR, DEFAULT_EFFECTS, effectClass, sparklePieces, useFlash, type PieceEffects } from '../designer/effects'
import { DEFAULT_PIECE_BORDERS, PieceBorderPath, type PieceBorders } from '../designer/controls'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NextPiecesGame } from './NextPiecesGame'
import { templateParams } from '../designer/gameAssets'
import {
  CATALOG,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  averageRating,
  buildPuzzle,
  decodePuzzleId,
  encodePuzzleId,
  findPuzzle,
  scatterOffsets,
  snapPiece,
  toSvgPath,
  viewMargins,
  type JigsawVector,
  type Offset,
  type Puzzle,
  type ScatterOptions,
  type PuzzleSpec,
  type ZoomOrientation,
} from '@jiggy/shared'

const DEFAULT_SPEC: PuzzleSpec = { cols: 4, rows: 3, seed: 1 }

export default function Player() {
  const [params] = useSearchParams()
  const catalogPuzzle = findPuzzle(CATALOG, params.get('id'))
  const spec = decodePuzzleId(params.get('id')) ?? DEFAULT_SPEC
  const id = catalogPuzzle?.id ?? encodePuzzleId(spec)
  const requested = params.get('mode')
  const mode: Mode =
    requested === 'next-pieces' || requested === 'scrambled'
      ? requested
      : catalogPuzzle?.settings.type === 'next-pieces'
        ? 'next-pieces'
        : 'scrambled'
  // Remount on id or mode change so the game state resets.
  if (catalogPuzzle) return <CatalogPlayer key={`${id}-${mode}`} puzzle={catalogPuzzle} mode={mode} />
  return mode === 'next-pieces' ? (
    <NextPiecesGame key={id} spec={spec} />
  ) : (
    <Game key={id} spec={spec} />
  )
}

/** A catalog puzzle: its picture, template and game settings, with its reviews underneath. */
function CatalogPlayer({ puzzle, mode }: { puzzle: Puzzle; mode: Mode }) {
  const { settings } = puzzle
  const template = useMemo(() => templateParams(puzzle.template.size, puzzle.template.style), [puzzle.template])
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(template).generate()), [template])
  const cols = template.cols!
  const rows = template.rows!
  const spec: PuzzleSpec = { cols, rows, seed: template.seed! + settings.seed }
  const average = averageRating(puzzle)
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {mode === 'next-pieces' ? (
          <NextPiecesGame
            spec={spec}
            jigsaw={jigsaw}
            photo={puzzle.image.location}
            config={{ ...settings, type: 'next-pieces' }}
          />
        ) : (
          <Game
            spec={spec}
            jigsaw={jigsaw}
            photo={puzzle.image.location}
            showGuide
            zoomOrientation={settings.zoomOrientation}
            scatter={{
              cell: { width: template.width! / cols, height: template.height! / rows },
              viewPercent: settings.viewPercent,
              side: settings.startSide,
              spread: settings.spread,
              count: settings.looseCount > 0 ? settings.looseCount : undefined,
            }}
          />
        )}
      </div>
      <details className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-sm">
        <summary className="cursor-pointer font-medium">
          Reviews ({puzzle.reviews.length}){average !== null && ` · ★ ${average.toFixed(1)}`}
        </summary>
        <ul className="mt-2 flex flex-col gap-1">
          {puzzle.reviews.map((r, i) => (
            <li key={i}>
              <span aria-label={`${r.rating} stars`} className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> {r.comment}
            </li>
          ))}
          {puzzle.reviews.length === 0 && <li className="text-slate-500">No reviews yet.</li>}
        </ul>
      </details>
    </div>
  )
}

type Mode = 'scrambled' | 'next-pieces'

export function Game({
  spec,
  scatter,
  jigsaw,
  photo,
  showGuide = false,
  outline = 'solid',
  outlineScale = 1,
  borders = DEFAULT_PIECE_BORDERS,
  effects = DEFAULT_EFFECTS,
  zoomOrientation,
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
  effects?: PieceEffects
  zoomOrientation?: ZoomOrientation
}) {
  const puzzle = useMemo(() => jigsaw ?? buildPuzzle(spec), [jigsaw, spec])
  const paths = useMemo(() => puzzle.pieces.map((p) => toSvgPath(p.vector)), [puzzle])
  const [offsets, setOffsets] = useState<Offset[]>(() => scatterOffsets(spec, scatter))
  // Pieces drawn last are on top; dragging brings a piece to the front.
  const [order, setOrder] = useState(() => puzzle.pieces.map((_, i) => i))
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ index: number; last: Offset; pos: Offset } | null>(null)
  /** The piece being dragged while it is within snapping distance of its slot. */
  const [near, setNear] = useState<number | null>(null)

  const homes = useMemo(() => offsets.map((o) => o.x === 0 && o.y === 0), [offsets])
  const flash = useFlash(homes)

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
    drag.current = { index, last: toPuzzle(e), pos: offsets[index] }
    setOrder((o) => [...o.filter((i) => i !== index), index])
  }

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const now = toPuzzle(e)
    const dx = now.x - d.last.x
    const dy = now.y - d.last.y
    d.last = now
    d.pos = { x: d.pos.x + dx, y: d.pos.y + dy }
    setNear(snapPiece(d.pos, snapTolerance).snapped ? d.index : null)
    setOffsets((os) => os.map((o, i) => (i === d.index ? { x: o.x + dx, y: o.y + dy } : o)))
  }

  const onUp = () => {
    const d = drag.current
    drag.current = null
    setNear(null)
    if (!d) return
    setOffsets((os) => os.map((o, i) => (i === d.index ? snapPiece(o, snapTolerance).offset : o)))
  }

  return (
    <div className="flex h-full flex-col">
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
          {near !== null && effects.near.highlightTemplate && (
            <path d={paths[near]} fill={`${NEAR_COLOR}55`} stroke={NEAR_COLOR} strokeWidth={outlineWidth * 2} strokeLinejoin="round" pointerEvents="none" data-testid="template-highlight" />
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
                <g className={effectClass(i, home, effects, puzzle.pieces, near, flash)}>
                <path
                  d={paths[i]}
                  fill={photo ? '#ffffff' : `hsl(${(row * 40 + col * 25) % 360} 85% 80%)`}
                  stroke={photo ? 'none' : near === i && effects.near.border ? NEAR_COLOR : '#92400e'}
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
                    <PieceBorderPath d={paths[i]} border={home ? borders.set : near === i && effects.near.border ? { ...borders.moving, width: 'thick' } : borders.moving} unit={pixel / 2} color={home ? '#ffffff88' : near === i && effects.near.border ? NEAR_COLOR : '#92400e'} />
                  </>
                )}
                </g>
              </g>
            )
          })}
          <g className="fx-sparkle">
            {flash !== null &&
              sparklePieces(effects, puzzle.pieces, homes, flash).map((i) => (
                <PieceSparkles key={`${flash}-${i}`} bounds={puzzle.pieces[i].vector.bounds} d={paths[i]} />
              ))}
          </g>
        </svg>
      </div>
      <ZoomControls z={z} orientation={zoomOrientation} />
      </div>
    </div>
  )
}
