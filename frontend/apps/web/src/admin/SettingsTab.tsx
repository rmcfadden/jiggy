import { useState, type ReactNode } from 'react'
import {
  BACKGROUNDS,
  MODES,
  PALETTES,
  applyBackground,
  applyMode,
  applyPalette,
  loadBackground,
  loadDefaultBackground,
  loadDefaultPalette,
  loadMode,
  saveDefaultBackground,
  saveDefaultPalette,
  loadPalette,
} from '../theme'
import { ICON_SIZES, LAYOUTS, SIDES, loadDefaults, saveDefaults, type BrowsePrefs } from '../views/browsePrefs'

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded bg-slate-200 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          className={`h-7 rounded px-3 text-xs font-medium ${
            value === o.id ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-300'
          }`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Layout() {
  const [d, setD] = useState(loadDefaults)
  const [fg, setFg] = useState(loadDefaultPalette)
  const [bg, setBg] = useState(loadDefaultBackground)
  const dark = document.documentElement.dataset.theme === 'dark'
  const ring = (on: boolean) =>
    on ? 'ring-2 ring-amber-500 ring-offset-1' : 'ring-1 ring-slate-300 hover:ring-slate-400'
  const set = (patch: Partial<BrowsePrefs>) => {
    const next = { ...d, ...patch }
    setD(next)
    saveDefaults(next)
  }
  return (
    <>
      <Row title="Layout" hint="Default puzzle browsing layout">
        <Choice label="Layout" options={LAYOUTS} value={d.layout} onChange={(layout) => set({ layout })} />
      </Row>
      <Row title="Sidebar" hint="Default side for the Classic layout">
        <Choice label="Sidebar" options={SIDES} value={d.side} onChange={(side) => set({ side })} />
      </Row>
      <Row title="Icons" hint="Default puzzle icon size">
        <Choice label="Icons" options={ICON_SIZES} value={d.iconSize} onChange={(iconSize) => set({ iconSize })} />
      </Row>
      <Row title="Foreground color" hint="Default accent color">
        <div role="group" aria-label="Default foreground color" className="flex max-w-xs flex-wrap gap-2.5 md:justify-end">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              aria-label={`Default ${p.label} foreground`}
              aria-pressed={fg === p.id}
              title={p.label}
              style={{ background: p.swatch }}
              className={`h-7 w-7 rounded-full ring-offset-white ${ring(fg === p.id)}`}
              onClick={() => {
                setFg(p.id)
                saveDefaultPalette(p.id)
              }}
            />
          ))}
        </div>
      </Row>
      <Row title="Background color" hint="Default page and surface tint">
        <div role="group" aria-label="Default background color" className="flex max-w-xs flex-wrap gap-2.5 md:justify-end">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              aria-label={`Default ${b.label} background`}
              aria-pressed={bg === b.id}
              title={b.label}
              style={{ background: dark ? b.swatchDark : b.swatch }}
              className={`h-7 w-7 rounded-full ring-offset-white ${ring(bg === b.id)}`}
              onClick={() => {
                setBg(b.id)
                saveDefaultBackground(b.id)
              }}
            />
          ))}
        </div>
      </Row>
    </>
  )
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 last:border-b-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900">{title}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Appearance() {
  const [mode, setMode] = useState(loadMode)
  const [palette, setPalette] = useState(loadPalette)
  const [background, setBackground] = useState(loadBackground)
  const dark = document.documentElement.dataset.theme === 'dark'
  const ring = (on: boolean) =>
    on ? 'ring-2 ring-amber-500 ring-offset-1' : 'ring-1 ring-slate-300 hover:ring-slate-400'

  return (
    <>
      <Row title="Theme" hint="Light, dark, or follow your device">
        <div role="group" aria-label="Color mode" className="flex rounded bg-slate-200 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              aria-pressed={mode === m.id}
              className={`h-7 rounded px-3 text-xs font-medium ${
                mode === m.id ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-300'
              }`}
              onClick={() => {
                setMode(m.id)
                applyMode(m.id)
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Row>
      <Row title="Accent color" hint="Buttons and highlights">
        <div role="group" aria-label="Foreground color" className="flex max-w-xs flex-wrap gap-2.5 md:justify-end">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              aria-label={`${p.label} palette`}
              aria-pressed={palette === p.id}
              title={p.label}
              style={{ background: p.swatch }}
              className={`h-7 w-7 rounded-full ring-offset-white ${ring(palette === p.id)}`}
              onClick={() => {
                setPalette(p.id)
                applyPalette(p.id)
              }}
            />
          ))}
        </div>
      </Row>
      <Row title="Background color" hint="Page and surface tint">
        <div role="group" aria-label="Background color" className="flex max-w-xs flex-wrap gap-2.5 md:justify-end">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              aria-label={`${b.label} background`}
              aria-pressed={background === b.id}
              title={b.label}
              style={{ background: dark ? b.swatchDark : b.swatch }}
              className={`h-7 w-7 rounded-full ring-offset-white ${ring(background === b.id)}`}
              onClick={() => {
                setBackground(b.id)
                applyBackground(b.id)
              }}
            />
          ))}
        </div>
      </Row>
    </>
  )
}

const SECTIONS = [
  { id: 'layout', label: 'Layout', keywords: 'foreground background color classic gallery sidebar left right icons size small medium large', content: Layout },
  { id: 'appearance', label: 'Appearance', keywords: 'theme dark light mode color accent background', content: Appearance },
] as const

export function SettingsTab() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]['id']>('layout')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const matches = q
    ? SECTIONS.filter((s) => `${s.label} ${s.keywords}`.toLowerCase().includes(q))
    : SECTIONS.filter((s) => s.id === section)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-slate-50">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-medium text-slate-900 max-md:hidden">Settings</h1>
        <input
          type="search"
          aria-label="Search settings"
          placeholder="Search settings"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full max-w-xl flex-1 rounded-full bg-slate-100 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 md:ml-auto md:mr-auto"
        />
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-1 gap-6 p-4 max-md:flex-col">
        <nav aria-label="Settings sections" className="flex shrink-0 gap-1 md:w-52 md:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              aria-current={!q && s.id === section ? 'page' : undefined}
              className={`h-10 rounded-full px-4 text-left text-sm font-medium ${
                !q && s.id === section ? 'bg-amber-100 text-amber-800' : 'text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => {
                setQuery('')
                setSection(s.id)
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 space-y-6">
          {matches.length === 0 && <p className="text-sm text-slate-500">No settings found</p>}
          {matches.map((s) => (
            <section key={s.id} aria-label={s.label}>
              <h2 className="mb-2 px-1 text-sm font-medium text-amber-700">{s.label}</h2>
              <div className="rounded-lg border border-slate-200 bg-white">
                <s.content />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
