import { GameError, type ActionResult, type GameAction, type GameSetup, type GameType, type Offset, type PuzzleState } from './types.ts'

/** Biggest puzzle the server will start; a guard against absurd templates. */
const MAX_PIECES = 2_500

/**
 * The code that runs a puzzle game. The shared base holds everything the game types have in common: it builds the
 * starting state, checks every action against a strict contract and refuses anything that is not a legal move, and
 * decides when the game is solved. Subclasses only supply the starting layout and the rules of one move kind.
 * The state is never taken from a client: it is the result of `start` plus every accepted `action`.
 */
export abstract class PuzzleGameService {
  abstract readonly type: GameType

  /** The first state of a play; throws 422 when the template or config cannot make a game. */
  start(setup: GameSetup): PuzzleState {
    const { cols, rows } = setup
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1 || cols * rows > MAX_PIECES) {
      throw new GameError(422, `the game's template has no usable grid (${cols}x${rows})`)
    }
    const state = this.initial(setup, { cols, rows, total: cols * rows, seed: number(setup.config.seed, 1) })
    return { ...state, solved: this.isSolved(state) }
  }

  /** Applies one player action to `state`, or throws: 400 for a move this game type does not have, 409 for an illegal move. */
  action(state: PuzzleState, action: GameAction): ActionResult {
    if (state.solved) throw new GameError(409, 'the game is already solved')
    const result = this.apply(state, action)
    const solved = this.isSolved(result.state)
    return { ...result, state: { ...result.state, solved }, delta: solved ? { ...result.delta, solved } : result.delta }
  }

  /** The state a finished play ends with. A play may be finished early; `solved` says whether the puzzle was completed. */
  finish(state: PuzzleState): { solved: boolean; mistakes: number } {
    return { solved: state.solved, mistakes: state.mistakes }
  }

  protected abstract initial(setup: GameSetup, grid: { cols: number; rows: number; total: number; seed: number }): PuzzleState
  protected abstract apply(state: PuzzleState, action: GameAction): ActionResult
  protected abstract isSolved(state: PuzzleState): boolean

  protected unsupported(action: GameAction): never {
    throw new GameError(400, `a ${this.type} game has no "${action.type}" action`)
  }
}

export const number = (value: unknown, fallback: number): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)

/**
 * Rebuilds a state from its stored changes: the first row is the full state and each later row replaces the keys it
 * names. `offsets` is the exception, it is stored sparsely as `{ pieceIndex: {x, y} }` and patched in place.
 */
export function foldState(changes: Record<string, unknown>[]): PuzzleState {
  if (changes.length === 0) throw new GameError(404, 'the play has no state')
  let state = structuredClone(changes[0]) as unknown as PuzzleState
  for (const change of changes.slice(1)) {
    const { offsets, ...rest } = change as { offsets?: Offset[] | Record<string, Offset> }
    state = { ...state, ...(rest as Partial<PuzzleState>) }
    if (offsets && !Array.isArray(offsets)) {
      const next = [...(state.offsets ?? [])]
      for (const [index, offset] of Object.entries(offsets)) next[Number(index)] = offset
      state.offsets = next
    } else if (offsets) state.offsets = offsets
  }
  return state
}
