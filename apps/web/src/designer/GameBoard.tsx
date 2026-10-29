import { useMemo } from 'react'
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
  onPlace: (slot: number) => void
}

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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
      <div className="flex min-h-24 items-center gap-3 overflow-x-auto rounded border border-slate-200 bg-slate-50 p-3" aria-label="Piece panel">
        {tray.length === 0 && <span className="text-sm text-slate-500">No pieces left.</span>}
        {tray.map((i) => {
          const b = jigsaw.pieces[i].vector.bounds
          return (
            <button
              key={i}
              type="button"
              aria-label={`Piece ${i + 1}`}
              aria-pressed={selected === i}
              className={`shrink-0 rounded p-1 ${selected === i ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-slate-200'}`}
              onClick={() => onSelect(selected === i ? null : i)}
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
    </div>
  )
}
