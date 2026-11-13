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
  type JigsawTemplateParams,
} from '@jiggy/shared'
import { Game as ScrambledGame } from '../views/Player'
import { GameBoard } from './GameBoard'
import { GamePanel } from './GamePanel'
import { DEFAULT_EFFECTS, type PieceEffects } from './effects'
import { DEFAULT_PIECE_BORDERS, borderScale, type PieceBorders } from './controls'
import type { GameImage } from './gameAssets'
import { useEditedUrls } from './renderImage'
import type { ImageEdits } from './imageFilters'
import { useQueryClient } from '@tanstack/react-query'
import { IMAGES_KEY, imagesApi, useImages } from '../api/images'
import { gameQuery, useCreateGame, useDeleteGame, useGames, useUpdateGame, type SavedGameRow } from '../api/games'
import { useTemplate, useTemplates } from '../api/templates'
import { addItem, newId, normalizeSetup, updateItem, removeItem, useLibrary, type GameSetup, type SavedImage } from './library'

const sameIds = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join()

const serverPhotoId = (id: number) => `server-${id}`

export function GameTab() {
  const [chosenTemplateId, setTemplateId] = useState<number | null>(null)
  const [photoId, setPhotoId] = useState('')
  const { library, setLibrary, error: libraryError } = useLibrary()
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG)
  const [showGuide, setShowGuide] = useState(true)
  const [borders, setBorders] = useState<PieceBorders>(DEFAULT_PIECE_BORDERS)
  const [effects, setEffects] = useState<PieceEffects>(DEFAULT_EFFECTS)
  const [selected, setSelected] = useState<number | null>(null)
  const [categoryIds, setCategoryIds] = useState<number[]>([])

  // A game is built on a jigsaw template saved on the server; the first one is used until another is picked.
  // The list holds names only; the chosen template's content is fetched when it is chosen.
  const { data: templates = [] } = useTemplates('jigsaw')
  const templateId = (templates.find((t) => t.id === chosenTemplateId) ?? templates[0])?.id ?? null
  const { data: chosenTemplate } = useTemplate<Partial<JigsawTemplateParams>>(templateId)
  const templateParams = useMemo(() => ({ ...DEFAULT_JIGSAW_PARAMS, ...chosenTemplate?.content }), [chosenTemplate])
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(templateParams).generate()), [templateParams])
  const total = jigsaw.pieces.length
  const { data: serverImages } = useImages()
  const photos: GameImage[] = [
    ...(serverImages ?? []).map((i): GameImage => ({ id: serverPhotoId(i.id), name: i.name, location: i.url, description: i.description, serverId: i.id, source: 'server' })),
    ...library.images.map((i): GameImage => ({ ...i, source: 'user' })),
  ]
  const photoUrls = useEditedUrls(photos)
  const chosen = photos.find((p) => p.id === photoId) ?? photos[0]
  const photo = chosen ? (photoUrls[chosen.id] ?? chosen.location) : ''

  const [state, setGame] = useState(() => createGame(config, total))
  // Until the effect below resets it, a game made for another piece count must not reach the board.
  const game = state.total === total ? state : createGame(config, total)
  const restart = () => {
    setGame(createGame(config, total))
    setSelected(null)
  }
  // A new template or game setup always starts a fresh game.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { panelDock: _dock, ...gameConfig } = config
  useEffect(restart, [JSON.stringify(gameConfig), total])

  const solved = isGameSolved(game)

  const imageName = (file: File) => file.name.replace(/\.[^.]+$/, '') || 'Image'
  const [imageError, setImageError] = useState<string | null>(null)
  const fail = (what: string) => (e: unknown) => setImageError(`Could not ${what}: ${e instanceof Error ? e.message : e}`)
  const client = useQueryClient()
  const refreshImages = () => client.invalidateQueries({ queryKey: IMAGES_KEY })
  const imageOf = (id: string) => photos.find((p) => p.id === id)
  const localUpdate = (id: string, patch: Partial<Omit<SavedImage, 'id'>>) => setLibrary((l) => ({ ...l, images: updateItem(l.images, id, patch) }))

  const addImage = (file: File, replaceId?: string) => {
    setImageError(null)
    const existing = replaceId ? imageOf(replaceId) : undefined
    if (existing?.serverId !== undefined) {
      return imagesApi.update(existing.serverId, { file }).then(refreshImages).catch(fail('replace the image'))
    }
    // Pictures kept in this browser have no server copy to swap, so the new file is uploaded and the entry points at it.
    return imagesApi.upload(file, existing ? existing.name : imageName(file)).then((saved) => {
      if (existing) localUpdate(existing.id, { location: saved.url })
      else setPhotoId(serverPhotoId(saved.id))
      return refreshImages()
    }).catch(fail('upload the image'))
  }
  const renameImage = (id: string, name: string) => {
    const serverId = imageOf(id)?.serverId
    if (serverId === undefined) return localUpdate(id, { name })
    imagesApi.update(serverId, { name }).then(refreshImages).catch(fail('rename the image'))
  }
  const describeImage = (id: string, description: string) => {
    const serverId = imageOf(id)?.serverId
    if (serverId === undefined) return localUpdate(id, { description })
    imagesApi.update(serverId, { description }).then(refreshImages).catch(fail('save the description'))
  }
  const deleteImage = (id: string) => {
    const serverId = imageOf(id)?.serverId
    setPhotoId('')
    if (serverId === undefined) return setLibrary((l) => ({ ...l, images: removeItem(l.images, id) }))
    imagesApi.delete(serverId).then(refreshImages).catch(fail('delete the image'))
  }

  const imageId = chosen?.serverId ?? serverImages?.find((i) => i.url === chosen?.location)?.id
  const setup = (): GameSetup => ({ config, showGuide, borders, effects })
  const gameRows = useGames()
  // The list holds names only; a game's config is fetched when it is selected, and kept as the baseline Save compares against.
  const [baseline, setBaseline] = useState<{ id: string; game: SavedGameRow<Partial<GameSetup>> } | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const createSaved = useCreateGame<GameSetup>()
  const updateSaved = useUpdateGame<GameSetup>()
  const deleteSaved = useDeleteGame()
  const saved = gameRows.data ?? []
  const [selectedGameId, setSelectedGameId] = useState('')
  const noGameSelected = !saved.some((g) => String(g.id) === selectedGameId)
  const games = {
    items: saved.map((g) => ({ id: String(g.id), name: g.name })),
    loading: gameRows.isLoading,
    required: true,
    onSelectedChange: setSelectedGameId,
    error: [gameRows.error, loadError, createSaved.error, updateSaved.error, deleteSaved.error].find(Boolean)?.message ?? null,
    onLoad: async (id: string) => {
      try {
        const g = await client.fetchQuery(gameQuery<Partial<GameSetup>>(Number(id)))
        const loaded = normalizeSetup(g.config)
        setTemplateId(g.templateId)
        setCategoryIds(g.categoryIds ?? [])
        if (g.imageId !== null) setPhotoId(serverPhotoId(g.imageId))
        setConfig({ ...loaded.config, type: g.parent as GameConfig['type'] })
        setShowGuide(loaded.showGuide)
        setBorders(loaded.borders)
        setEffects(loaded.effects)
        setBaseline({ id, game: g })
        setLoadError(null)
      } catch (err) {
        setLoadError(err instanceof Error ? err : new Error(String(err)))
      }
    },
    // The new game takes whatever the panel shows now: its template, background photo and configuration.
    onAdd: async (name: string) => {
      if (templateId === null) throw new Error('Create a jigsaw template first')
      const created = await createSaved.mutateAsync({ name, parent: config.type, templateId, imageId: imageId ?? null, config: setup(), categoryIds })
      setBaseline({ id: String(created.id), game: created })
      return String(created.id)
    },
    isChanged: (id: string) => {
      const g = baseline?.id === id ? baseline.game : undefined
      return !g || g.templateId !== templateId || g.imageId !== (imageId ?? null) || g.parent !== config.type || !sameIds(g.categoryIds ?? [], categoryIds) || JSON.stringify(normalizeSetup(g.config)) !== JSON.stringify(setup())
    },
    onSave: (id: string) => {
      if (templateId !== null) {
        updateSaved.mutate({ id: Number(id), parent: config.type, templateId, imageId: imageId ?? null, config: setup(), categoryIds }, { onSuccess: (game) => setBaseline({ id, game }) })
      }
    },
    onRename: (id: string, name: string) => updateSaved.mutate({ id: Number(id), name }),
    onDelete: (id: string) => deleteSaved.mutate(Number(id)),
  }

  return (
    <div className="flex flex-col md:flex-row min-h-0 min-w-0 flex-1">
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden bg-white p-4">
        {noGameSelected ? (
          <div role="img" aria-label="No game selected" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-slate-200 text-slate-400">
            <svg viewBox="0 0 24 24" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h5.5a2 2 0 1 1 4 0H19v5.5a2 2 0 1 0 0 4V19h-5.5a2 2 0 1 0-4 0H4v-5.5a2 2 0 1 1 0-4z" />
            </svg>
            <p className="text-sm">Choose or create a game to start</p>
          </div>
        ) : config.type === 'scrambled' ? (
          // Scrambled pieces is the Puzzle view: loose pieces scattered around the board.
          <div className="min-h-0 flex-1 overflow-hidden rounded border border-slate-200">
            <ScrambledGame
              key={`${chosenTemplate?.id ?? 'none'}-${chosenTemplate?.updated ?? ''}-${config.seed}-${config.viewPercent}-${config.startSide}-${config.looseCount}-${config.spread}`}
              spec={{ cols: templateParams.cols, rows: templateParams.rows, seed: templateParams.seed + config.seed }}
              jigsaw={jigsaw}
              photo={photo}
              showGuide={showGuide}
              outline={borders.template.line}
              outlineScale={borderScale(borders.template.width)}
              borders={borders}
              effects={effects}
              zoomOrientation={config.zoomOrientation}
              freeBuild={config.freeBuild}
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
        templateOptions={templates.map((t) => ({ id: t.id, name: t.name }))}
        templateId={templateId}
        onTemplate={setTemplateId}
        photoId={chosen?.id ?? ''}
        photos={photos}
        photoUrls={photoUrls}
        onEditPhoto={(id, edits: ImageEdits | undefined) => setLibrary((l) => ({ ...l, images: updateItem(l.images, id, { edits }) }))}
        onCopyPhoto={(base, name, edits) => {
          // The copy points at the same untouched original, so no picture data is duplicated.
          const id = newId()
          setLibrary((l) => ({ ...l, images: addItem(l.images, { id, name, location: base.location, edits }) }))
          setPhotoId(id)
        }}
        onPhoto={setPhotoId}
        onUpload={(file) => void addImage(file)}
        onReplacePhoto={(id, file) => void addImage(file, id)}
        onRenamePhoto={renameImage}
        onDescribePhoto={describeImage}
        onDeletePhoto={deleteImage}
        games={games}
        categoryIds={categoryIds}
        onCategoryIds={setCategoryIds}
        disabled={noGameSelected}
        libraryError={libraryError ?? imageError}
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
