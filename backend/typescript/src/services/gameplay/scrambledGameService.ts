import { PuzzleGameService, number, toMatrix, type Grid } from './puzzleGameService.ts'
import { applyEvents, pieceIndexes } from './state.ts'
import { connectedPieces, isSolved, PIECE_SIZE, scatterOffsets, settleGroup, snapPiece, type StartSide } from './puzzle.ts'
import { GameError, type ActionResult, type GameAction, type GameSetup, type Offset, type PuzzleState, type StateEvent } from './types.ts'

const SIDES: StartSide[] = ['random', 'top', 'left', 'right', 'bottom']

/** Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours). */
export class ScrambledGameService extends PuzzleGameService {
  readonly type = 'scrambled' as const

  protected initial(setup: GameSetup, { cols, rows, total, seed, guids }: Grid): PuzzleState {
    const c = setup.config
    const side = SIDES.find((s) => s === c.startSide) ?? 'random'
    const offsets = scatterOffsets(
      { cols, rows, seed },
      { side, count: number(c.looseCount, 0) || total, viewPercent: number(c.viewPercent, 40), spread: number(c.spread, 30) },
    )
    const pieces = Object.fromEntries(guids.map((guid, i) => [guid, offsets[i]]))
    return { type: this.type, cols, rows, total, mistakes: 0, solved: false, freeBuild: c.freeBuild !== false, matrix: toMatrix(guids, cols), pieces }
  }

  protected isSolved(state: PuzzleState): boolean {
    return isSolved(offsetsOf(state))
  }

  protected apply(state: PuzzleState, action: GameAction): ActionResult {
    if (action.type !== 'move') this.unsupported(action)
    const guids = state.matrix.flat()
    const piece = pieceIndexes(state).get(action.piece)
    if (piece === undefined) throw new GameError(409, `there is no piece ${action.piece}`)
    // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
    const limit = Math.max(state.cols, state.rows) * PIECE_SIZE * 4
    if (Math.abs(action.x) > limit || Math.abs(action.y) > limit) throw new GameError(409, 'the piece was moved off the board area')
    const offsets = offsetsOf(state)
    if (offsets[piece].x === 0 && offsets[piece].y === 0) throw new GameError(409, `piece ${action.piece} is already placed`)

    // Joined pieces move as one: the dragged piece's whole group takes the drop, then settles together.
    const group = state.freeBuild ? connectedPieces(offsets, state.cols, piece) : [piece]
    const moved = offsets.map((o, i) => (group.includes(i) ? { x: action.x, y: action.y } : o))
    const next = state.freeBuild ? settleGroup(moved, state.cols, group) : moved.map((o, i) => (i === piece ? snapPiece(o).offset : o))
    const at = next[piece]
    const names = (indexes: number[]) => indexes.map((i) => guids[i])

    const placed = at.x === 0 && at.y === 0
    const events: StateEvent[] = placed ? [{ type: 'pieces_added', pieces: names(group) }] : [{ type: 'pieces_moved', pieces: names(group), x: at.x, y: at.y }]
    // Landing against a neighbour makes a bigger group; say so with the whole new group.
    const joined = placed || !state.freeBuild ? group : connectedPieces(next, state.cols, piece)
    if (!placed && joined.length > group.length) events.push({ type: 'pieces_joined', pieces: names(joined), x: at.x, y: at.y })

    return { state: applyEvents(state, events), events, result: placed ? 'placed' : 'moved', correct: placed }
  }
}

/** The pieces' offsets in row-major order, the shape the shared puzzle rules work on. */
function offsetsOf(state: PuzzleState): Offset[] {
  return state.matrix.flat().map((guid) => state.pieces?.[guid] ?? { x: 0, y: 0 })
}
