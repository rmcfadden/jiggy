import { ZoomControls, useZoom } from '../designer/zoom'
import { PieceSparkles } from '../designer/sparkles'
import { NEAR_COLOR, DEFAULT_EFFECTS, effectClass, sparklePieces, useFlash, type PieceEffects } from '../designer/effects'
import { DEFAULT_PIECE_BORDERS, PieceBorderPath, SET_ALPHA, type PieceBorders } from '../designer/controls'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gameQuery } from '../api/games'
import { FINISHED_PLAYS_KEY, UNFINISHED_PLAYS_KEY, UnauthorizedError, playStateQuery, playStatesQuery, sendPlayAction, type PlayHandle, type PlayState } from '../api/gamePlays'
import { useSession, useSignOut } from '../auth/hooks'
import { primaryButton } from '../designer/controls'
import { useImage } from '../api/images'
import { useTemplate } from '../api/templates'
import { normalizeSetup } from '../designer/library'
import { NextPiecesGame } from './NextPiecesGame'
import { ViewOnlyContext, useViewOnly } from './viewOnly'
import { templateParams } from '../designer/gameAssets'
import {
  CATALOG,
  DEFAULT_JIGSAW_PARAMS,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  PIECE_SIZE,
  averageRating,
  buildPuzzle,
  decodePuzzleId,
  encodePuzzleId,
  findPuzzle,
  connectedPieces,
  scatterOffsets,
  settleGroup,
  snapPiece,
  toSvgPath,
  viewMargins,
  type GameConfig,
  type JigsawTemplateParams,
  type JigsawVector,
  type Offset,
  type Puzzle,
  type ScatterOptions,
  type PuzzleSpec,
  type ZoomOrientation,
} from '@jiggy/shared'

const DEFAULT_SPEC: PuzzleSpec = { cols: 4, rows: 3, seed: 1 }

export default function Player() {
  const signedIn = Boolean(useSession().data)
  return (
    <div className="flex h-full flex-col">
      {!signedIn && (
        <div role="status" className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
          Live game play is disabled until you <Link to="/signin" state={{ from: '/puzzles' }} className="font-medium underline">sign in</Link>. You can look at this puzzle, but not play it.
        </div>
      )}
      {/* Signed-out visitors get a view-only board: zoom and the preview still work, moves are ignored. */}
      <div className="min-h-0 flex-1">
        <ViewOnlyContext.Provider value={!signedIn}>
          <PlayerContent />
        </ViewOnlyContext.Provider>
      </div>
    </div>
  )
}

function PlayerContent() {
  const [params] = useSearchParams()
  const savedId = /^\d+$/.test(params.get('id') ?? '') ? Number(params.get('id')) : null
  const catalogPuzzle = savedId === null ? findPuzzle(CATALOG, params.get('id')) : undefined
  const spec = decodePuzzleId(params.get('id')) ?? DEFAULT_SPEC
  const id = catalogPuzzle?.id ?? encodePuzzleId(spec)
  const requested = params.get('mode')
  const mode: Mode =
    requested === 'next-pieces' || requested === 'scrambled'
      ? requested
      : catalogPuzzle?.settings.type === 'next-pieces'
        ? 'next-pieces'
        : 'scrambled'
  // Remount on id or mode change so the game state resets.
  const playId = /^\d+$/.test(params.get('play') ?? '') ? Number(params.get('play')) : null
  if (savedId !== null) return <SavedPlayer key={`${savedId}-${requested}-${playId}`} id={savedId} playId={playId} requested={requested} />
  if (catalogPuzzle) return <CatalogPlayer key={`${id}-${mode}`} puzzle={catalogPuzzle} mode={mode} />
  return mode === 'next-pieces' ? (
    <NextPiecesGame key={id} spec={spec} />
  ) : (
    <Game key={id} spec={spec} />
  )
}

