import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_GAME_CONFIG,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  createGame,
  isGameSolved,
  placePiece,
  type GameConfig,
} from '@jiggy/shared'
import { GameBoard } from './GameBoard'
import { GamePanel } from './GamePanel'
import { GAME_PHOTOS, GAME_TEMPLATES } from './gameAssets'

export function GameTab() {
  const [templateId, setTemplateId] = useState(GAME_TEMPLATES[1].id)
  const [photoId, setPhotoId] = useState(GAME_PHOTOS[0].id)
  const [upload, setUpload] = useState<{ name: string; src: string } | null>(null)
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG)
  const [showGuide, setShowGuide] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)

  const template = GAME_TEMPLATES.find((t) => t.id === templateId)!
  const jigsaw = useMemo(
    () => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(template.params).generate()),
    [template],
  )
  const total = jigsaw.pieces.length
  const photo = photoId === 'upload' && upload ? upload.src : (GAME_PHOTOS.find((p) => p.id === photoId) ?? GAME_PHOTOS[0]).src

  const [game, setGame] = useState(() => createGame(config, total))
  const restart = () => {
    setGame(createGame(config, total))
    setSelected(null)
  }
  // A new template or game setup always starts a fresh game.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(restart, [config, total])

  const solved = isGameSolved(game)

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4">
        <div className="flex items-center justify-between text-sm" aria-live="polite">
          <span>
            {game.total - game.queue.length}/{game.total} placed · {game.mistakes} mistakes
          </span>
          <span className="font-medium text-amber-700">
            {solved ? 'Solved!' : selected === null ? 'Pick a piece from the panel' : 'Now click its slot on the board'}
          </span>
        </div>
        <GameBoard
          jigsaw={jigsaw}
          photo={photo}
          game={game}
          selected={selected}
          showGuide={showGuide}
          onSelect={setSelected}
          onPlace={(slot) => {
            if (selected === null) return
            const result = placePiece(game, selected, slot)
            setGame(result.state)
            if (result.correct) setSelected(null)
          }}
        />
      </main>
      <GamePanel
        templateId={templateId}
        onTemplate={setTemplateId}
        photoId={photoId}
        uploadName={upload?.name ?? null}
        onPhoto={setPhotoId}
        onUpload={(file) => {
          const reader = new FileReader()
          reader.onload = () => {
            setUpload({ name: file.name, src: String(reader.result) })
            setPhotoId('upload')
          }
          reader.readAsDataURL(file)
        }}
        config={config}
        onConfig={setConfig}
        showGuide={showGuide}
        onShowGuide={setShowGuide}
        pieceCount={total}
        onRestart={restart}
      />
    </div>
  )
}
