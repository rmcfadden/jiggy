import { JIGSAW_PRESETS, type JigsawTemplateParams } from '@jiggy/shared'
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

/** Where a game image lives: on the server (shared, with a `serverId`) or in this browser's library (edited copies and older uploads). */
export type ImageSource = 'server' | 'user'

/** One background picture, whatever its origin. `location` is the untouched original (a URL path or data URL); `edits` are applied on top when it is drawn. */
export type GameImage = { id: string; name: string; location: string; source: ImageSource; serverId?: number; description?: string; edits?: ImageEdits }
