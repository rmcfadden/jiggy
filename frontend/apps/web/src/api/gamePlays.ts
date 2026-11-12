import { useMutation } from '@tanstack/react-query'
import { getAccessToken } from '../auth/session'

export type PlayOffset = { x: number; y: number }

/**
 * A play's state, owned by the server. `matrix[row][col]` is the GUID of the piece whose solved cell that is. Scrambled
 * plays give each piece's offset from its solved cell in `pieces` ((0,0) is placed); tray plays (`next-pieces`,
 * `last-x`) give the GUIDs still to place in `queue`, the first `visible` of them in the panel.
 */
export type PlayState = {
  type: 'scrambled' | 'next-pieces' | 'last-x'
  cols: number
  rows: number
  total: number
  mistakes: number
  solved: boolean
  freeBuild?: boolean
  matrix: string[][]
  pieces?: Record<string, PlayOffset>
  queue?: string[]
  visible?: number
}

/** A move the player asks for. `piece` is a GUID from the state's matrix. */
export type PlayAction = { type: 'move'; piece: string; x: number; y: number } | { type: 'place'; piece: string; slot: number }

/** What `POST /api/game_plays/:id/action` answers: the outcome, the state changes and the whole new state. */
export type ActionResponse = {
  accepted: boolean
  result: 'moved' | 'placed' | 'denied'
  reason?: string
  correct: boolean
  solved: boolean
  finished: string | null
  events: unknown[]
  state: PlayState
}

/** A play the page is showing: the state it loaded and how to send moves, each answered by the server's new state. */
export type PlayHandle = { id: number; state: PlayState; send: (action: PlayAction) => Promise<ActionResponse> }

/** What `POST /api/game_plays` answers: the new play and its first state, which the server owns. */
export type GamePlayStart = { id: number; gameId: number; finished: string | null; state: PlayState }

/** The server refused the access token (missing, invalid or expired). */
export class UnauthorizedError extends Error {}

/** Sends an authenticated request to the plays API; 401 is an {@link UnauthorizedError}, any other failure carries the server's message. */
async function playRequest<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`/api/game_plays${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 401) throw new UnauthorizedError('Your session has expired. Sign in again.')
  if (!res.ok) {
    const detail = await res.json().then((b: { error?: string }) => b.error, () => undefined)
    throw new Error(detail ?? `${method} /api/game_plays${path} failed: ${res.status}`)
  }
  return res.json()
}

/** Starts a new play of a saved game for the signed-in user. */
export const startGamePlay = (gameId: number) => playRequest<GamePlayStart>('POST', '', { game_id: gameId })

/** Asks the server to apply a move; it answers with the outcome and the new state, or throws when the move is refused. */
export const sendPlayAction = (playId: number, action: PlayAction) => playRequest<ActionResponse>('POST', `/${playId}/action`, action)

/** The play's current state, rebuilt by the server from its stored changes. */
export const fetchPlayState = (playId: number) => playRequest<{ id: number; state: PlayState; finished: string | null }>('GET', `/${playId}/state`)

/** Query for a play's state. Never refetched on its own: after the first load the page follows the server's move replies. */
export const playStateQuery = (playId: number) => ({
  queryKey: ['gamePlay', playId, 'state'] as const,
  queryFn: () => fetchPlayState(playId),
  staleTime: Infinity,
  gcTime: 0,
  retry: false,
})

export const START_PLAY_KEY = ['startGamePlay']

export const useStartGamePlay = () => useMutation({ mutationKey: START_PLAY_KEY, mutationFn: startGamePlay })
