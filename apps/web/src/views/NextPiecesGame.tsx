import { useMemo, useState } from 'react'
import {
  DEFAULT_GAME_CONFIG,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  createGame,
  encodePuzzleId,
  isGameSolved,
  placePiece,
  type GameConfig,
  type PuzzleSpec,
} from '@jiggy/shared'
import { GameBoard, type Dock } from '../designer/GameBoard'
import { GAME_PHOTOS } from '../designer/gameAssets'

/** The "Next pieces in panel" game: the panel only offers the next few pieces. */
export function NextPiecesGame({ spec, modeControls }: { spec: PuzzleSpec; modeControls: React.ReactNode }) {
  const jigsaw = useMemo(
    () => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(spec).generate()),
    [spec],
  )
  const total = jigsaw.pieces.length
  const [config, setConfig] = useState<GameConfig>({ ...DEFAULT_GAME_CONFIG, type: 'next-pieces', seed: spec.seed })
  const [game, setGame] = useState(() => createGame(config, total))
  const [selected, setSelected] = useState<number | null>(null)
  const [dock, setDock] = useState<Dock>('bottom')

  const start = (next: GameConfig) => {
    setConfig(next)
    setGame(createGame(next, total))
    setSelected(null)
  }
  const solved = isGameSolved(game)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-slate-100 px-4 py-2">
        <h1 className="text-lg font-bold">Puzzle</h1>
        {modeControls}
        <span className="text-sm text-slate-600">
          {encodePuzzleId(spec)} · {game.total - game.queue.length}/{game.total} placed · {game.mistakes} mistakes
        </span>
        {solved && <span className="rounded bg-green-600 px-2 py-0.5 text-sm font-medium text-white">Solved!</span>}
        <label className="ml-auto flex items-center gap-2 text-sm">
          Pieces in panel
          <input
            type="number"
            min={1}
            max={total}
            className="w-16 rounded border border-slate-300 px-2 py-1"
            value={config.panelSize}
            onChange={(e) => start({ ...config, panelSize: Math.min(total, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Order
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={config.order}
            onChange={(e) => start({ ...config, order: e.target.value as GameConfig['order'] })}
          >
            <option value="sequential">Sequential</option>
            <option value="random">Random</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          Panel
          <select className="rounded border border-slate-300 px-2 py-1" value={dock} onChange={(e) => setDock(e.target.value as Dock)}>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <button className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium hover:bg-amber-400" onClick={() => start(config)}>
          Restart
        </button>
      </div>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white p-4">
        <GameBoard
          jigsaw={jigsaw}
          photo={GAME_PHOTOS[0].src}
          game={game}
          selected={selected}
          showGuide
          dock={dock}
          onSelect={setSelected}
          onPlace={(slot, dragged) => {
            const piece = dragged ?? selected
            if (piece === null) return
            const result = placePiece(game, piece, slot)
            setGame(result.state)
            if (result.correct) setSelected(null)
          }}
        />
      </main>
    </div>
  )
}
