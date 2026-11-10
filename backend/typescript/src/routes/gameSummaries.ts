import { Router } from 'express'
import type { GameSummariesService } from '../services/gameSummaries.ts'

export function gameSummariesRouter(service: GameSummariesService): Router {
  const router = Router()

  // What lists need: no uuid, dates or config. Categories are trimmed to their id and name.
  router.get('/', async (_req, res, next) => {
    try {
      const list = []
      for await (const s of service.read()) {
        list.push({
          id: s.id,
          name: s.name,
          description: s.description,
          parentName: s.parentName,
          templateId: s.templateId,
          thumbnameLocation: s.thumbnameLocation,
          categories: s.categories.map((c) => ({ id: c.id, name: c.name })),
        })
      }
      res.json(list)
    } catch (err) {
      next(err)
    }
  })

  return router
}