/** A saved game from `/api/games/:id`: its stored config, its template's shape and its image, all from the database. */
function SavedPlayer({ id, playId, requested }: { id: number; playId: number | null; requested: string | null }) {
  const game = useQuery(gameQuery<Parameters<typeof normalizeSetup>[0]>(id))
  // With a play id the server owns the game: the board is drawn from its state and every move goes to it.
  const playState = useQuery({ ...playStateQuery(playId ?? 0), enabled: playId !== null })
  // A finished play opens as a replay: every state is loaded and a scroller at the bottom steps through them.
  const finished = Boolean(playState.data?.finished)
  const history = useQuery({ ...playStatesQuery(playId ?? 0), enabled: playId !== null && finished })
  const [step, setStep] = useState<number | null>(null)
  const states = history.data?.states
  const at = states ? Math.min(step ?? states.length - 1, states.length - 1) : 0
  // A refused access token (expired or invalid), whether loading the play or sending a move, signs the user out and
  // sends them to sign in, coming back to this puzzle afterwards.
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = useSignOut()
  const client = useQueryClient()
  const [congratulating, setCongratulating] = useState(false)
  const toSignIn = useCallback(() => {
    signOut()
    navigate('/signin', { state: { from: location.pathname + location.search } })
  }, [signOut, navigate, location.pathname, location.search])
  const play = useMemo<PlayHandle | undefined>(
    () =>
      playId !== null && playState.data && finished && states
        ? {
            id: playId,
            state: states[at],
            replay: true,
            send: () => Promise.reject(new Error('This play is finished.')),
          }
        : playId !== null && playState.data && !finished
        ? {
            id: playId,
            state: playState.data.state,
            send: (action) =>
              sendPlayAction(playId, action).then(
                (reply) => {
                  // The move that solves the puzzle finishes the play on the server: refresh the lists and celebrate.
                  if (reply.finished) {
                    void client.invalidateQueries({ queryKey: FINISHED_PLAYS_KEY })
                    void client.invalidateQueries({ queryKey: UNFINISHED_PLAYS_KEY })
                    setCongratulating(true)
                  }
                  return reply
                },
                (error: unknown) => {
                  if (error instanceof UnauthorizedError) toSignIn()
                  throw error
                },
              ),
          }
        : undefined,
    [playId, playState.data, finished, states, at, toSignIn, client],
  )
  const unauthorized = playState.error instanceof UnauthorizedError || history.error instanceof UnauthorizedError
  useEffect(() => {
    if (unauthorized) toSignIn()
  }, [unauthorized, toSignIn])
  const template = useTemplate<Partial<JigsawTemplateParams>>(game.data?.templateId ?? null)
  const image = useImage(game.data?.imageId ?? null)
  if (game.isError) return <p role="alert" className="p-4">Could not load this puzzle: {game.error.message}</p>
  if (image.isError) return <p role="alert" className="p-4">Could not load this puzzle's picture: {image.error.message}</p>
  if (unauthorized) return <p className="p-4">Your session has expired. Redirecting to sign in…</p>
  if (playState.isError) return <p role="alert" className="p-4">Could not load this play: {playState.error.message}</p>
  const g = game.data
  if (history.isError && !unauthorized) return <p role="alert" className="p-4">Could not load this play's history: {history.error.message}</p>
  if (playId !== null && !play) return <p className="p-4">Loading…</p>
  if (!g || template.data?.id !== g.templateId || (g.imageId !== null && !image.data)) return <p className="p-4">Loading…</p>
  const settings = { ...normalizeSetup(g.config).config, type: g.parent as GameConfig['type'] }
  const params = { ...DEFAULT_JIGSAW_PARAMS, ...template.data.content }
  const photo = image.data?.url
  // The server's state decides which game runs: a tray play is always the panel game, whatever the page asked for.
  const mode: Mode = play
    ? play.state.type === 'scrambled' ? 'scrambled' : 'next-pieces'
    : requested === 'next-pieces' || requested === 'scrambled' ? requested : settings.type === 'next-pieces' ? 'next-pieces' : 'scrambled'
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Board key={`${id}-${mode}`} settings={settings} template={params} photo={photo} mode={mode} play={play} />
      </div>
      {play?.replay && states && <HistoryScroller count={states.length} step={at} onStep={setStep} />}
      {congratulating && <Congratulations gameId={id} name={g.name} onClose={() => setCongratulating(false)} />}
    </div>
  )
}

