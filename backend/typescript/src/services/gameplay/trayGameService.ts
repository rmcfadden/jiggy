import { PuzzleGameService, number, toMatrix, type Grid } from './puzzleGameService.ts'
import { applyEvents, pieceIndexes } from './state.ts'
import { createRng, shuffle } from './rng.ts'
import { GameError, type ActionResult, type GameAction, type GameSetup, type PuzzleState } from './types.ts'

/**
 * The games where the player drops pieces from a panel into slots: a piece goes in its own slot or counts as a
 * mistake. Subclasses decide only which pieces are in the queue and how many the panel shows.
 */
abstract class TrayGameService extends PuzzleGameService {
  protected abstract layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number): { queue: number[]; visible: number }

  protected initial(setup: GameSetup, { cols, rows, total, seed, guids }: Grid): PuzzleState {
    const all = Array.from({ length: total }, (_, i) => i)
    const { queue, visible } = this.layout(setup.config, all, createRng(seed), total)
    return { type: this.type, cols, rows, total, mistakes: 0, solved: false, matrix: toMatrix(guids, cols), queue: queue.map((i) => guids[i]), visible }
  }

  protected isSolved(state: PuzzleState): boolean {
    return (state.queue ?? []).length === 0
  }

  protected apply(state: PuzzleState, action: GameAction): ActionResult {
    if (action.type !== 'place') this.unsupported(action)
    const { piece, slot } = action
    const index = pieceIndexes(state).get(piece)
    if (index === undefined) throw new GameError(409, `there is no piece ${piece}`)
    if (slot >= state.total) throw new GameError(409, `there is no slot ${slot}`)
    if (!(state.queue ?? []).slice(0, state.visible ?? 0).includes(piece)) throw new GameError(409, `piece ${piece} is not in the panel`)
    if (!(state.queue ?? []).includes(state.matrix.flat()[slot])) throw new GameError(409, `slot ${slot} is already filled`)
    if (index !== slot) {
      // A wrong slot is a legal try that fails: it costs a mistake and changes nothing else.
      return { state: { ...state, mistakes: state.mistakes + 1 }, events: [], result: 'denied', correct: false, reason: `piece ${piece} does not belong in slot ${slot}` }
    }
    const events = [{ type: 'pieces_added' as const, pieces: [piece] }]
    return { state: applyEvents(state, events), events, result: 'placed', correct: true }
  }
}

const clamp = (n: number, total: number) => Math.min(total, Math.max(1, Math.floor(n)))

/** Next pieces in panel: the panel offers the next few pieces of the queue, in order or shuffled. */
export class NextPiecesGameService extends TrayGameService {
  readonly type = 'next-pieces' as const

  protected layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number) {
    const queue = config.order === 'random' ? shuffle(all, rng) : all
    return { queue, visible: clamp(number(config.panelSize, 3), total) }
  }
}

/** Solve last X pieces: all but X random pieces start placed, the player places the rest. */
export class LastXGameService extends TrayGameService {
  readonly type = 'last-x' as const

  protected layout(config: Record<string, unknown>, all: number[], rng: () => number, total: number) {
    const queue = shuffle(all, rng).slice(0, clamp(number(config.remaining, 5), total))
    return { queue, visible: queue.length }
  }
}
