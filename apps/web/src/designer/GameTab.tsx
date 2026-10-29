import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_GAME_CONFIG,
  DEFAULT_JIGSAW_PARAMS,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  createGame,
  isGameSolved,
  placePiece,
  type GameConfig,
} from '@jiggy/shared'
import { Game as ScrambledGame } from '../views/Player'
import { GameBoard } from './GameBoard'
import { GamePanel } from './GamePanel'
import { DEFAULT_EFFECTS, type PieceEffects } from './effects'
import { DEFAULT_PIECE_BORDERS, borderScale, type PieceBorders } from './controls'
import { DEFAULT_TEMPLATE, GAME_PHOTOS, templateParams as buildTemplateParams } from './gameAssets'

export function GameTab() {
  const [templateSize, setTemplateSize] = useState(DEFAULT_TEMPLATE.size)
  const [templateStyle, setTemplateStyle] = useState(DEFAULT_TEMPLATE.style)
  const [photoId, setPhotoId] = useState(GAME_PHOTOS[0].id)
  const [upload, setUpload] = useState<{ name: string; src: string } | null>(null)
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG)
  const [showGuide, setShowGuide] = useState(true)
  const [borders, setBorders] = useState<PieceBorders>(DEFAULT_PIECE_BORDERS)
  const [effects, setEffects] = useState<PieceEffects>(DEFAULT_EFFECTS)
  const [selected, setSelected] = useState<number | null>(null)

  const templateId = `${templateSize}-${templateStyle}`
  const template = useMemo(() => buildTemplateParams(templateSize, templateStyle), [templateSize, templateStyle])
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(template).generate()), [template])
  const templateParams = { ...DEFAULT_JIGSAW_PARAMS, ...template }
  const total = jigsaw.pieces.length
  const photo = photoId === 'upload' && upload ? upload.src : (GAME_PHOTOS.find((p) => p.id === photoId) ?? GAME_PHOTOS[0]).src

  const [game, setGame] = useState(() => createGame(config, total))
  const restart = () => {
    setGame(createGame(config, total))
    setSelected(null)
  }
  // A new template or game setup always starts a fresh game.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { panelDock: _dock, ...gameConfig } = config
  useEffect(restart, [JSON.stringify(gameConfig), total])

  const solved = isGameSolved(game)

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4">
        {config.type === 'scrambled' ? (
          // Scrambled pieces is the Puzzle view: loose pieces scattered around the board.
          <div className="min-h-0 flex-1 overflow-hidden rounded border border-slate-200">
            <ScrambledGame
              key={`${templateId}-${config.seed}-${config.viewPercent}-${config.startSide}-${config.looseCount}`}
              spec={{ cols: templateParams.cols, rows: templateParams.rows, seed: templateParams.seed + config.seed }}
              jigsaw={jigsaw}
              photo={photo}
              showGuide={showGuide}
              outline={borders.template.line}
              outlineScale={borderScale(borders.template.width)}
              borders={borders}
              effects={effects}
              scatter={{
                cell: { width: templateParams.width / templateParams.cols, height: templateParams.height / templateParams.rows },
                viewPercent: config.viewPercent,
                side: config.startSide,
                count: config.looseCount > 0 ? config.looseCount : undefined,
              }}
            />
          </div>
        ) : (
          <>
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
          borders={borders}
          effects={effects}
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
          </>
        )}
      </main>
      <GamePanel
        templateSize={templateSize}
        templateStyle={templateStyle}
        onTemplateSize={setTemplateSize}
        onTemplateStyle={setTemplateStyle}
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
        jigsaw={jigsaw}
        photo={photo}
        effects={effects}
        onEffects={setEffects}
        borders={borders}
        onBorders={setBorders}
        pieceCount={total}
        onRestart={restart}
      />
    </div>
  )
}
