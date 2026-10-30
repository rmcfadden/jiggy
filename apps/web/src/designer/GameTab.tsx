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
import { DEFAULT_TEMPLATE, GAME_PHOTOS, TEMPLATE_SIZES, TEMPLATE_STYLES, templateParams as buildTemplateParams } from './gameAssets'
import { addItem, newId, readImage, removeItem, updateItem, useLibrary, type SavedGame } from './library'

export function GameTab() {
  const [templateSize, setTemplateSize] = useState(DEFAULT_TEMPLATE.size)
  const [templateStyle, setTemplateStyle] = useState(DEFAULT_TEMPLATE.style)
  const [photoId, setPhotoId] = useState(GAME_PHOTOS[0].id)
  const { library, setLibrary, error: libraryError } = useLibrary()
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
  const photos = [...GAME_PHOTOS.map((p) => ({ ...p, builtin: true })), ...library.images.map((i) => ({ ...i, builtin: false }))]
  const photo = (photos.find((p) => p.id === photoId) ?? photos[0]).src

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

  const snapshot = (): Omit<SavedGame, 'id' | 'name'> => ({ templateSize, templateStyle, photoId, config, showGuide, borders, effects })
  const imageName = (file: File) => file.name.replace(/\.[^.]+$/, '') || 'Image'
  const addImage = (file: File, replaceId?: string) =>
    readImage(file).then((src) => {
      if (replaceId) {
        setLibrary((l) => ({ ...l, images: updateItem(l.images, replaceId, { src }) }))
        return
      }
      const id = newId()
      setLibrary((l) => ({ ...l, images: addItem(l.images, { id, name: imageName(file), src }) }))
      setPhotoId(id)
    })

  const games = {
    items: library.games,
    onLoad: (id: string) => {
      const g = library.games.find((x) => x.id === id)
      if (!g) return
      setTemplateSize(g.templateSize)
      setTemplateStyle(g.templateStyle)
      setPhotoId(g.photoId)
      setConfig(g.config)
      setShowGuide(g.showGuide)
      setBorders(g.borders)
      setEffects(g.effects)
    },
    onAdd: (name: string) => {
      const id = newId()
      setLibrary((l) => ({ ...l, games: addItem(l.games, { id, name, ...snapshot() }) }))
      return id
    },
    onSave: (id: string) => setLibrary((l) => ({ ...l, games: updateItem(l.games, id, snapshot()) })),
    onRename: (id: string, name: string) => setLibrary((l) => ({ ...l, games: updateItem(l.games, id, { name }) })),
    onDelete: (id: string) => setLibrary((l) => ({ ...l, games: removeItem(l.games, id) })),
  }

  const templates = {
    items: library.templates,
    onLoad: (id: string) => {
      const t = library.templates.find((x) => x.id === id)
      if (!t) return
      // A template saved with a size or style that no longer exists falls back to the defaults.
      setTemplateSize(TEMPLATE_SIZES.some((s) => s.id === t.size) ? t.size : DEFAULT_TEMPLATE.size)
      setTemplateStyle(TEMPLATE_STYLES.some((s) => s.id === t.style) ? t.style : DEFAULT_TEMPLATE.style)
    },
    onAdd: (name: string) => {
      const id = newId()
      setLibrary((l) => ({ ...l, templates: addItem(l.templates, { id, name, size: templateSize, style: templateStyle }) }))
      return id
    },
    onSave: (id: string) => setLibrary((l) => ({ ...l, templates: updateItem(l.templates, id, { size: templateSize, style: templateStyle }) })),
    onRename: (id: string, name: string) => setLibrary((l) => ({ ...l, templates: updateItem(l.templates, id, { name }) })),
    onDelete: (id: string) => setLibrary((l) => ({ ...l, templates: removeItem(l.templates, id) })),
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4">
        {config.type === 'scrambled' ? (
          // Scrambled pieces is the Puzzle view: loose pieces scattered around the board.
          <div className="min-h-0 flex-1 overflow-hidden rounded border border-slate-200">
            <ScrambledGame
              key={`${templateId}-${config.seed}-${config.viewPercent}-${config.startSide}-${config.looseCount}-${config.spread}`}
              spec={{ cols: templateParams.cols, rows: templateParams.rows, seed: templateParams.seed + config.seed }}
              jigsaw={jigsaw}
              photo={photo}
              showGuide={showGuide}
              outline={borders.template.line}
              outlineScale={borderScale(borders.template.width)}
              borders={borders}
              effects={effects}
              zoomOrientation={config.zoomOrientation}
              scatter={{
                cell: { width: templateParams.width / templateParams.cols, height: templateParams.height / templateParams.rows },
                viewPercent: config.viewPercent,
                side: config.startSide,
                spread: config.spread,
                count: config.looseCount > 0 ? config.looseCount : undefined,
              }}
            />
          </div>
        ) : (
          <>
        <GameBoard
          jigsaw={jigsaw}
          photo={photo}
          game={game}
          selected={selected}
          showGuide={showGuide}
          borders={borders}
          effects={effects}
          zoomOrientation={config.zoomOrientation}
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
        photos={photos}
        onPhoto={setPhotoId}
        onUpload={(file) => void addImage(file)}
        onReplacePhoto={(id, file) => void addImage(file, id)}
        onRenamePhoto={(id, name) => setLibrary((l) => ({ ...l, images: updateItem(l.images, id, { name }) }))}
        onDeletePhoto={(id) => {
          setLibrary((l) => ({ ...l, images: removeItem(l.images, id) }))
          setPhotoId(GAME_PHOTOS[0].id)
        }}
        games={games}
        templates={templates}
        libraryError={libraryError}
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
