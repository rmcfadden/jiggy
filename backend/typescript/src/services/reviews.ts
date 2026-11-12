import type { ICRUDRepository } from '@deterministic-code/datasources'
import { gameReview, type GameReview } from '../../generated/types/datasource/gameReview.ts'
import { review, type Review } from '../../generated/types/datasource/review.ts'
import { GameError } from './gameplay/types.ts'
import type { GamesService } from './games.ts'
import type { UsersService } from './users.ts'

export type ReviewDto = { id: number; userId: number; userName: string; rating: number; comment: string; created: Date }
export type ReviewsDto = { gameId: number; count: number; average: number | null; reviews: ReviewDto[] }

export const MAX_COMMENT = 2000

/**
 * Reviews of games. A review is a `review` row (who, rating, comment) joined to its game by a `game_review` row. Each
 * user can review a game once; ratings are whole stars from 1 to 5.
 */
export class ReviewsService {
  constructor(
    private readonly reviews: ICRUDRepository<Review>,
    private readonly gameReviews: ICRUDRepository<GameReview>,
    private readonly games: GamesService,
    private readonly users: UsersService,
  ) {}

  /** The game's reviews, newest first, with their count and average rating (null when there are none). */
  async list(gameId: number): Promise<ReviewsDto> {
    await this.requireGame(gameId)
    const found = await this.forGame(gameId)
    const names = new Map<number, string>()
    const reviews: ReviewDto[] = []
    for (const r of found) {
      const userId = Number(r.userId)
      if (!names.has(userId)) names.set(userId, (await this.users.findById(userId))?.username ?? 'Unknown')
      reviews.push({ id: Number(r.id), userId, userName: names.get(userId)!, rating: Number(r.rating), comment: r.comment, created: r.created })
    }
    reviews.sort((a, b) => b.id - a.id)
    const average = reviews.length === 0 ? null : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    return { gameId, count: reviews.length, average, reviews }
  }

  /** Adds `userId`'s review of the game; 400 for a bad rating or comment, 404 for an unknown game, 409 for a second review. */
  async add(gameId: number, userId: number, body: { rating?: unknown; comment?: unknown }): Promise<ReviewDto> {
    const { rating } = body
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new GameError(400, 'rating must be a whole number from 1 to 5')
    const comment = body.comment ?? ''
    if (typeof comment !== 'string' || comment.length > MAX_COMMENT) throw new GameError(400, `comment must be text of at most ${MAX_COMMENT} characters`)
    await this.requireGame(gameId)
    if ((await this.forGame(gameId)).some((r) => Number(r.userId) === userId)) throw new GameError(409, 'you have already reviewed this game')
    const created = await this.reviews.create(review({ userId, comment: comment.trim(), rating: String(rating) }))
    await this.gameReviews.create(gameReview({ gameId, reviewId: Number(created.id) }))
    const name = (await this.users.findById(userId))?.username ?? 'Unknown'
    return { id: Number(created.id), userId, userName: name, rating, comment: created.comment, created: created.created }
  }

  private async requireGame(gameId: number): Promise<void> {
    if (!Number.isSafeInteger(gameId) || !(await this.games.get(gameId))) throw new GameError(404, `unknown game: ${gameId}`)
  }

  private async forGame(gameId: number): Promise<Review[]> {
    const ids = new Set<number>()
    for await (const link of this.gameReviews.read()) if (Number(link.gameId) === gameId) ids.add(Number(link.reviewId))
    const found: Review[] = []
    for await (const row of this.reviews.read()) if (ids.has(Number(row.id))) found.push(row)
    return found
  }
}
