/** Errors the game rules raise; each carries the HTTP status the API answers with. */
export class GameError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message)
  }
}

export type Offset = { x: number; y: number }

export type GameType = 'scrambled' | 'next-pieces' | 'last-x'

/** What a game needs to start: the template grid and the game's designer config (the `config.config` part). */
export type GameSetup = {
  cols: number
  rows: number
  config: Record<string, unknown>
}

/**
 * The full state of a play. `matrix[row][col]` is the GUID of the piece whose solved cell that is; GUIDs are random per
 * play, so a player cannot guess one. Scrambled games keep every piece's `pieces[guid]` offset from its solved cell
 * (0,0 means placed). Tray games (`next-pieces`, `last-x`) use `queue` (GUIDs still to place) and `visible`; a cell is filled once its piece has left the queue.
 * `solved` is set by the service.
 */
export type PuzzleState = {
  type: GameType
  cols: number
  rows: number
  total: number
  mistakes: number
  solved: boolean
  freeBuild?: boolean
  matrix: string[][]
  pieces?: Record<string, Offset>
  queue?: string[]
  visible?: number
}

/** A change to the state. Each names every piece it affects, because joined pieces move as one. */
export type StateEvent =
  /** The pieces are at a new coordinate: the final, settled position, never the raw drop. */
  | { type: 'pieces_moved'; pieces: string[]; x: number; y: number }
  /** The pieces entered the puzzle at their solved cell. */
  | { type: 'pieces_added'; pieces: string[] }
  /** These pieces now sit together as one group at (x, y). */
  | { type: 'pieces_joined'; pieces: string[]; x: number; y: number }

/** A move a player asks for. Anything else is rejected before it reaches the rules. `piece` is a piece GUID. */
export type GameAction = { type: 'move'; piece: string; x: number; y: number } | { type: 'place'; piece: string; slot: number }

/** `placed`: the move put pieces in their solved cell. `moved`: pieces moved (maybe joined). `denied`: a legal try that failed (a wrong slot). */
export type MoveResult = 'moved' | 'placed' | 'denied'

/** What applying an action gives back: the new state, the events to store, the outcome and whether the move was correct. */
export type ActionResult = { state: PuzzleState; events: StateEvent[]; result: MoveResult; correct: boolean; reason?: string }

/** One stored state row after the first: the events plus the counters they leave behind. */
export type StateRow = { events: StateEvent[]; mistakes: number; solved: boolean }

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Parses an untrusted body into a {@link GameAction}; throws a 400 for unknown types, extra fields or bad values. */
export function parseAction(body: unknown): GameAction {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new GameError(400, 'action must be a JSON object')
  const raw = body as Record<string, unknown>
  const keys = Object.keys(raw)
  const int = (name: string): number => {
    const value = raw[name]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) throw new GameError(400, `${name} must be a non-negative integer`)
    return value
  }
  const finite = (name: string): number => {
    const value = raw[name]
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new GameError(400, `${name} must be a finite number`)
    return value
  }
  const guid = (name: string): string => {
    const value = raw[name]
    if (typeof value !== 'string' || !GUID.test(value)) throw new GameError(400, `${name} must be a piece GUID`)
    return value.toLowerCase()
  }
  const only = (...allowed: string[]) => {
    const extra = keys.find((k) => !allowed.includes(k))
    if (extra) throw new GameError(400, `unknown field: ${extra}`)
  }
  switch (raw.type) {
    case 'move':
      only('type', 'piece', 'x', 'y')
      return { type: 'move', piece: guid('piece'), x: finite('x'), y: finite('y') }
    case 'place':
      only('type', 'piece', 'slot')
      return { type: 'place', piece: guid('piece'), slot: int('slot') }
    default:
      throw new GameError(400, 'type must be "move" or "place"')
  }
}
