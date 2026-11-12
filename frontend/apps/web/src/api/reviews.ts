import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UnauthorizedError } from './gamePlays'
import { GAME_SUMMARIES_KEY } from './gameSummaries'
import { freshAccessToken } from '../auth/refresh'

/** One review of a game; `rating` is whole stars, 1 to 5. */
export type Review = { id: number; userId: number; userName: string; rating: number; comment: string; created: string }

/** What `GET /api/reviews?game_id=` answers: the reviews newest first, with their count and average (null when there are none). */
export type GameReviews = { gameId: number; count: number; average: number | null; reviews: Review[] }

export const MAX_COMMENT = 2000

export const reviewsKey = (gameId: number) => ['reviews', gameId]

async function failure(res: Response, what: string): Promise<Error> {
  if (res.status === 401) return new UnauthorizedError('Your session has expired. Sign in again.')
  const detail = await res.json().then((b: { error?: string }) => b?.error, () => undefined)
  return new Error(detail ?? `${what} failed: ${res.status}`)
}

/** The game's reviews. Public: no sign-in needed to read them. */
export const useReviews = (gameId: number) =>
  useQuery({
    queryKey: reviewsKey(gameId),
    queryFn: async (): Promise<GameReviews> => {
      const res = await fetch(`/api/reviews?game_id=${gameId}`)
      if (!res.ok) throw await failure(res, 'GET /api/reviews')
      return res.json()
    },
  })

/** Posts the signed-in user's review of the game (one per user; the server answers 409 for a second) and refreshes the list. */
export const useAddReview = (gameId: number) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: { rating: number; comment: string }): Promise<Review> => {
      const token = await freshAccessToken()
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ game_id: gameId, ...input }),
      })
      if (!res.ok) throw await failure(res, 'POST /api/reviews')
      return res.json()
    },
    // The new review changes the game's rating on every card, which comes from the summaries.
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: reviewsKey(gameId) }), client.invalidateQueries({ queryKey: GAME_SUMMARIES_KEY })]),
  })
}