/** A scroller under a finished play's board: the start is the first stop and each stop after it applies the next change. */
function HistoryScroller({ count, step, onStep }: { count: number; step: number; onStep: (step: number) => void }) {
  const last = count - 1
  const go = (to: number) => onStep(Math.max(0, Math.min(last, to)))
  const button = 'h-8 w-8 shrink-0 rounded text-sm font-medium hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent'
  return (
    <div role="group" aria-label="History scroller" className="flex items-center gap-2 border-t border-slate-200 bg-slate-100 px-4 py-2 text-sm">
      <button className={button} aria-label="Start" disabled={step === 0} onClick={() => go(0)}>⏮</button>
      <button className={button} aria-label="Previous step" disabled={step === 0} onClick={() => go(step - 1)}>◀</button>
      <input
        type="range"
        aria-label="History step"
        className="min-w-0 flex-1"
        min={0}
        max={last}
        step={1}
        value={step}
        onChange={(e) => go(Number(e.target.value))}
      />
      <button className={button} aria-label="Next step" disabled={step === last} onClick={() => go(step + 1)}>▶</button>
      <button className={button} aria-label="End" disabled={step === last} onClick={() => go(last)}>⏭</button>
      <span className="w-24 shrink-0 text-right tabular-nums text-slate-600">{step === 0 ? 'Start' : `Step ${step} of ${last}`}</span>
    </div>
  )
}

/** Shown when a move finishes the puzzle. */
function Congratulations({ gameId, name, onClose }: { gameId: number; name?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Puzzle complete"
        className="w-full max-w-sm rounded-lg bg-white p-6 text-center text-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl" aria-hidden>🎉</div>
        <h2 className="mt-2 text-xl font-semibold">Congratulations!</h2>
        <p className="mt-1 text-sm text-slate-600">You finished{name ? ` ${name}` : ' the puzzle'}. It's saved in your history.</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link to="/profile" className={`${primaryButton} text-center`}>View history</Link>
          <Link to={`/reviews?game=${gameId}`} className="flex h-9 items-center justify-center rounded text-sm font-medium hover:bg-slate-100">Review this puzzle</Link>
          <Link to="/puzzles" className="flex h-9 items-center justify-center rounded text-sm font-medium hover:bg-slate-100">More puzzles</Link>
          <button className="h-9 rounded text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/** A catalog puzzle: its picture, template and game settings, with its reviews underneath. */
function CatalogPlayer({ puzzle, mode }: { puzzle: Puzzle; mode: Mode }) {
  const average = averageRating(puzzle)
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Board settings={puzzle.settings} template={templateParams(puzzle.template.size, puzzle.template.style)} photo={puzzle.image.location} mode={mode} />
      </div>
      <details className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-sm">
        <summary className="cursor-pointer font-medium">
          Reviews ({puzzle.reviews.length}){average !== null && ` · ★ ${average.toFixed(1)}`}
        </summary>
        <ul className="mt-2 flex flex-col gap-1">
          {puzzle.reviews.map((r, i) => (
            <li key={i}>
              <span aria-label={`${r.rating} stars`} className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> {r.comment}
            </li>
          ))}
          {puzzle.reviews.length === 0 && <li className="text-slate-500">No reviews yet.</li>}
        </ul>
      </details>
    </div>
  )
}

type Mode = 'scrambled' | 'next-pieces'

/** The playable board for a template, a picture and game settings. */
function Board({ settings, template, photo, mode, play }: { settings: GameConfig; template: Partial<JigsawTemplateParams>; photo?: string; mode: Mode; play?: PlayHandle }) {
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(new JigsawTemplateGenerator(template).generate()), [template])
  const cols = template.cols!
  const rows = template.rows!
  const spec: PuzzleSpec = { cols, rows, seed: template.seed! + settings.seed }
  return mode === 'next-pieces' ? (
    <NextPiecesGame spec={spec} jigsaw={jigsaw} photo={photo} config={{ ...settings, type: 'next-pieces' }} play={play} />
  ) : (
    <Game
      spec={spec}
      jigsaw={jigsaw}
      photo={photo}
      showGuide
      zoomOrientation={settings.zoomOrientation}
      freeBuild={settings.freeBuild}
      play={play}
      scatter={{
        cell: { width: template.width! / cols, height: template.height! / rows },
        viewPercent: settings.viewPercent,
        side: settings.startSide,
        spread: settings.spread,
        count: settings.looseCount > 0 ? settings.looseCount : undefined,
      }}
    />
  )
}

