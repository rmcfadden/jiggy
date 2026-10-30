import { useState } from 'react'
import { GAME_TYPES, START_SIDES, type GameConfig, type JigsawVector } from '@jiggy/shared'
import type { PieceEffects } from './effects'
import { PieceSettings } from './PieceSettings'
import { TEMPLATE_SIZES, TEMPLATE_STYLES } from './gameAssets'
import { SavedItems, type SavedItemsProps } from './SavedItems'
import { NumberField, Panel, field, input, primaryButton, type PieceBorders } from './controls'

type Props = {
  templateSize: string
  templateStyle: string
  onTemplateSize: (id: string) => void
  onTemplateStyle: (id: string) => void
  photoId: string
  /** Built-in photos first, then the user's saved images. */
  photos: { id: string; name: string; src: string; builtin: boolean }[]
  onPhoto: (id: string) => void
  /** Adds an image file to the library. */
  onUpload: (file: File) => void
  onReplacePhoto: (id: string, file: File) => void
  onRenamePhoto: (id: string, name: string) => void
  onDeletePhoto: (id: string) => void
  games: SavedItemsProps
  templates: SavedItemsProps
  libraryError: string | null
  config: GameConfig
  onConfig: (config: GameConfig) => void
  showGuide: boolean
  onShowGuide: (show: boolean) => void
  jigsaw: JigsawVector
  photo: string
  effects: PieceEffects
  onEffects: (effects: PieceEffects) => void
  borders: PieceBorders
  onBorders: (borders: PieceBorders) => void
  pieceCount: number
  onRestart: () => void
}

const PLACED_EFFECTS: [keyof PieceEffects['placed'], string][] = [
  ['pulse', 'Pulse'],
  ['pulseNeighbors', 'Pulse neighbors'],
  ['glow', 'Glow'],
  ['glowNeighbors', 'Glow neighbors'],
  ['sparkle', 'Sparkle'],
  ['sparkleNeighbors', 'Sparkle neighbors'],
]

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

const heading = 'text-sm font-semibold uppercase tracking-wide text-slate-500'

function choice(active: boolean) {
  return `rounded border px-2 py-1 text-left text-sm ${
    active ? 'border-amber-500 bg-amber-50 font-medium text-amber-800' : 'border-slate-300 bg-white hover:bg-slate-100'
  }`
}

function ImageEditor(props: { name: string; onRename: (name: string) => void; onReplace: (file: File) => void; onDelete: () => void }) {
  const [name, setName] = useState(props.name)
  const [confirming, setConfirming] = useState(false)
  const trimmed = name.trim()
  const small = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white'
  return (
    <div className="flex flex-col gap-1.5 rounded border border-slate-200 bg-white p-2">
      <div className="flex gap-1.5">
        <input className={`${input} min-w-0 flex-1`} aria-label="Image name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className={small} disabled={!trimmed || trimmed === props.name} onClick={() => props.onRename(trimmed)}>
          Rename
        </button>
      </div>
      <label className={field}>
        Replace image
        <input type="file" accept="image/*" className="text-sm" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) props.onReplace(file)
          e.target.value = ''
        }} />
      </label>
      {confirming ? (
        <button className="rounded border border-red-500 bg-red-50 px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-100" onClick={props.onDelete} onBlur={() => setConfirming(false)} autoFocus>
          Confirm delete
        </button>
      ) : (
        <button className={small} onClick={() => setConfirming(true)}>
          Delete image
        </button>
      )}
    </div>
  )
}

