import { useState } from 'react'
import { GAME_TYPES, type GameConfig } from '@jiggy/shared'
import { GAME_PHOTOS, GAME_TEMPLATES } from './gameAssets'
import { NumberField, Panel, field, input, primaryButton } from './controls'

type Props = {
  templateId: string
  onTemplate: (id: string) => void
  photoId: string
  uploadName: string | null
  onPhoto: (id: string) => void
  onUpload: (file: File) => void
  config: GameConfig
  onConfig: (config: GameConfig) => void
  showGuide: boolean
  onShowGuide: (show: boolean) => void
  pieceCount: number
  onRestart: () => void
}

const heading = 'text-sm font-semibold uppercase tracking-wide text-slate-500'

function choice(active: boolean) {
  return `rounded border px-2 py-1 text-left text-sm ${
    active ? 'border-amber-500 bg-amber-50 font-medium text-amber-800' : 'border-slate-300 bg-white hover:bg-slate-100'
  }`
}

export function GamePanel(p: Props) {
  const { config, onConfig } = p
  const [open, setOpen] = useState(false)
  const type = GAME_TYPES.find((t) => t.id === config.type)!
  const set = (patch: Partial<GameConfig>) => onConfig({ ...config, ...patch })

  return (
    <Panel>
      <section className="flex flex-col gap-1.5" aria-label="Template">
        <h3 className={heading}>1. Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {GAME_TEMPLATES.map((t) => (
            <button key={t.id} className={choice(t.id === p.templateId)} aria-pressed={t.id === p.templateId} onClick={() => p.onTemplate(t.id)}>
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-1.5" aria-label="Background photo">
        <h3 className={heading}>2. Background photo</h3>
        <div className="grid grid-cols-2 gap-2">
          {GAME_PHOTOS.map((ph) => (
            <button key={ph.id} aria-label={ph.name} aria-pressed={ph.id === p.photoId} className={`overflow-hidden rounded border-2 ${ph.id === p.photoId ? 'border-amber-500' : 'border-transparent'}`} onClick={() => p.onPhoto(ph.id)}>
              <img src={ph.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
        <label className={field}>
          Upload your own{p.uploadName && <span className="text-slate-500"> — {p.uploadName}</span>}
          <input type="file" accept="image/*" className="text-sm" onChange={(e) => e.target.files?.[0] && p.onUpload(e.target.files[0])} />
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
            {config.type === 'scrambled' && <p className="text-sm text-slate-500">No extra settings; use Reshuffle for a new order.</p>}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.showGuide} onChange={(e) => p.onShowGuide(e.target.checked)} />
              Show faint guide image
            </label>
            <button className={`self-end ${primaryButton}`} autoFocus onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </Panel>
  )
}
