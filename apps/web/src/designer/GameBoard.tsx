import { PieceBorderPath, borderScale, type PieceBorders, DEFAULT_PIECE_BORDERS } from './controls'
import { ZoomControls, useZoom } from './zoom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { JigsawVectorizer, toSvgPath, trayPieces, type GameState, type PanelDock, type JigsawVector } from '@jiggy/shared'

const PAD = 16
const vectorizer = new JigsawVectorizer()

type Props = {
  jigsaw: JigsawVector
  photo: string
  game: GameState
  selected: number | null
  showGuide: boolean
  borders?: PieceBorders
  /** Which edge of the board the piece panel is docked to. */
  dock?: Dock
  /** Called when the piece selector is dragged to another edge. */
  onDock?: (dock: Dock) => void
  onSelect: (piece: number | null) => void
  /** `piece` is given when the placement comes from a drag, before `selected` has updated. */
  onPlace: (slot: number, piece?: number) => void
}

export type Dock = PanelDock

const OUTER: Record<Dock, string> = {
  bottom: 'flex-col',
  top: 'flex-col-reverse',
  right: 'flex-row',
  left: 'flex-row-reverse',
}

const DOCK_ZONE: Record<Dock, string> = {
  top: 'inset-x-0 top-0 h-1/4',
  bottom: 'inset-x-0 bottom-0 h-1/4',
  left: 'inset-y-0 left-0 w-1/4',
  right: 'inset-y-0 right-0 w-1/4',
}

type Drag = { piece: number; x: number; y: number; w: number; h: number }
const DRAG_THRESHOLD = 4
/** Room around a piece's bounds so its outline stroke isn't clipped at the edge. */
const PIECE_PAD = 3

/** The photo, clipped to one piece's outline, in puzzle coordinates. */
function PieceImage({ jigsaw, photo, clipId }: { jigsaw: JigsawVector; photo: string; clipId: string }) {
  return (
    <image
      href={photo}
      x={jigsaw.bounds.minX}
      y={jigsaw.bounds.minY}
      width={jigsaw.width}
      height={jigsaw.height}
      preserveAspectRatio="xMidYMid slice"
      clipPath={`url(#${clipId})`}
    />
  )
}

