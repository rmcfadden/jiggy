import { createRng } from './rng.ts'
import type { Offset } from './types.ts'

/** Size of one piece cell, in puzzle units (the frontend's `PIECE_SIZE`). */
export const PIECE_SIZE = 100

export type StartSide = 'random' | 'top' | 'left' | 'right' | 'bottom'
export type PuzzleSpec = { cols: number; rows: number; seed: number }
export type ScatterOptions = { side?: StartSide; count?: number; viewPercent?: number; spread?: number }

const DEFAULT_VIEW_PERCENT = 40
const DEFAULT_SPREAD = 30
const cell = { width: PIECE_SIZE, height: PIECE_SIZE }

function viewMargins(spec: PuzzleSpec, viewPercent = DEFAULT_VIEW_PERCENT): Offset {
  const f = Math.min(0.8, Math.max(0.2, viewPercent / 100))
  const w = spec.cols * cell.width
  const h = spec.rows * cell.height
  return { x: Math.max(cell.width * 1.25, (w / f - w) / 2), y: Math.max(cell.height * 1.25, (h / f - h) / 2) }
}

/** Deterministic starting offsets for each piece (row-major), measured from its solved position. */
export function scatterOffsets(spec: PuzzleSpec, options: ScatterOptions = {}): Offset[] {
  const { side = 'random', viewPercent, spread = DEFAULT_SPREAD } = options
  const total = spec.cols * spec.rows
  const count = Math.min(total, Math.max(1, Math.floor(options.count ?? total)))
  const rng = createRng(spec.seed ^ 0x5bd1e995)
  const m = viewMargins(spec, viewPercent)
  const w = spec.cols * cell.width
  const h = spec.rows * cell.height
  const half = Math.max(cell.width, cell.height) / 2
  const between = (lo: number, hi: number) => lo + rng() * (hi - lo)

  const bands: Record<Exclude<StartSide, 'random'>, [number, number, number, number]> = {
    top: [-m.x + half, w + m.x - half, -m.y + half, -half],
    bottom: [-m.x + half, w + m.x - half, h + half, h + m.y - half],
    left: [-m.x + half, -half, -m.y + half, h + m.y - half],
    right: [w + half, w + m.x - half, -m.y + half, h + m.y - half],
  }
  const target = (): Offset => {
    if (side !== 'random') {
      const [x0, x1, y0, y1] = bands[side]
      return { x: between(x0, x1), y: between(y0, y1) }
    }
    for (;;) {
      const x = between(-m.x + half, w + m.x - half)
      const y = between(-m.y + half, h + m.y - half)
      if (x < -half || x > w + half || y < -half || y > h + half) return { x, y }
    }
  }

  const candidates = 1 + Math.round(Math.min(100, Math.max(0, spread)))
  const taken: Offset[] = []
  const spreadTarget = (): Offset => {
    let best = target()
    let bestGap = -1
    for (let c = 0; c < candidates; c++) {
      const t = c === 0 ? best : target()
      const gap = taken.reduce((min, o) => Math.min(min, Math.hypot(o.x - t.x, o.y - t.y)), Infinity)
      if (gap > bestGap) [best, bestGap] = [t, gap]
    }
    taken.push(best)
    return best
  }

  const ids = Array.from({ length: total }, (_, i) => i)
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (total - i))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  const loose = new Set(ids.slice(0, count))

  return Array.from({ length: total }, (_, i) => {
    if (!loose.has(i)) return { x: 0, y: 0 }
    const t = spreadTarget()
    const cx = ((i % spec.cols) + 0.5) * cell.width
    const cy = (Math.floor(i / spec.cols) + 0.5) * cell.height
    return { x: t.x - cx, y: t.y - cy }
  })
}

/** Locks a piece onto its solved position (offset 0,0) when dropped close enough. */
export function snapPiece(offset: Offset, tolerance = PIECE_SIZE * 0.25): { offset: Offset; snapped: boolean } {
  if (Math.hypot(offset.x, offset.y) <= tolerance) return { offset: { x: 0, y: 0 }, snapped: true }
  return { offset, snapped: false }
}

/** Pieces joined to `index`: grid neighbours (row-major, `cols` wide) that share its offset. */
export function connectedPieces(offsets: Offset[], cols: number, index: number, epsilon = 0.5): number[] {
  const seen = new Set([index])
  const stack = [index]
  while (stack.length) {
    const i = stack.pop()!
    const col = i % cols
    const next = [col > 0 ? i - 1 : -1, col < cols - 1 ? i + 1 : -1, i - cols, i + cols]
    for (const j of next) {
      if (j < 0 || j >= offsets.length || seen.has(j)) continue
      if (Math.abs(offsets[j].x - offsets[i].x) < epsilon && Math.abs(offsets[j].y - offsets[i].y) < epsilon) {
        seen.add(j)
        stack.push(j)
      }
    }
  }
  return [...seen]
}

/** Drops a group of joined pieces: it locks onto the template, or onto the nearest grid neighbour within `tolerance`. */
export function settleGroup(offsets: Offset[], cols: number, group: number[], tolerance = PIECE_SIZE * 0.25): Offset[] {
  const own = offsets[group[0]]
  const home = snapPiece(own, tolerance)
  let target: Offset | null = home.snapped ? home.offset : null
  if (!target) {
    const members = new Set(group)
    let best = tolerance
    for (const i of group) {
      const col = i % cols
      for (const j of [col > 0 ? i - 1 : -1, col < cols - 1 ? i + 1 : -1, i - cols, i + cols]) {
        if (j < 0 || j >= offsets.length || members.has(j)) continue
        const gap = Math.hypot(offsets[j].x - own.x, offsets[j].y - own.y)
        if (gap <= best) [best, target] = [gap, offsets[j]]
      }
    }
  }
  if (!target) return offsets
  const to = target
  return offsets.map((o, i) => (group.includes(i) ? { ...to } : o))
}

export const isSolved = (offsets: Offset[]) => offsets.every((o) => o.x === 0 && o.y === 0)
