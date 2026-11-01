import { useCallback, useState } from 'react'

export type BrowseLayout = 'classic' | 'netflix'
export type SidebarSide = 'left' | 'right'
export type IconSize = 'small' | 'medium' | 'large'

export const LAYOUTS: { id: BrowseLayout; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'netflix', label: 'Netflix' },
]
export const SIDES: { id: SidebarSide; label: string }[] = [
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
]
export const ICON_SIZES: { id: IconSize; label: string }[] = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
]

/** Grid column minimum, image height and row card width for each icon size. */
export const ICON_DIMENSIONS: Record<IconSize, { min: string; image: string; card: string }> = {
  small: { min: '9rem', image: 'h-24', card: 'w-36' },
  medium: { min: '14rem', image: 'h-40', card: 'w-56' },
  large: { min: '20rem', image: 'h-56', card: 'w-80' },
}

export type BrowsePrefs = {
  layout: BrowseLayout
  side: SidebarSide
  iconSize: IconSize
  /** Category ids shown as rows in the Netflix layout; empty means all top-level categories. */
  rows: string[]
}

const KEY = 'jiggy.browse.prefs'
const DEFAULTS: BrowsePrefs = { layout: 'classic', side: 'left', iconSize: 'medium', rows: [] }

const pick = <T extends string>(options: { id: T }[], v: unknown, fallback: T): T =>
  options.some((o) => o.id === v) ? (v as T) : fallback

export function parsePrefs(text: string | null): BrowsePrefs {
  if (!text) return DEFAULTS
  try {
    const raw = JSON.parse(text) as Partial<Record<keyof BrowsePrefs, unknown>>
    return {
      layout: pick(LAYOUTS, raw.layout, DEFAULTS.layout),
      side: pick(SIDES, raw.side, DEFAULTS.side),
      iconSize: pick(ICON_SIZES, raw.iconSize, DEFAULTS.iconSize),
      rows: Array.isArray(raw.rows) ? raw.rows.filter((r): r is string => typeof r === 'string') : [],
    }
  } catch {
    return DEFAULTS
  }
}

function load(): BrowsePrefs {
  try {
    return parsePrefs(localStorage.getItem(KEY))
  } catch {
    return DEFAULTS
  }
}

export function useBrowsePrefs() {
  const [prefs, setPrefs] = useState(load)
  const update = useCallback((patch: Partial<BrowsePrefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // storage unavailable; the choice still applies for this session
      }
      return next
    })
  }, [])
  return [prefs, update] as const
}
