import { useMemo, useRef, useState } from 'react'
import { JigsawVectorizer, toSvgPath, trayPieces, type GameState, type JigsawVector } from '@jiggy/shared'

const PAD = 16
const vectorizer = new JigsawVectorizer()

type Props = {
  jigsaw: JigsawVector
  photo: string
  game: GameState
  selected: number | null
  showGuide: boolean
  onSelect: (piece: number | null) => void
  /** `piece` is given when the placement comes from a drag, before `selected` has updated. */
  onPlace: (slot: number, piece?: number) => void
}

type Drag = { piece: number; x: number; y: number; w: number; h: number }
const DRAG_THRESHOLD = 4

/** The photo, clipped to one piece's outline, in puzzle coordinates. */
function PieceImage({ jigsaw, photo, clipId }: { jigsaw: JigsawVector; photo: string; clipId: string }) {
  return (
    <image
      href={photo}
      x={0}
      y={0}
      width={jigsaw.width}
      height={jigsaw.height}
      preserveAspectRatio="xMidYMid slice"
      clipPath={`url(#${clipId})`}
    />
  )
}

export function GameBoard({ jigsaw, photo, game, selected, showGuide, onSelect, onPlace }: Props) {
  const paths = useMemo(() => vectorizer.toSvgPaths(jigsaw), [jigsaw])
  const { minX, minY } = jigsaw.bounds
  const tray = trayPieces(game)
  const [drag, setDrag] = useState<Drag | null>(null)
  // Set once the pointer moves far enough that the gesture is a drag, not a click.
  const dragged = useRef(false)

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
      setDrag({ piece, x: ev.clientX, y: ev.clientY, w: rect.width, h: rect.height })
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg
          className="max-h-full max-w-full"
          viewBox={`${minX - PAD} ${minY - PAD} ${jigsaw.width + PAD * 2} ${jigsaw.height + PAD * 2}`}
          style={{ aspectRatio: `${jigsaw.width + PAD * 2} / ${jigsaw.height + PAD * 2}` }}
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
            <image href={photo} width={jigsaw.width} height={jigsaw.height} preserveAspectRatio="xMidYMid slice" opacity={0.18} />
          )}
          {paths.map((d, i) =>
            game.placed[i] ? (
              <g key={i} data-testid="placed">
                <PieceImage jigsaw={jigsaw} photo={photo} clipId={`piece-clip-${i}`} />
                <path d={d} fill="none" stroke="#ffffff88" strokeWidth={1} />
              </g>
            ) : (
              <path
                key={i}
                data-testid="slot"
                data-slot-index={i}
                d={d}
                fill={selected !== null ? '#fbbf2433' : 'transparent'}
                stroke="#92400e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                className={selected !== null ? 'cursor-pointer' : ''}
                onClick={() => selected !== null && onPlace(i)}
              />
            ),
          )}
        </svg>
      </div>
      <div className="flex min-h-24 w-full shrink-0 items-center gap-3 overflow-x-scroll rounded [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-200 [&::-webkit-scrollbar]:h-3 border border-slate-200 bg-slate-50 p-3" aria-label="Piece panel">
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
                className="h-20 w-auto"
                viewBox={`${b.minX} ${b.minY} ${b.maxX - b.minX} ${b.maxY - b.minY}`}
                style={{ aspectRatio: `${b.maxX - b.minX} / ${b.maxY - b.minY}` }}
              >
                <defs>
                  <clipPath id={`tray-clip-${i}`}>
                    <path d={toSvgPath(jigsaw.pieces[i].vector)} />
                  </clipPath>
                </defs>
                <PieceImage jigsaw={jigsaw} photo={photo} clipId={`tray-clip-${i}`} />
                <path d={toSvgPath(jigsaw.pieces[i].vector)} fill="none" stroke="#92400e" strokeWidth={2} />
              </svg>
            </button>
          )
        })}
      </div>
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
          <path d={toSvgPath(jigsaw.pieces[drag.piece].vector)} fill="none" stroke="#92400e" strokeWidth={2} />
        </svg>
      )}
    </div>
  )
}

function pieceViewBox(jigsaw: JigsawVector, i: number) {
  const b = jigsaw.pieces[i].vector.bounds
  return `${b.minX} ${b.minY} ${b.maxX - b.minX} ${b.maxY - b.minY}`
}