export function GamePanel(p: Props) {
  const { config, onConfig } = p
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'general' | 'pieces' | 'effects'>('general')
  const type = GAME_TYPES.find((t) => t.id === config.type)!
  const chosenPhoto = p.photos.find((ph) => ph.id === p.photoId)
  const set = (patch: Partial<GameConfig>) => onConfig({ ...config, ...patch })

  return (
    <Panel>
      {p.libraryError && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 px-2 py-1 text-sm text-red-700">
          {p.libraryError}
        </p>
      )}
      <section className="flex flex-col gap-1.5" aria-label="Games">
        <h3 className={heading}>Games</h3>
        <SavedItems noun="game" {...p.games} />
      </section>

      <section className="flex flex-col gap-1.5" aria-label="Template">
        <h3 className={heading}>1. Template</h3>
        <label className={field}>
          Number of pieces
          <select className={input} value={p.templateSize} onChange={(e) => p.onTemplateSize(e.target.value)}>
            {TEMPLATE_SIZES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} pieces ({t.cols}×{t.rows})
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          Piece style
          <select className={input} value={p.templateStyle} onChange={(e) => p.onTemplateStyle(e.target.value)}>
            {TEMPLATE_STYLES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <SavedItems noun="template" {...p.templates} />
      </section>

      <section className="flex flex-col gap-1.5" aria-label="Background photo">
        <h3 className={heading}>2. Background photo</h3>
        <div className="grid grid-cols-2 gap-2">
          {p.photos.map((ph) => (
            <button key={ph.id} aria-label={ph.name} aria-pressed={ph.id === p.photoId} className={`overflow-hidden rounded border-2 ${ph.id === p.photoId ? 'border-amber-500' : 'border-transparent'}`} onClick={() => p.onPhoto(ph.id)}>
              <img src={ph.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
        {chosenPhoto && !chosenPhoto.builtin && (
          <ImageEditor
            key={chosenPhoto.id}
            name={chosenPhoto.name}
            onRename={(name) => p.onRenamePhoto(chosenPhoto.id, name)}
            onReplace={(file) => p.onReplacePhoto(chosenPhoto.id, file)}
            onDelete={() => p.onDeletePhoto(chosenPhoto.id)}
          />
        )}
        <label className={field}>
          Add an image
          <input type="file" accept="image/*" className="text-sm" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) p.onUpload(file)
            e.target.value = ''
          }} />
        </label>
      </section>

      <section className="flex flex-col gap-1.5" aria-label="Game type">
        <h3 className={heading}>3. Game type</h3>
        {GAME_TYPES.map((t) => (
          <button key={t.id} className={choice(t.id === config.type)} aria-pressed={t.id === config.type} onClick={() => set({ type: t.id })}>
            {t.name}
            {t.id === config.type && <span className="block text-xs font-normal text-slate-500">{t.description}</span>}
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-1.5" aria-label="Game settings">
        <h3 className={heading}>4. Configure</h3>
        <button className="rounded border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium hover:bg-slate-100" onClick={() => setOpen(true)}>
          {type.name} settings…
        </button>
        <button className={primaryButton} onClick={() => set({ seed: config.seed + 1 })}>
          Reshuffle
        </button>
        <button className="rounded border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-100" onClick={p.onRestart}>
          Restart
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${type.name} settings`}
            className="flex w-96 max-w-[90vw] flex-col gap-4 rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          >
            <h3 className="text-lg font-semibold">{type.name}</h3>
            <p className="text-sm text-slate-500">{type.description}</p>
            <div role="tablist" className="flex gap-1 border-b border-slate-200">
              {([['general', 'General'], ['pieces', 'Piece Settings'], ['effects', 'Effects']] as const).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  className={`-mb-px border-b-2 px-3 py-1.5 text-sm ${tab === id ? 'border-amber-500 font-medium text-amber-800' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'general' && (
              <>
            <label className={field}>
              Zoom control
              <select className={input} value={config.zoomOrientation} onChange={(e) => set({ zoomOrientation: e.target.value as GameConfig['zoomOrientation'] })}>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </label>
            {config.type === 'next-pieces' && (
              <>
                <NumberField label="Pieces in panel" min={1} max={p.pieceCount} value={config.panelSize} onChange={(panelSize) => set({ panelSize })} />
                <label className={field}>
                  Piece order
                  <select className={input} value={config.order} onChange={(e) => set({ order: e.target.value as GameConfig['order'] })}>
                    <option value="sequential">Sequential</option>
                    <option value="random">Random</option>
                  </select>
                </label>
                <label className={field}>
                  Piece selector position
                  <select className={input} value={config.panelDock} onChange={(e) => set({ panelDock: e.target.value as GameConfig['panelDock'] })}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </>
            )}
            {config.type === 'last-x' && (
              <NumberField label="Pieces to solve" min={1} max={p.pieceCount} value={config.remaining} onChange={(remaining) => set({ remaining })} />
            )}
            {config.type === 'scrambled' && (
              <>
                <NumberField label="Puzzle size (% of window)" min={20} max={80} value={config.viewPercent} onChange={(viewPercent) => set({ viewPercent })} />
                <label className={field}>
                  Initial pieces location
                  <select className={input} value={config.startSide} onChange={(e) => set({ startSide: e.target.value as GameConfig['startSide'] })}>
                    {START_SIDES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <NumberField label="Piece spread (0-100)" min={0} max={100} value={config.spread} onChange={(spread) => set({ spread })} />
                <label className={field}>
                  Pieces on puzzle
                  <select className={input} value={config.looseCount} onChange={(e) => set({ looseCount: Number(e.target.value) })}>
                    {[0, 10, 20, 25, 50, 100, 250, 500, 1000].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? `All (${p.pieceCount})` : n}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.showGuide} onChange={(e) => p.onShowGuide(e.target.checked)} />
              Show faint guide image
            </label>
              </>
            )}
            {tab === 'effects' && (
              <div className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1 text-sm font-medium">Piece within tolerance of template</legend>
                  <Toggle label="Glow" checked={p.effects.near.glow} onChange={(glow) => p.onEffects({ ...p.effects, near: { ...p.effects.near, glow } })} />
                  <Toggle label="Glow neighbors" checked={p.effects.near.glowNeighbors} onChange={(glowNeighbors) => p.onEffects({ ...p.effects, near: { ...p.effects.near, glowNeighbors } })} />
                  <Toggle label="Border" checked={p.effects.near.border} onChange={(border) => p.onEffects({ ...p.effects, near: { ...p.effects.near, border } })} />
                  <Toggle label="Highlight template" checked={p.effects.near.highlightTemplate} onChange={(highlightTemplate) => p.onEffects({ ...p.effects, near: { ...p.effects.near, highlightTemplate } })} />
                </fieldset>
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1 text-sm font-medium">Piece placed</legend>
                  {PLACED_EFFECTS.map(([key, label]) => (
                    <Toggle key={key} label={label} checked={p.effects.placed[key]} onChange={(v) => p.onEffects({ ...p.effects, placed: { ...p.effects.placed, [key]: v } })} />
                  ))}
                </fieldset>
              </div>
            )}
            {tab === 'pieces' && <PieceSettings jigsaw={p.jigsaw} photo={p.photo} borders={p.borders} onBorders={p.onBorders} />}
            <button className={`self-end ${primaryButton}`} autoFocus onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </Panel>
  )
}
