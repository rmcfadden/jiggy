import { useMemo, useState } from 'react'
import {
  DEFAULT_GAME_CONFIG,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  createGame,
  placePiece,
  type GameConfig,
  type JigsawVector,
  type PuzzleSpec,
} from '@jiggy/shared'
import { GameBoard } from '../designer/GameBoard'
import { GAME_PHOTOS } from '../designer/gameAssets'

/** The "Next pieces in panel" game: the panel only offers the next few pieces. */
export function NextPiecesGame({
  spec,
  jigsaw: customJigsaw,
  photo = GAME_PHOTOS[0].location,
  config: initialConfig,
}: {
  spec: PuzzleSpec
  /** Custom template; defaults to a plain grid built from `spec`. */
  jigsaw?: JigsawVector
  photo?: string
  config?: GameConfig
}) {
  const jigsaw = useMemo(
    () => customJigsaw ?? new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(spec).generate()),
    [customJigsaw, spec],
  )
  const total = jigsaw.pieces.length
  const [config, setConfig] = useState<GameConfig>(initialConfig ?? { ...DEFAULT_GAME_CONFIG, type: 'next-pieces', seed: spec.seed })
  const [game, setGame] = useState(() => createGame(config, total))
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex h-full flex-col">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white p-4">
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
            const result = placePiece(game, piece, slot)
            setGame(result.state)
            if (result.correct) setSelected(null)
          }}
        />
      </main>
    </div>
  )
}
