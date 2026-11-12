import { PuzzleGameService, number } from './puzzleGameService.ts'
import { connectedPieces, isSolved, PIECE_SIZE, scatterOffsets, settleGroup, snapPiece, type StartSide } from './puzzle.ts'
import { GameError, type ActionResult, type GameAction, type GameSetup, type Offset, type PuzzleState } from './types.ts'

const SIDES: StartSide[] = ['random', 'top', 'left', 'right', 'bottom']

/** Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours). */
export class ScrambledGameService extends PuzzleGameService {
  readonly type = 'scrambled' as const

  protected initial(setup: GameSetup, { cols, rows, total, seed }: { cols: number; rows: number; total: number; seed: number }): PuzzleState {
    const c = setup.config
    const side = SIDES.find((s) => s === c.startSide) ?? 'random'
    const offsets = scatterOffsets(
      { cols, rows, seed },
      { side, count: number(c.looseCount, 0) || total, viewPercent: number(c.viewPercent, 40), spread: number(c.spread, 30) },
    )
    return { type: this.type, cols, rows, total, mistakes: 0, solved: false, freeBuild: c.freeBuild !== false, offsets }
  }

  protected isSolved(state: PuzzleState): boolean {
    return isSolved(state.offsets ?? [])
  }

  protected apply(state: PuzzleState, action: GameAction): ActionResult {
    if (action.type !== 'move') this.unsupported(action)
    const offsets = state.offsets ?? []
    if (action.piece >= state.total) throw new GameError(409, `there is no piece ${action.piece}`)
    // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
    const limit = Math.max(state.cols, state.rows) * PIECE_SIZE * 4
    if (Math.abs(action.x) > limit || Math.abs(action.y) > limit) throw new GameError(409, 'the piece was moved off the board area')
    const here = offsets[action.piece]
    if (here.x === 0 && here.y === 0) throw new GameError(409, `piece ${action.piece} is already placed`)

    const group = state.freeBuild ? connectedPieces(offsets, state.cols, action.piece) : [action.piece]
    const moved = offsets.map((o, i) => (group.includes(i) ? { x: action.x, y: action.y } : o))
    const next = state.freeBuild
      ? settleGroup(moved, state.cols, group)
      : moved.map((o, i) => (i === action.piece ? snapPiece(o).offset : o))

    const changes: Record<string, Offset> = {}
    next.forEach((o, i) => {
      if (o.x !== offsets[i].x || o.y !== offsets[i].y) changes[i] = o
    })
    return { state: { ...state, offsets: next }, delta: { offsets: changes }, correct: next[action.piece].x === 0 && next[action.piece].y === 0 }
  }
}
