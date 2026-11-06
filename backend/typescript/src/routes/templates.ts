import { Router } from 'express'
import { UnknownTemplateTypeError, type TemplatesService } from '../services/templates.ts'

export function templatesRouter(service: TemplatesService): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    try {
      res.json(await service.list(typeof req.query.type === 'string' ? req.query.type : undefined))
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
      if (err instanceof UnknownTemplateTypeError) res.status(400).json({ error: err.message })
      else next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const row = await service.update(Number(req.params.id), req.body)
      if (row) res.json(row)
      else res.sendStatus(404)
    } catch (err) {
      if (err instanceof UnknownTemplateTypeError) res.status(400).json({ error: err.message })
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
