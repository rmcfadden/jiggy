import { useMemo, useState } from 'react'
import {
  DEFAULT_GAME_CONFIG,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  createGame,
  placePiece,
  type GameConfig,
  type GameState,
  type JigsawVector,
  type PuzzleSpec,
} from '@jiggy/shared'
import { GameBoard } from '../designer/GameBoard'
import type { PlayHandle, PlayState } from '../api/gamePlays'

/** The panel game's view of a server state: pieces are the matrix's row-major indexes, and a cell is filled once its piece has left the queue. */
function fromServer(state: PlayState): GameState {
  const guids = state.matrix.flat()
  const waiting = new Set(state.queue ?? [])
  const queue = (state.queue ?? []).map((g) => guids.indexOf(g))
  return { total: state.total, placed: guids.map((g) => !waiting.has(g)), queue, visible: state.visible ?? queue.length, mistakes: state.mistakes }
}

/** The "Next pieces in panel" game: the panel only offers the next few pieces. */
export function NextPiecesGame({
  spec,
  jigsaw: customJigsaw,
  photo = '',
  config: initialConfig,
  play,
}: {
  spec: PuzzleSpec
  /** Custom template; defaults to a plain grid built from `spec`. */
  jigsaw?: JigsawVector
  photo?: string
  config?: GameConfig
  /** A server-owned play: the game starts from its state and each drop is sent to the server, which answers with the new state. */
  play?: PlayHandle
}) {
  const jigsaw = useMemo(
    () => customJigsaw ?? new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(spec).generate()),
    [customJigsaw, spec],
  )
  const total = jigsaw.pieces.length
  const [config, setConfig] = useState<GameConfig>(initialConfig ?? { ...DEFAULT_GAME_CONFIG, type: 'next-pieces', seed: spec.seed })
  const [game, setGame] = useState(() => (play ? fromServer(play.state) : createGame(config, total)))
  const [selected, setSelected] = useState<number | null>(null)
  const [problem, setProblem] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white p-4">
        {problem && <p role="alert" className="mb-2 text-sm text-red-700">{problem}</p>}
        <GameBoard
          jigsaw={jigsaw}
          photo={photo}
          game={game}
          selected={selected}
          showGuide
          dock={config.panelDock}
          onDock={(panelDock) => setConfig({ ...config, panelDock })}
          onSelect={setSelected}
          onPlace={(slot, dragged) => {
            const piece = dragged ?? selected
            if (piece === null) return
            if (play) {
              // The server decides whether the piece fits; its answer is the new state, a wrong slot included.
              setProblem(null)
              play
                .send({ type: 'place', piece: play.state.matrix.flat()[piece], slot })
                .then((r) => {
                  setGame(fromServer(r.state))
                  if (r.correct) setSelected(null)
                })
                .catch((error: Error) => setProblem(error.message))
              return
            }
            const result = placePiece(game, piece, slot)
            setGame(result.state)
            if (result.correct) setSelected(null)
          }}
        />
      </main>
    </div>
  )
}
