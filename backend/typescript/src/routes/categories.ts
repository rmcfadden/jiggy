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

  return router
}
