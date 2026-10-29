import { useEffect, useRef, useState } from 'react'

/** Visual effects, grouped by the moment they fire. */
export type PieceEffects = {
  /** A dragged piece is close enough to its slot to snap. */
  near: { glow: boolean; glowNeighbors: boolean; border: boolean; highlightTemplate: boolean }
  /** A piece has just been placed. */
  placed: {
    pulse: boolean
    pulseNeighbors: boolean
    glow: boolean
    glowNeighbors: boolean
    sparkle: boolean
    sparkleNeighbors: boolean
  }
}

export const DEFAULT_EFFECTS: PieceEffects = {
  near: { glow: false, glowNeighbors: false, border: false, highlightTemplate: false },
  placed: { pulse: false, pulseNeighbors: false, glow: false, glowNeighbors: false, sparkle: false, sparkleNeighbors: false },
}

const FLASH_MS = 900

/** Accent for a piece that can snap: its border and its template slot. */
export const NEAR_COLOR = '#16a34a'

type Cell = { row: number; col: number }

/** Pieces that share an edge with piece `i`. */
export function neighborsOf(pieces: Cell[], i: number): number[] {
  const { row, col } = pieces[i]
  return pieces.flatMap((p, j) => (Math.abs(p.row - row) + Math.abs(p.col - col) === 1 ? [j] : []))
}

/** The piece that was just placed, for a short while; null otherwise or when several change at once (a restart). */
export function useFlash(placed: boolean[]): number | null {
  const prev = useRef(placed)
  const [flash, setFlash] = useState<number | null>(null)
  useEffect(() => {
    const was = prev.current
    prev.current = placed
    const added = placed.flatMap((p, i) => (p && !was[i] ? [i] : []))
    if (added.length !== 1 || was.length !== placed.length) return
    setFlash(added[0])
    const t = setTimeout(() => setFlash(null), FLASH_MS)
    return () => clearTimeout(t)
  }, [placed])
  return flash
}

/** Pieces to sparkle for the piece just placed: itself and/or its already-placed neighbors. */
export function sparklePieces(fx: PieceEffects, pieces: Cell[], placed: boolean[], flash: number | null): number[] {
  if (flash === null) return []
  const neighbors = fx.placed.sparkleNeighbors ? neighborsOf(pieces, flash).filter((j) => placed[j]) : []
  return fx.placed.sparkle ? [flash, ...neighbors] : neighbors
}

/** CSS classes (see index.css) for piece `i`; `isPlaced` is whether it is already set in the puzzle. */
export function effectClass(
  i: number,
  isPlaced: boolean,
  fx: PieceEffects,
  pieces: Cell[],
  near: number | null,
  flash: number | null,
): string {
  const out: string[] = []
  if (near !== null) {
    if (i === near && fx.near.glow) out.push('fx-glow')
    if (isPlaced && fx.near.glowNeighbors && neighborsOf(pieces, near).includes(i)) out.push('fx-glow')
  }
  if (flash !== null) {
    const self = i === flash
    const neighbor = isPlaced && !self && neighborsOf(pieces, flash).includes(i)
    if ((self && fx.placed.pulse) || (neighbor && fx.placed.pulseNeighbors)) out.push('fx-pulse')
    if ((self && fx.placed.glow) || (neighbor && fx.placed.glowNeighbors)) out.push('fx-flash-glow')
  }
  return out.join(' ')
}
