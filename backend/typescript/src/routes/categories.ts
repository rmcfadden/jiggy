import { Router } from 'express'
import type { CategoriesService } from '../services/categories.ts'

export function categoriesRouter(service: CategoriesService): Router {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await service.tree())
    } catch (err) {
      next(err)
    }
  })

  // Every category with its database id and parent, which is what games are filed under.
  router.get('/flat', async (_req, res, next) => {
    try {
      res.json((await service.flat()).sort((a, b) => a.id - b.id))
    } catch (err) {
      next(err)
    }
  })

  return router
}
