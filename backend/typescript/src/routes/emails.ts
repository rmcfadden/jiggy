import { Router } from 'express'
import { ConfirmError, type EmailConfirmationService } from '../services/emailConfirmation.ts'

/** POST /confirm is public (the code is the credential); POST /resend and GET /status need `auth` (a signed-in user). */
export function emailsRouter(service: EmailConfirmationService, auth: import('express').RequestHandler): Router {
  const router = Router()

  router.post('/confirm', async (req, res, next) => {
    try {
      const code = req.body?.code
      if (typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'code is required' })
        return
      }
      await service.confirm(code)
      res.json({ confirmed: true })
    } catch (err) {
      if (err instanceof ConfirmError) {
        res.status(err.status).json({ error: err.message })
        return
      }
      next(err)
    }
  })

  router.get('/status', auth, async (_req, res, next) => {
    try {
      const status = await service.status(res.locals.userId as number)
      res.json(status ?? { email: null, verified: false })
    } catch (err) {
      next(err)
    }
  })

  router.post('/resend', auth, async (_req, res, next) => {
    try {
      await service.resend(res.locals.userId as number)
      res.status(202).json({ sent: true })
    } catch (err) {
      if (err instanceof ConfirmError) {
        res.status(err.status).json({ error: err.message })
        return
      }
      next(err)
    }
  })

  return router
}
