import { useQuery } from '@tanstack/react-query'

/**
 * What a list of games needs, from one request: no config or dates. `thumbnameLocation` is the thumbnail URL
 * (the image itself when it has none) and `templateId` the template the game plays.
 */
export type GameSummaryRow = {
  id: number
  templateId: number
  name: string
  description: string
  parentName: string
  thumbnameLocation: string
  categories: { id: number; name: string }[]
}

/** Under `['games']`, so saving or deleting a game in the designer refreshes it too. */
export const GAME_SUMMARIES_KEY = ['games', 'summaries']

export const useGameSummaries = () =>
  useQuery({
    queryKey: GAME_SUMMARIES_KEY,
    queryFn: async (): Promise<GameSummaryRow[]> => {
      const res = await fetch('/api/games_summaries')
      if (!res.ok) throw new Error(`GET /api/games_summaries failed: ${res.status}`)
      return res.json()
    },
  })
