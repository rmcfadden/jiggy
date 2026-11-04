export type Mode = 'light' | 'dark' | 'auto'

export const MODES: { id: Mode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
]

export const PALETTES = [
  { id: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { id: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { id: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { id: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { id: 'red', label: 'Red', swatch: '#ef4444' },
  { id: 'orange', label: 'Orange', swatch: '#f97316' },
  { id: 'lime', label: 'Lime', swatch: '#84cc16' },
  { id: 'teal', label: 'Teal', swatch: '#14b8a6' },
  { id: 'cyan', label: 'Cyan', swatch: '#06b6d4' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'fuchsia', label: 'Fuchsia', swatch: '#d946ef' },
  { id: 'pink', label: 'Pink', swatch: '#ec4899' },
  { id: 'slate', label: 'Slate', swatch: '#64748b' },
]

/** Page/surface backgrounds; each remaps --color-white (see index.css) and has a dark-mode variant. */
export const BACKGROUNDS = [
  { id: 'default', label: 'Default', swatch: '#ffffff', swatchDark: '#172033' },
  { id: 'warm', label: 'Warm', swatch: '#fffbeb', swatchDark: '#231c14' },
  { id: 'cool', label: 'Cool', swatch: '#eff6ff', swatchDark: '#12202f' },
  { id: 'mint', label: 'Mint', swatch: '#ecfdf5', swatchDark: '#122520' },
  { id: 'gray', label: 'Gray', swatch: '#f1f5f9', swatchDark: '#0b1220' },
  { id: 'rose', label: 'Rose', swatch: '#fff1f2', swatchDark: '#261419' },
  { id: 'lavender', label: 'Lavender', swatch: '#f5f3ff', swatchDark: '#1b1830' },
  { id: 'sky', label: 'Sky', swatch: '#f0f9ff', swatchDark: '#0e2230' },
  { id: 'sand', label: 'Sand', swatch: '#faf5ea', swatchDark: '#221e16' },
  { id: 'peach', label: 'Peach', swatch: '#fff4ed', swatchDark: '#26180f' },
  { id: 'sage', label: 'Sage', swatch: '#f1f5ee', swatchDark: '#171f17' },
  { id: 'lilac', label: 'Lilac', swatch: '#fdf4ff', swatchDark: '#241328' },
  { id: 'black', label: 'Black', swatch: '#e5e7eb', swatchDark: '#000000' },
]

const MODE_KEY = 'jiggy.theme.mode'
const PALETTE_KEY = 'jiggy.theme.palette'
const BG_KEY = 'jiggy.theme.background'

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable; the choice still applies for this session
  }
}

export function loadMode(): Mode {
  const v = read(MODE_KEY)
  return v === 'light' || v === 'dark' ? v : 'auto'
}

export function loadPalette(): string {
  const v = read(PALETTE_KEY)
  return PALETTES.some((p) => p.id === v) ? v! : 'amber'
}

export function loadBackground(): string {
  const v = read(BG_KEY)
  return BACKGROUNDS.some((b) => b.id === v) ? v! : 'default'
}

const systemDark = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null)

function resolve(mode: Mode) {
  if (mode !== 'auto') return mode
  const q = systemDark()
  return q && q.matches ? 'dark' : 'light'
}

export function applyMode(mode: Mode) {
  document.documentElement.dataset.theme = resolve(mode)
  write(MODE_KEY, mode)
}

export function applyPalette(palette: string) {
  document.documentElement.dataset.palette = palette
  write(PALETTE_KEY, palette)
}

export function applyBackground(background: string) {
  document.documentElement.dataset.bg = background
  write(BG_KEY, background)
}

/** Apply the saved theme and follow the system setting while in auto mode. */
export function initTheme() {
  applyMode(loadMode())
  applyPalette(loadPalette())
  applyBackground(loadBackground())
  systemDark()?.addEventListener('change', () => {
    if (loadMode() === 'auto') applyMode('auto')
  })
}
