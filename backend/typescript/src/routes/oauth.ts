import express, { Router } from 'express'
import { OAuthError, type OAuthService } from '../services/oauth.ts'

export function oauthRouter(service: OAuthService): Router {
  const router = Router()
  // RFC 6749 requests are form-encoded; JSON is accepted too (app.use(express.json()) runs earlier).
  router.use(express.urlencoded({ extended: false }))

  router.post('/token', async (req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' })
    try {
      res.json(await service.token(req.body ?? {}, req.ip))
    } catch (err) {
      if (err instanceof OAuthError) res.status(err.status).json({ error: err.error, error_description: err.message })
      else next(err)
    }
  })

  return router
}
