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
 * The full state of a play. Tray games (`next-pieces`, `last-x`) use `placed`, `queue`, `visible`; scrambled uses
 * `offsets`, each piece's distance from its solved position (0,0 means placed). `solved` is set by the service.
 */
export type PuzzleState = {
  type: GameType
  cols: number
  rows: number
  total: number
  mistakes: number
  solved: boolean
  freeBuild?: boolean
  placed?: boolean[]
  queue?: number[]
  visible?: number
  offsets?: Offset[]
}

/** A move a player asks for. Anything else is rejected before it reaches the rules. */
export type GameAction = { type: 'move'; piece: number; x: number; y: number } | { type: 'place'; piece: number; slot: number }

/** What applying an action gives back: the new state, the delta to store and whether the move was correct. */
export type ActionResult = { state: PuzzleState; delta: Record<string, unknown>; correct: boolean }

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
  const only = (...allowed: string[]) => {
    const extra = keys.find((k) => !allowed.includes(k))
    if (extra) throw new GameError(400, `unknown field: ${extra}`)
  }
  switch (raw.type) {
    case 'move':
      only('type', 'piece', 'x', 'y')
      return { type: 'move', piece: int('piece'), x: finite('x'), y: finite('y') }
    case 'place':
      only('type', 'piece', 'slot')
      return { type: 'place', piece: int('piece'), slot: int('slot') }
    default:
      throw new GameError(400, 'type must be "move" or "place"')
  }
}
