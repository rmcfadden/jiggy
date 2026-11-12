import { Router } from 'express'
import type { GamesService } from '../services/games.ts'

/** Puzzles by the slug of their name, public like the rest of the catalog. Mounted at `/api`. */
export function puzzlesRouter(games: GamesService): Router {
  const router = Router()

  // GET /api/puzzles/:name
  router.get('/puzzles/:name', async (req, res, next) => {
    try {
      const row = await games.getByName(req.params.name)
      if (row) res.json(row)
      else res.sendStatus(404)
    } catch (err) {
      next(err)
    }
  })

  // GET /api/category/:name/puzzles
  router.get('/category/:name/puzzles', async (req, res, next) => {
    try {
      const list = await games.listByCategoryName(req.params.name)
      if (list) res.json(list)
      else res.sendStatus(404)
    } catch (err) {
      next(err)
    }
  })

  return router
}
