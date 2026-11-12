import { Router, type Response } from 'express'
import type { RequestHandler } from 'express'
import { GameError } from '../services/gameplay/types.ts'
import type { ReviewsService } from '../services/reviews.ts'

/**
 * Routes under /api/reviews. Reading is public; `auth` (`requireAuth`, which sets `res.locals.userId`) guards writing.
 */
export function reviewsRouter(service: ReviewsService, auth: RequestHandler): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    try {
      res.json(await service.list(Number(req.query.game_id)))
    } catch (err) {
      next(err)
    }
  })

  router.post('/', auth, async (req, res, next) => {
    try {
      const gameId = req.body?.game_id
      if (!Number.isInteger(gameId)) throw new GameError(400, 'game_id must be an integer')
      res.status(201).json(await service.add(gameId, res.locals.userId, req.body))
    } catch (err) {
      next(err)
    }
  })

  // Errors from the service carry their own HTTP status; anything else falls through to Express's default 500.
  router.use((err: unknown, _req: unknown, res: Response, next: (e?: unknown) => void) => {
    if (err instanceof GameError) res.status(err.status).json({ error: err.message })
    else next(err)
  })

  return router
}
