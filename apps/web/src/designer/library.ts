import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_GAME_CONFIG, type GameConfig } from '@jiggy/shared'
import { DEFAULT_EFFECTS, type PieceEffects } from './effects'
import type { ImageEdits } from './imageFilters'
import { DEFAULT_PIECE_BORDERS, type PieceBorders } from './controls'

type Named = { id: string; name: string }

/** A named piece count and piece style. */
export type SavedTemplate = Named & { size: string; style: string }

/** A named background photo the user added. */
export type SavedImage = Named & { location: string; edits?: ImageEdits }

/** Everything the Game tab can set, under a name. */
export type SavedGame = Named & {
  templateSize: string
  templateStyle: string
  photoId: string
  config: GameConfig
  showGuide: boolean
  borders: PieceBorders
  effects: PieceEffects
}

export type Library = { templates: SavedTemplate[]; images: SavedImage[]; games: SavedGame[] }

export const EMPTY_LIBRARY: Library = { templates: [], images: [], games: [] }

const STORAGE_KEY = 'jiggy.designer.library'

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export const addItem = <T extends Named>(items: T[], item: T): T[] => [...items, item]
export const updateItem = <T extends Named>(items: T[], id: string, patch: Partial<Omit<T, 'id'>>): T[] =>
  items.map((i) => (i.id === id ? { ...i, ...patch } : i))
export const removeItem = <T extends Named>(items: T[], id: string): T[] => items.filter((i) => i.id !== id)

/** Games saved by an older build may lack newer settings, so fill them from the defaults. */
function normalizeGame(g: SavedGame): SavedGame {
  return {
    ...g,
    config: { ...DEFAULT_GAME_CONFIG, ...g.config },
    borders: { ...DEFAULT_PIECE_BORDERS, ...g.borders },
    effects: {
      near: { ...DEFAULT_EFFECTS.near, ...g.effects?.near },
      placed: { ...DEFAULT_EFFECTS.placed, ...g.effects?.placed },
    },
  }
}

const isNamed = (x: unknown): x is Named =>
  typeof x === 'object' && x !== null && typeof (x as Named).id === 'string' && typeof (x as Named).name === 'string'

export function parseLibrary(text: string | null): Library {
  if (!text) return EMPTY_LIBRARY
  try {
    const raw = JSON.parse(text) as Partial<Record<keyof Library, unknown>>
    const list = (v: unknown) => (Array.isArray(v) ? v.filter(isNamed) : [])
    return {
      templates: list(raw.templates) as SavedTemplate[],
      // Images saved by an older build kept their data URL in `src`.
      images: (list(raw.images) as (SavedImage & { src?: string })[]).map(({ src, ...i }) => ({ ...i, location: i.location ?? src ?? '' })),
      games: (list(raw.games) as SavedGame[]).map(normalizeGame),
    }
  } catch {
    return EMPTY_LIBRARY
  }
}

function load(): Library {
  try {
    return parseLibrary(localStorage.getItem(STORAGE_KEY))
  } catch {
    return EMPTY_LIBRARY
  }
}

/** The saved games, templates and images, kept in this browser's local storage. */
export function useLibrary() {
  const [library, setLibraryState] = useState<Library>(load)
  const [error, setError] = useState<string | null>(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
      setError(null)
    } catch {
      setError('Could not save to this browser — storage is full or unavailable.')
    }
  }, [library])

  const setLibrary = useCallback((update: (l: Library) => Library) => setLibraryState(update), [])
  return { library, setLibrary, error }
}

/** Reads an image file as a data URL, exactly as the file is. */
export function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}
