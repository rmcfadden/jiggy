import { Router } from 'express'
import type { GameSummariesService } from '../services/gameSummaries.ts'
import type { ReviewsService } from '../services/reviews.ts'

export function gameSummariesRouter(service: GameSummariesService, reviews: ReviewsService): Router {
  const router = Router()

  // What lists need: no uuid, dates or config. Categories are trimmed to their id and name; the rating comes from the reviews.
  router.get('/', async (_req, res, next) => {
    try {
      const ratings = await reviews.stats()
      const list = []
      for await (const s of service.read()) {
        list.push({
          id: s.id,
          name: s.name,
          description: s.description,
          parentName: s.parentName,
          attributes: s.attributes,
          thumbnameLocation: s.thumbnameLocation,
          categories: s.categories.map((c) => ({ id: c.id, name: c.name })),
          reviewCount: ratings.get(Number(s.id))?.count ?? 0,
          averageRating: ratings.get(Number(s.id))?.average ?? null,
        })
      }
      res.json(list)
    } catch (err) {
      next(err)
    }
  })

  return router
}
