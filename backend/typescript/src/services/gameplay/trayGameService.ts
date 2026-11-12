import { PuzzleGameService, number } from './puzzleGameService.ts'
import { createRng, shuffle } from './rng.ts'
import { GameError, type ActionResult, type GameAction, type GameSetup, type PuzzleState } from './types.ts'

type Grid = { cols: number; rows: number; total: number; seed: number }

/**
 * The games where the player drops pieces from a panel into slots: a piece goes in its own slot or counts as a
 * mistake. Subclasses decide only which pieces are in the queue and how many the panel shows.
 */
abstract class TrayGameService extends PuzzleGameService {
  protected abstract layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number): { queue: number[]; visible: number; placed: boolean[] }

  protected initial(setup: GameSetup, { cols, rows, total, seed }: Grid): PuzzleState {
    const all = Array.from({ length: total }, (_, i) => i)
    const { queue, visible, placed } = this.layout(setup.config, all, createRng(seed), total)
    return { type: this.type, cols, rows, total, mistakes: 0, solved: false, placed, queue, visible }
  }

  protected isSolved(state: PuzzleState): boolean {
    return (state.queue ?? []).length === 0
  }

  protected apply(state: PuzzleState, action: GameAction): ActionResult {
    if (action.type !== 'place') this.unsupported(action)
    const { piece, slot } = action
    if (slot >= state.total) throw new GameError(409, `there is no slot ${slot}`)
    const queue = state.queue ?? []
    const placed = state.placed ?? []
    if (!queue.slice(0, state.visible ?? 0).includes(piece)) throw new GameError(409, `piece ${piece} is not in the panel`)
    if (placed[slot]) throw new GameError(409, `slot ${slot} is already filled`)
    if (piece !== slot) {
      const mistakes = state.mistakes + 1
      return { state: { ...state, mistakes }, delta: { mistakes }, correct: false }
    }
    const nextPlaced = placed.map((p, i) => p || i === slot)
    const nextQueue = queue.filter((q) => q !== piece)
    return { state: { ...state, placed: nextPlaced, queue: nextQueue }, delta: { placed: nextPlaced, queue: nextQueue }, correct: true }
  }
}

const clamp = (n: number, total: number) => Math.min(total, Math.max(1, Math.floor(n)))

/** Next pieces in panel: the panel offers the next few pieces of the queue, in order or shuffled. */
export class NextPiecesGameService extends TrayGameService {
  readonly type = 'next-pieces' as const

  protected layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number) {
    const queue = config.order === 'random' ? shuffle(all, rng) : all
    return { queue, visible: clamp(number(config.panelSize, 3), total), placed: all.map(() => false) }
  }
}

/** Solve last X pieces: all but X random pieces start placed, the player places the rest. */
export class LastXGameService extends TrayGameService {
  readonly type = 'last-x' as const

  protected layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number) {
    const queue = shuffle(all, rng).slice(0, clamp(number(config.remaining, 5), total))
    return { queue, visible: queue.length, placed: all.map((i) => !queue.includes(i)) }
  }
}
