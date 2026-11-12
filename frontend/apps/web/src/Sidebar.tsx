import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BACKGROUNDS,
  MODES,
  PALETTES,
  applyBackground,
  applyMode,
  applyPalette,
  loadBackground,
  loadMode,
  loadPalette,
} from './theme'

const LINKS = [
  { to: '/puzzles', label: 'Puzzles', short: 'E' },
  { to: '/designer', label: 'Designer', short: 'D' },
]

const STORAGE_KEY = 'jiggy.sidebar.collapsed'

function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const MOBILE_QUERY = '(max-width: 767px)'

function useIsMobile() {
  const query = typeof matchMedia === 'function' ? matchMedia(MOBILE_QUERY) : null
  const [mobile, setMobile] = useState(query?.matches ?? false)
  useEffect(() => {
    if (!query) return
    const onChange = () => setMobile(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [query])
  return mobile
}

export default function Sidebar() {
  const [collapsedPref, setCollapsed] = useState(loadCollapsed)
  const mobile = useIsMobile()
  // On phones the nav is a bottom bar: full labels, compact theme buttons.
  const collapsed = collapsedPref
  const compact = collapsed || mobile

  const [mode, setMode] = useState(loadMode)
  const [palette, setPalette] = useState(loadPalette)

  const chooseMode = (m: (typeof MODES)[number]['id']) => {
    setMode(m)
    applyMode(m)
  }
  const choosePalette = (id: string) => {
    setPalette(id)
    applyPalette(id)
  }
  const [background, setBackground] = useState(loadBackground)
  const [colorsOpen, setColorsOpen] = useState(false)
  const chooseBackground = (id: string) => {
    setBackground(id)
    applyBackground(id)
  }
  const cycle = <T,>(items: T[], current: number) => items[(current + 1) % items.length]

  const toggle = () => {
    setCollapsed(!collapsedPref)
    try {
      localStorage.setItem(STORAGE_KEY, collapsedPref ? '0' : '1')
    } catch {
      // storage unavailable; the toggle still works for this session
    }
  }

  return (
    <nav
      aria-label="Main"
      className={`flex shrink-0 gap-1 bg-slate-100 p-2 text-slate-800 max-md:items-center max-md:justify-between md:flex-col md:transition-[width] ${
        collapsed ? 'md:w-14' : 'md:w-56'
      }`}
    >
      <button
        aria-label="Toggle sidebar"
        aria-expanded={!collapsed}
        className="mb-2 flex h-9 max-md:hidden items-center justify-center rounded text-lg hover:bg-slate-200"
        onClick={toggle}
      >
        {collapsed ? '»' : '«'}
      </button>
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          title={l.label}
          aria-label={l.label}
          className={({ isActive }) =>
            `flex h-9 items-center rounded px-3 text-sm font-medium max-md:flex-1 max-md:justify-center ${
              collapsed ? 'md:justify-center md:px-0' : ''
            } ${isActive ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-[#0f172a]' : 'hover:bg-slate-200'}`
          }
        >
          {collapsed ? (
            <>
              <span className="md:hidden">{l.label}</span>
              <span className="max-md:hidden">{l.short}</span>
            </>
          ) : (
            l.label
          )}
        </NavLink>
      ))}
      <div className="flex gap-2 max-md:items-center md:mt-auto md:flex-col md:pt-2">
        {compact ? (
          <>
            <button
              aria-label={`Color mode: ${mode}`}
              title={`Color mode: ${mode} (click to change)`}
              className="flex h-9 w-9 items-center justify-center rounded text-sm font-medium hover:bg-slate-200 md:w-auto"
              onClick={() => chooseMode(cycle(MODES, MODES.findIndex((m) => m.id === mode)).id)}
            >
              {mode === 'light' ? '☀' : mode === 'dark' ? '☾' : 'A'}
            </button>
            <button
              aria-label="Colors"
              title="Colors"
              className="flex h-9 w-9 items-center justify-center rounded hover:bg-slate-200 md:w-auto"
              onClick={() => setColorsOpen(true)}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: PALETTES.find((p) => p.id === palette)?.swatch }}
              />
            </button>
          </>
        ) : (
          <>
            <div role="group" aria-label="Color mode" className="flex rounded bg-slate-200 p-0.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  aria-pressed={mode === m.id}
                  className={`h-7 flex-1 rounded text-xs font-medium ${
                    mode === m.id ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-300'
                  }`}
                  onClick={() => chooseMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              className="flex h-8 items-center justify-center gap-2 rounded bg-slate-200 text-xs font-medium hover:bg-slate-300"
              onClick={() => setColorsOpen(true)}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: PALETTES.find((p) => p.id === palette)?.swatch }}
              />
              Colors…
            </button>
          </>
        )}
      </div>
      {colorsOpen && (
        <ColorsDialog
          palette={palette}
          background={background}
          onPalette={choosePalette}
          onBackground={chooseBackground}
          onClose={() => setColorsOpen(false)}
        />
      )}
    </nav>
  )
}

function ColorsDialog(props: {
  palette: string
  background: string
  onPalette: (id: string) => void
  onBackground: (id: string) => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props])
  const dark = document.documentElement.dataset.theme === 'dark'
  const ring = (on: boolean) => (on ? 'ring-2 ring-amber-500 ring-offset-2' : 'ring-1 ring-slate-300 hover:ring-slate-400')
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={props.onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Colors"
        className="w-full max-w-sm rounded-lg bg-white p-5 text-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold">Colors</h2>
        <div role="group" aria-label="Foreground color" className="mb-4">
          <div className="mb-2 text-sm font-medium">Foreground</div>
          <div className="flex flex-wrap gap-3">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                aria-label={`${p.label} palette`}
                aria-pressed={props.palette === p.id}
                title={p.label}
                style={{ background: p.swatch }}
                className={`h-8 w-8 rounded-full ring-offset-white ${ring(props.palette === p.id)}`}
                onClick={() => props.onPalette(p.id)}
              />
            ))}
          </div>
        </div>
        <div role="group" aria-label="Background color" className="mb-5">
          <div className="mb-2 text-sm font-medium">Background</div>
          <div className="flex flex-wrap gap-3">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                aria-label={`${b.label} background`}
                aria-pressed={props.background === b.id}
                title={b.label}
                style={{ background: dark ? b.swatchDark : b.swatch }}
                className={`h-8 w-8 rounded-full ring-offset-white ${ring(props.background === b.id)}`}
                onClick={() => props.onBackground(b.id)}
              />
            ))}
          </div>
        </div>
        <button
          className="h-9 w-full rounded bg-amber-500 text-sm font-medium text-slate-900 hover:bg-amber-600"
          onClick={props.onClose}
        >
          Done
        </button>
      </div>
    </div>
  )
}
