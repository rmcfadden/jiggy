import { Router, type Response } from 'express'
import { GameError } from '../services/gameplay/types.ts'
import type { GamePlaysService } from '../services/gamePlays.ts'

/** Routes under /api/game_plays; mount them behind `requireAuth`, which sets `res.locals.userId`. */
export function gamePlaysRouter(service: GamePlaysService): Router {
  const router = Router()
  const user = (res: Response): number => res.locals.userId

  router.post('/', async (req, res, next) => {
    try {
      const gameId = req.body?.game_id
      if (!Number.isInteger(gameId)) throw new GameError(400, 'game_id must be an integer')
      res.status(201).json(await service.start(gameId, user(res)))
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/action', async (req, res, next) => {
    try {
      res.json(await service.action(Number(req.params.id), user(res), req.body))
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id/state', async (req, res, next) => {
    try {
      res.json(await service.state(Number(req.params.id), user(res)))
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id/actions', async (req, res, next) => {
    try {
      res.json(await service.actionList(Number(req.params.id), user(res)))
    } catch (err) {
      next(err)
    }
  })

  router.post('/:id/finish', async (req, res, next) => {
    try {
      res.json(await service.finish(Number(req.params.id), user(res)))
    } catch (err) {
      next(err)
    }
  })

  // Game errors carry their own HTTP status; anything else falls through to Express's default 500.
  router.use((err: unknown, _req: unknown, res: Response, next: (e?: unknown) => void) => {
    if (err instanceof GameError) res.status(err.status).json({ error: err.message })
    else next(err)
  })

  return router
}
