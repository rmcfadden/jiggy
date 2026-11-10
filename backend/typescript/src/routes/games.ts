import { Router } from 'express'
import { UnknownReferenceError, type GamesService } from '../services/games.ts'

export function gamesRouter(service: GamesService): Router {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await service.list())
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const row = await service.get(Number(req.params.id))
      if (row) res.json(row)
      else res.sendStatus(404)
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      res.status(201).json(await service.create(req.body))
    } catch (err) {
      if (err instanceof UnknownReferenceError) res.status(400).json({ error: err.message })
      else next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const row = await service.update(Number(req.params.id), req.body)
      if (row) res.json(row)
      else res.sendStatus(404)
    } catch (err) {
      if (err instanceof UnknownReferenceError) res.status(400).json({ error: err.message })
      else next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      res.sendStatus((await service.delete(Number(req.params.id))) ? 204 : 404)
    } catch (err) {
      next(err)
    }
  })

  return router
}
