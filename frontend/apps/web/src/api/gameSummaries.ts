import { useQuery } from '@tanstack/react-query'

/**
 * What a list of games needs, from one request: no config or dates. `thumbnameLocation` is the thumbnail URL
 * (the image itself when it has none). `attributes` are derived facts such as `pieceCount`, the pieces in the
 * template the game plays.
 */
export type GameSummaryRow = {
  id: number
  name: string
  description: string
  parentName: string
  thumbnameLocation: string
  categories: { id: number; name: string }[]
  attributes: Record<string, string>
  /** How many reviews the game has, and their average out of 5 (null when there are none). */
  reviewCount: number
  averageRating: number | null
}

/** The value of the attribute called `name`, or undefined. */
export const attributeOf = (g: GameSummaryRow, name: string) => g.attributes[name]

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
