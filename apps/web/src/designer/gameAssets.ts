import { CATALOG, JIGSAW_PRESETS, type JigsawTemplateParams } from '@jiggy/shared'
import type { ImageEdits } from './imageFilters'

const styleRanges = (name: string) => JIGSAW_PRESETS.find((p) => p.name === name)!.ranges

/** Piece-count options; cols × rows is the exact grid, so the count is exact. */
export const TEMPLATE_SIZES: { id: string; cols: number; rows: number }[] = [
  [6, 3, 2], [12, 4, 3], [20, 5, 4], [48, 8, 6], [100, 10, 10], [200, 20, 10], [300, 20, 15],
  [500, 25, 20], [1000, 40, 25], [1500, 50, 30], [2000, 50, 40],
].map(([count, cols, rows]) => ({ id: String(count), cols, rows }))

/** Shape variations applied to any size. */
export const TEMPLATE_STYLES: { id: string; name: string; ranges?: ReturnType<typeof styleRanges> }[] = [
  { id: 'subtle', name: 'Classic (subtle)' },
  { id: 'varied', name: 'Varied (irregular tabs)', ranges: styleRanges('Varied') },
]

export const DEFAULT_TEMPLATE = { size: '12', style: 'subtle' }

export function templateParams(size: string, style: string): Partial<JigsawTemplateParams> {
  const s = TEMPLATE_SIZES.find((t) => t.id === size) ?? TEMPLATE_SIZES[1]
  const st = TEMPLATE_STYLES.find((t) => t.id === style)
  // Keep pieces a sensible on-screen size: big puzzles use smaller cells.
  const cell = s.cols * s.rows > 48 ? 100 : 200
  return { cols: s.cols, rows: s.rows, width: s.cols * cell, height: s.rows * cell, seed: s.cols + s.rows, ...st?.ranges }
}

const scene = (sky: [string, string], ground: string, sun: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="600" cy="170" r="70" fill="${sun}"/>
      <path d="M0 420 Q150 300 300 400 T600 380 T800 400 V600 H0Z" fill="${ground}"/>
      <path d="M0 500 Q200 430 400 500 T800 480 V600 H0Z" fill="#00000033"/>
    </svg>`,
  )}`

/** Where a game image came from; only user images can be renamed, replaced or deleted. */
export type ImageSource = 'builtin' | 'catalog' | 'user'

/** One background picture, whatever its origin. `location` is the untouched original (a URL path or data URL); `edits` are applied on top when it is drawn. */
export type GameImage = { id: string; name: string; location: string; source: ImageSource; edits?: ImageEdits }

/** Every picture the puzzle catalog offers, so games can use the same photos. */
const CATALOG_IMAGES: GameImage[] = CATALOG.puzzles.map((p) => ({
  id: `catalog-${p.id}`,
  name: p.image.name,
  location: p.image.location,
  source: 'catalog',
}))

export const GAME_PHOTOS: GameImage[] = [
  { id: 'sunset', name: 'Sunset', location: scene(['#fb923c', '#fde68a'], '#7c2d12', '#fef08a'), source: 'builtin' },
  { id: 'forest', name: 'Forest', location: scene(['#7dd3fc', '#dcfce7'], '#166534', '#fffbeb'), source: 'builtin' },
  { id: 'night', name: 'Night', location: scene(['#1e1b4b', '#6366f1'], '#0f172a', '#e0e7ff'), source: 'builtin' },
  ...CATALOG_IMAGES,
]
