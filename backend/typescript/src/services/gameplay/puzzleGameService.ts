import { randomUUID } from 'node:crypto'
import { GameError, type ActionResult, type GameAction, type GameSetup, type GameType, type PuzzleState } from './types.ts'

export { foldState } from './state.ts'

/** Biggest puzzle the server will start; a guard against absurd templates. */
const MAX_PIECES = 2_500

/** What a subclass gets to lay out a game: the grid, the seed, and one fresh GUID per piece (row-major). */
export type Grid = { cols: number; rows: number; total: number; seed: number; guids: string[] }

/**
 * The code that runs a puzzle game. The shared base holds everything the game types have in common: it builds the
 * starting state (matrix of unguessable piece GUIDs included), checks every action against a strict contract and
 * refuses anything that is not a legal move, and decides when the game is solved. Subclasses only supply the starting
 * layout and the rules of one move kind. The state is never taken from a client: it is the result of `start` plus
 * every accepted `action`.
 */
export abstract class PuzzleGameService {
  abstract readonly type: GameType

  /** `newId` makes piece GUIDs; the default is a CSPRNG v4 UUID. Tests pass a counter. */
  constructor(protected readonly newId: () => string = randomUUID) {}

  /** The first state of a play; throws 422 when the template or config cannot make a game. */
  start(setup: GameSetup): PuzzleState {
    const { cols, rows } = setup
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1 || cols * rows > MAX_PIECES) {
      throw new GameError(422, `the game's template has no usable grid (${cols}x${rows})`)
    }
    const total = cols * rows
    const guids = Array.from({ length: total }, () => this.newId())
    const state = this.initial(setup, { cols, rows, total, seed: number(setup.config.seed, 1), guids })
    return { ...state, solved: this.isSolved(state) }
  }

  /** Applies one player action to `state`, or throws: 400 for a move this game type does not have, 409 for an illegal move. */
  action(state: PuzzleState, action: GameAction): ActionResult {
    if (state.solved) throw new GameError(409, 'the game is already solved')
    const result = this.apply(state, action)
    return { ...result, state: { ...result.state, solved: this.isSolved(result.state) } }
  }

  /** The state a finished play ends with. A play may be finished early; `solved` says whether the puzzle was completed. */
  finish(state: PuzzleState): { solved: boolean; mistakes: number } {
    return { solved: state.solved, mistakes: state.mistakes }
  }

  protected abstract initial(setup: GameSetup, grid: Grid): PuzzleState
  protected abstract apply(state: PuzzleState, action: GameAction): ActionResult
  protected abstract isSolved(state: PuzzleState): boolean

  protected unsupported(action: GameAction): never {
    throw new GameError(400, `a ${this.type} game has no "${action.type}" action`)
  }
}

export const number = (value: unknown, fallback: number): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)

/** Splits row-major GUIDs into the matrix `matrix[row][col]`. */
export const toMatrix = (guids: string[], cols: number): string[][] =>
  Array.from({ length: guids.length / cols }, (_, row) => guids.slice(row * cols, (row + 1) * cols))