export function GameBoard({ jigsaw, photo, game, selected, showGuide, borders = DEFAULT_PIECE_BORDERS, dock = 'bottom', onDock, onSelect, onPlace }: Props) {
  const vertical = dock === 'left' || dock === 'right'
  const paths = useMemo(() => vectorizer.toSvgPaths(jigsaw), [jigsaw])
  const { minX, minY } = jigsaw.bounds
  const tray = trayPieces(game)
  const [drag, setDrag] = useState<Drag | null>(null)
  const boardSvg = useRef<SVGSVGElement>(null)
  const z = useZoom((jigsaw.width + PAD * 2) / (jigsaw.height + PAD * 2))
  // Puzzle units per screen pixel, so outlines stay about a pixel wide on big grids
  // (a plain stroke width would shrink to nothing; non-scaling-stroke flattens curves).
  const [unit, setUnit] = useState(1)
  useEffect(() => {
    const svg = boardSvg.current
    if (!svg || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const w = svg.getBoundingClientRect().width
      if (w > 0) setUnit(Math.max(1, (jigsaw.width + PAD * 2) / w))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [jigsaw])
  // Set once the pointer moves far enough that the gesture is a drag, not a click.
  const dragged = useRef(false)

  const boardRef = useRef<HTMLDivElement>(null)
  const [dockTarget, setDockTarget] = useState<Dock | null>(null)

  /** The edge of the board area nearest the pointer. */
  const nearestEdge = (x: number, y: number): Dock => {
    const r = boardRef.current!.getBoundingClientRect()
    const d: Record<Dock, number> = {
      left: (x - r.left) / r.width,
      right: (r.right - x) / r.width,
      top: (y - r.top) / r.height,
      bottom: (r.bottom - y) / r.height,
    }
    return (Object.keys(d) as Dock[]).reduce((a, b) => (d[b] < d[a] ? b : a))
  }

  const startDockDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const move = (ev: PointerEvent) => setDockTarget(nearestEdge(ev.clientX, ev.clientY))
    const end = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      setDockTarget(null)
      if (ev.type === 'pointerup') onDock?.(nearestEdge(ev.clientX, ev.clientY))
    }
    move(e.nativeEvent)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>, piece: number) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const originX = e.clientX
    const originY = e.clientY
    dragged.current = false
    const move = (ev: PointerEvent) => {
      if (!dragged.current && Math.hypot(ev.clientX - originX, ev.clientY - originY) < DRAG_THRESHOLD) return
      if (!dragged.current) {
        dragged.current = true
        onSelect(piece)
      }
      // Drag at the board's scale so the piece matches the slot it will drop into.
      const b = jigsaw.pieces[piece].vector.bounds
      const svg = boardSvg.current
      const scale = svg ? svg.getBoundingClientRect().width / (jigsaw.width + PAD * 2) : 0
      const w = scale > 0 ? (b.maxX - b.minX + PIECE_PAD * 2) * scale : rect.width
      const h = scale > 0 ? (b.maxY - b.minY + PIECE_PAD * 2) * scale : rect.height
      setDrag({ piece, x: ev.clientX, y: ev.clientY, w, h })
    }
    const end = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      setDrag(null)
      if (!dragged.current || ev.type === 'pointercancel') return
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-slot-index]')
      if (target) onPlace(Number(target.getAttribute('data-slot-index')), piece)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  return (
    <div ref={boardRef} className={`relative flex min-h-0 min-w-0 flex-1 gap-3 ${OUTER[dock]}`}>
      <div className="relative flex min-h-0 min-w-0 flex-1">
      <div ref={z.frameRef} {...z.frameProps} className="flex min-h-0 min-w-0 flex-1 overflow-auto">
        <svg
          ref={boardSvg}
          className="m-auto max-h-full max-w-full"
          viewBox={`${minX - PAD} ${minY - PAD} ${jigsaw.width + PAD * 2} ${jigsaw.height + PAD * 2}`}
          style={{ aspectRatio: `${jigsaw.width + PAD * 2} / ${jigsaw.height + PAD * 2}`, ...z.svgStyle }}
          role="img"
          aria-label="Game board"
        >
          <defs>
            {paths.map((d, i) => (
              <clipPath key={i} id={`piece-clip-${i}`}>
                <path d={d} />
              </clipPath>
            ))}
          </defs>
          {showGuide && (
            <image href={photo} x={minX} y={minY} width={jigsaw.width} height={jigsaw.height} preserveAspectRatio="xMidYMid slice" opacity={0.18} />
          )}
          {paths.map((d, i) =>
            game.placed[i] ? (
              <g key={i} data-testid="placed">
                <PieceImage jigsaw={jigsaw} photo={photo} clipId={`piece-clip-${i}`} />
                <PieceBorderPath d={d} border={borders.set} unit={unit} color="#ffffff88" />
              </g>
            ) : (
              <path
                key={i}
                data-testid="slot"
                data-slot-index={i}
                d={d}
                fill={selected !== null ? '#fbbf2433' : 'transparent'}
                stroke={borders.template.line === 'none' ? 'none' : '#92400e'}
                strokeDasharray={borders.template.line === 'dotted' ? `${4 * unit} ${4 * unit}` : undefined}
                strokeWidth={1.5 * borderScale(borders.template.width) * unit}
               
                className={selected !== null ? 'cursor-pointer' : ''}
                onClick={() => selected !== null && onPlace(i)}
              />
            ),
          )}
        </svg>
      </div>
      <ZoomControls z={z} />
      </div>
      <div
        className={`flex shrink-0 items-center gap-3 rounded border border-slate-200 bg-slate-50 p-3 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-200 ${
          vertical
            ? 'min-h-0 w-32 flex-col overflow-y-scroll [&::-webkit-scrollbar]:w-3'
            : 'min-h-24 w-full overflow-x-scroll [&::-webkit-scrollbar]:h-3'
        }`}
        aria-label="Piece selector">
        {onDock && (
          <div
            role="separator"
            aria-label="Drag to move the piece selector"
            title="Drag to dock the piece selector to another edge"
            style={{ touchAction: 'none' }}
            onPointerDown={startDockDrag}
            className={`flex shrink-0 cursor-grab select-none items-center justify-center rounded bg-slate-200 text-slate-500 hover:bg-slate-300 active:cursor-grabbing ${vertical ? 'h-4 w-full' : 'h-full min-h-12 w-4'}`}
          >
            ⋮⋮
          </div>
        )}
        {tray.length === 0 && <span className="text-sm text-slate-500">No pieces left.</span>}
        {tray.map((i) => {
          const b = jigsaw.pieces[i].vector.bounds
          return (
            <button
              key={i}
              type="button"
              aria-label={`Piece ${i + 1}`}
              aria-pressed={selected === i}
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => startDrag(e, i)}
              className={`shrink-0 select-none rounded p-1 ${drag?.piece === i ? 'opacity-40 ' : ''}${selected === i ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-slate-200'}`}
              onClick={() => {
                if (dragged.current) {
                  dragged.current = false
                  return
                }
                onSelect(selected === i ? null : i)
              }}
            >
              <svg
                className={vertical ? 'h-auto w-24' : 'h-20 w-auto'}
                viewBox={pieceViewBox(jigsaw, i)}
                style={{ aspectRatio: `${b.maxX - b.minX + PIECE_PAD * 2} / ${b.maxY - b.minY + PIECE_PAD * 2}` }}
              >
                <defs>
                  <clipPath id={`tray-clip-${i}`}>
                    <path d={toSvgPath(jigsaw.pieces[i].vector)} />
                  </clipPath>
                </defs>
                <PieceImage jigsaw={jigsaw} photo={photo} clipId={`tray-clip-${i}`} />
                <PieceBorderPath d={toSvgPath(jigsaw.pieces[i].vector)} border={borders.selector} />
              </svg>
            </button>
          )
        })}
      </div>
      {dockTarget && (
        <div
          aria-hidden
          className={`pointer-events-none absolute z-40 rounded border-2 border-dashed border-amber-500 bg-amber-300/30 ${DOCK_ZONE[dockTarget]}`}
        />
      )}
      {drag && (
        <svg
          aria-hidden
          className="pointer-events-none fixed z-50 drop-shadow-lg"
          style={{ left: drag.x - drag.w / 2, top: drag.y - drag.h / 2, width: drag.w, height: drag.h }}
          viewBox={pieceViewBox(jigsaw, drag.piece)}
        >
          <defs>
            <clipPath id="drag-clip">
              <path d={toSvgPath(jigsaw.pieces[drag.piece].vector)} />
            </clipPath>
          </defs>
          <PieceImage jigsaw={jigsaw} photo={photo} clipId="drag-clip" />
          <PieceBorderPath d={toSvgPath(jigsaw.pieces[drag.piece].vector)} border={borders.moving} />
        </svg>
      )}
    </div>
  )
}

function pieceViewBox(jigsaw: JigsawVector, i: number) {
  const b = jigsaw.pieces[i].vector.bounds
  return `${b.minX - PIECE_PAD} ${b.minY - PIECE_PAD} ${b.maxX - b.minX + PIECE_PAD * 2} ${b.maxY - b.minY + PIECE_PAD * 2}`
}