export function Game({
  spec,
  scatter,
  jigsaw,
  photo,
  showGuide = false,
  outline = 'solid',
  outlineScale = 1,
  borders = DEFAULT_PIECE_BORDERS,
  effects = DEFAULT_EFFECTS,
  zoomOrientation,
  freeBuild = false,
  play,
}: {
  spec: PuzzleSpec
  scatter?: ScatterOptions
  /** Custom template outlines; defaults to a plain grid built from `spec`. */
  jigsaw?: JigsawVector
  /** Picture clipped into each piece; pieces are flat colours without it. */
  photo?: string
  showGuide?: boolean
  /** Draw the template's piece outlines on the board as a placement hint. */
  outline?: 'none' | 'solid' | 'dotted'
  /** Multiplier on the outline width (thin 0.5, medium 1, thick 2). */
  outlineScale?: number
  /** Border looks for loose (moving) and home (set) pieces. */
  borders?: PieceBorders
  effects?: PieceEffects
  zoomOrientation?: ZoomOrientation
  /** Pieces join each other anywhere on the board and joined pieces drag together. */
  freeBuild?: boolean
  /** A server-owned play: the pieces start where its state puts them and each drop is sent to the server, which answers with the new positions. */
  play?: PlayHandle
}) {
  const viewOnly = useViewOnly()
  const puzzle = useMemo(() => jigsaw ?? buildPuzzle(spec), [jigsaw, spec])
  const served = play?.state.pieces ? play : undefined
  // The server lays pieces out in 100-unit cells; the board draws them in the template's cell size.
  const scale = useMemo(() => ({ x: (scatter?.cell?.width ?? PIECE_SIZE) / PIECE_SIZE, y: (scatter?.cell?.height ?? PIECE_SIZE) / PIECE_SIZE }), [scatter?.cell?.width, scatter?.cell?.height])
  const fromServer = useCallback((state: PlayState): Offset[] => state.matrix.flat().map((guid) => ({ x: (state.pieces?.[guid]?.x ?? 0) * scale.x, y: (state.pieces?.[guid]?.y ?? 0) * scale.y })), [scale])
  const free = served ? served.state.freeBuild !== false : freeBuild
  const busy = useRef(false)
  const [problem, setProblem] = useState<string | null>(null)
  const paths = useMemo(() => puzzle.pieces.map((p) => toSvgPath(p.vector)), [puzzle])
  const [offsets, setOffsets] = useState<Offset[]>(() => (served ? fromServer(served.state) : scatterOffsets(spec, scatter)))
  // Shape of the window the board sits in, so loose pieces can use all of it.
  const [aspect, setAspect] = useState<number>()
  // A served play never re-scatters: the server already placed the pieces.
  const touched = useRef(Boolean(served))
  // Pieces drawn last are on top; dragging brings a piece to the front.
  const [order, setOrder] = useState(() => puzzle.pieces.map((_, i) => i))
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ index: number; group: number[]; last: Offset; pos: Offset; start: Offset[] } | null>(null)
  /** The piece being dragged while it is within snapping distance of its slot. */
  const [near, setNear] = useState<number | null>(null)

  // A replay follows the state it is given: stepping through the history swaps the layout without remounting the board.
  const replay = play?.replay ? play.state : undefined
  useEffect(() => {
    if (replay) setOffsets(fromServer(replay))
  }, [replay, fromServer])

  const homes = useMemo(() => offsets.map((o) => o.x === 0 && o.y === 0), [offsets])
  const flash = useFlash(homes)

  // Snap distance follows the piece size, so small pieces of big puzzles don't snap from afar.
  const snapTolerance = scatter?.cell ? Math.min(scatter.cell.width, scatter.cell.height) * 0.25 : undefined
  const margin = viewMargins(spec, scatter?.viewPercent, scatter?.cell, aspect)
  const { minX, minY } = puzzle.bounds
  const viewBox = `${minX - margin.x} ${minY - margin.y} ${puzzle.width + margin.x * 2} ${puzzle.height + margin.y * 2}`

  // Solid outline about a pixel wide whatever the grid size (dashes turn to noise on big grids).
  const pixel = Math.max(2, (puzzle.width + margin.x * 2) / 800)
  const outlineWidth = pixel * outlineScale

  const z = useZoom((puzzle.width + margin.x * 2) / (puzzle.height + margin.y * 2))

  // Measure the frame before paint, and re-scatter to fill it until the player moves a piece.
  const frame = z.frameRef
  const latest = useRef({ aspect, spec, scatter })
  latest.current = { aspect, spec, scatter }
  useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const fill = () => {
      const { aspect: prev, spec, scatter } = latest.current
      if (touched.current || el.clientWidth <= 0 || el.clientHeight <= 0) return
      const next = el.clientWidth / el.clientHeight
      if (prev !== undefined && Math.abs(next - prev) / prev < 0.05) return
      setAspect(next)
      setOffsets(scatterOffsets(spec, { ...scatter, aspect: next }))
    }
    fill()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fill)
    observer.observe(el)
    return () => observer.disconnect()
  }, [frame])

  const toPuzzle = (e: React.PointerEvent): Offset => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const m = svg.getScreenCTM()
    if (!m) return { x: e.clientX, y: e.clientY }
    const p = pt.matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  const onDown = (index: number) => (e: React.PointerEvent) => {
    if (play?.replay || viewOnly) return
    if (offsets[index].x === 0 && offsets[index].y === 0) return
    if (busy.current) return // one move at a time: wait for the server's answer to the last drop
    touched.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const group = free ? connectedPieces(offsets, spec.cols, index) : [index]
    drag.current = { index, group, last: toPuzzle(e), pos: offsets[index], start: offsets }
    setOrder((o) => [...o.filter((i) => !group.includes(i)), ...group])
  }

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const now = toPuzzle(e)
    const dx = now.x - d.last.x
    const dy = now.y - d.last.y
    d.last = now
    d.pos = { x: d.pos.x + dx, y: d.pos.y + dy }
    setNear(snapPiece(d.pos, snapTolerance).snapped ? d.index : null)
    setOffsets((os) => os.map((o, i) => (d.group.includes(i) ? { x: o.x + dx, y: o.y + dy } : o)))
  }

  const onUp = () => {
    const d = drag.current
    drag.current = null
    setNear(null)
    if (!d) return
    if (served) {
      // The server decides: it snaps, joins or refuses, and its answer replaces what the player sees.
      const at = d.start[d.index]
      if (d.pos.x === at.x && d.pos.y === at.y) return
      busy.current = true
      setProblem(null)
      served
        .send({ type: 'move', piece: served.state.matrix.flat()[d.index], x: d.pos.x / scale.x, y: d.pos.y / scale.y })
        .then((r) => setOffsets(fromServer(r.state)))
        .catch((error: Error) => {
          setOffsets(d.start)
          setProblem(error.message)
        })
        .finally(() => {
          busy.current = false
        })
      return
    }
    setOffsets((os) =>
      free ? settleGroup(os, spec.cols, d.group, snapTolerance) : os.map((o, i) => (i === d.index ? snapPiece(o, snapTolerance).offset : o)),
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 bg-slate-50">
      <div ref={z.frameRef} {...z.frameProps} className="flex min-h-0 min-w-0 flex-1 overflow-auto">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={z.svgStyle}
          className="m-auto h-full w-full touch-none select-none"
          role="img"
          aria-label="Puzzle board"
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {outline !== 'none' && (
            <g fill="none" stroke="#94a3b8" strokeWidth={outlineWidth}
              strokeDasharray={outline === 'dotted' ? `${outlineWidth * 4} ${outlineWidth * 3}` : undefined} pointerEvents="none" data-testid="outline">
              {paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          )}
          {near !== null && effects.near.highlightTemplate && (
            <path d={paths[near]} fill={`${NEAR_COLOR}55`} stroke={NEAR_COLOR} strokeWidth={outlineWidth * 2} strokeLinejoin="round" pointerEvents="none" data-testid="template-highlight" />
          )}
          <defs>
            {photo &&
              paths.map((d, i) => (
                <clipPath key={i} id={`scatter-clip-${i}`}>
                  <path d={d} />
                </clipPath>
              ))}
          </defs>
          {photo && showGuide && (
            <image
              href={photo}
              x={minX}
              y={minY}
              width={puzzle.width}
              height={puzzle.height}
              preserveAspectRatio="xMidYMid slice"
              opacity={0.18}
            />
          )}
          {order.map((i) => {
            const { row, col } = puzzle.pieces[i]
            const o = offsets[i]
            const home = o.x === 0 && o.y === 0
            return (
              <g
                key={i}
                data-testid={`piece-${i}`}
                transform={`translate(${o.x} ${o.y})`}
                className={home ? '' : 'cursor-grab'}
                data-nopan={home ? undefined : ''}
                onPointerDown={onDown(i)}
              >
                <g className={effectClass(i, home, effects, puzzle.pieces, near, flash)}>
                <path
                  d={paths[i]}
                  fill={photo ? '#ffffff' : `hsl(${(row * 40 + col * 25) % 360} 85% 80%)`}
                  stroke={photo ? 'none' : near === i && effects.near.border ? NEAR_COLOR : borders.template.color}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                {photo && (
                  <>
                    <image
                      href={photo}
                      x={minX}
                      y={minY}
                      width={puzzle.width}
                      height={puzzle.height}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#scatter-clip-${i})`}
                    />
                    <PieceBorderPath d={paths[i]} border={home ? borders.set : near === i && effects.near.border ? { ...borders.moving, width: 'thick' } : borders.moving} unit={pixel / 2} color={home ? borders.set.color + SET_ALPHA : near === i && effects.near.border ? NEAR_COLOR : borders.moving.color} />
                  </>
                )}
                </g>
              </g>
            )
          })}
          <g className="fx-sparkle">
            {flash !== null &&
              sparklePieces(effects, puzzle.pieces, homes, flash).map((i) => (
                <PieceSparkles key={`${flash}-${i}`} bounds={puzzle.pieces[i].vector.bounds} d={paths[i]} />
              ))}
          </g>
        </svg>
      </div>
      {problem && <p role="alert" className="absolute left-2 top-2 rounded bg-white/90 px-2 py-1 text-sm text-red-700">{problem}</p>}
      <ZoomControls z={z} orientation={zoomOrientation} preview={photo ? { photo, svg: svgRef, box: { x: minX, y: minY, width: puzzle.width, height: puzzle.height } } : undefined} />
      </div>
    </div>
  )
}
