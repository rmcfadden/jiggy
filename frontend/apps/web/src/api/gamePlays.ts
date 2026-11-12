import { useMutation } from '@tanstack/react-query'
import { getAccessToken } from '../auth/session'

/** What `POST /api/game_plays` answers: the new play and its first state, which the server owns. */
export type GamePlayStart = { id: number; gameId: number; finished: string | null; state: unknown }

/** The server refused the access token (missing, invalid or expired). */
export class UnauthorizedError extends Error {}

/** Starts a new play of a saved game for the signed-in user. */
export async function startGamePlay(gameId: number): Promise<GamePlayStart> {
  const token = getAccessToken()
  const res = await fetch('/api/game_plays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ game_id: gameId }),
  })
  if (res.status === 401) throw new UnauthorizedError('Your session has expired. Sign in again.')
  if (!res.ok) {
    const detail = await res.json().then((b: { error?: string }) => b.error, () => undefined)
    throw new Error(detail ?? `POST /api/game_plays failed: ${res.status}`)
  }
  return res.json()
}

export const START_PLAY_KEY = ['startGamePlay']

export const useStartGamePlay = () => useMutation({ mutationKey: START_PLAY_KEY, mutationFn: startGamePlay })
