import { GameError, type PuzzleState, type StateEvent, type StateRow } from './types.ts'

/** Row-major cell index of every piece GUID in the matrix. */
export function pieceIndexes(state: PuzzleState): Map<string, number> {
  return new Map(state.matrix.flat().map((guid, index) => [guid, index]))
}

/** Applies events to a state. This is the one place state changes are defined, for live play and for replay alike. */
export function applyEvents(state: PuzzleState, events: StateEvent[]): PuzzleState {
  const next: PuzzleState = { ...state, pieces: state.pieces && { ...state.pieces }, queue: state.queue && [...state.queue] }
  const index = pieceIndexes(state)
  for (const event of events) {
    for (const guid of event.pieces) {
      if (!index.has(guid)) throw new GameError(409, `there is no piece ${guid}`)
      if (event.type === 'pieces_added') {
        if (next.pieces) next.pieces[guid] = { x: 0, y: 0 }
        if (next.queue) next.queue = next.queue.filter((q) => q !== guid)
      } else if (next.pieces) next.pieces[guid] = { x: event.x, y: event.y }
    }
  }
  return next
}

/** Rebuilds a state from its stored rows: the first is the full state, each later one a {@link StateRow}. */
export function foldState(rows: Record<string, unknown>[]): PuzzleState {
  if (rows.length === 0) throw new GameError(404, 'the play has no state')
  let state = structuredClone(rows[0]) as unknown as PuzzleState
  if (!Array.isArray(state.matrix)) throw new GameError(409, 'the play was stored in an old format')
  for (const row of rows.slice(1)) {
    const { events, mistakes, solved } = row as unknown as StateRow
    state = { ...applyEvents(state, events), mistakes, solved }
  }
  return state
}
