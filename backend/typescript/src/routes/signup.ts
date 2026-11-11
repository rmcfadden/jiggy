import { Router } from 'express'
import { SignupError, type SignupService } from '../services/signup.ts'

export function signupRouter(service: SignupService): Router {
  const router = Router()

  router.post('/', async (req, res, next) => {
    try {
      const { username, email, password } = req.body ?? {}
      const optional = (value: unknown) => value === undefined || value === null || typeof value === 'string'
      if (typeof password !== 'string' || !password || !optional(username) || !optional(email)) {
        res.status(400).json({ error: 'password is required; username and email must be strings' })
        return
      }
      const result = await service.signup({ username: username ?? undefined, email: email ?? undefined, password })
      res.set('Cache-Control', 'no-store')
      res.status(201).json({ username: result.username, signin_token: result.signin.value, expires_in: result.signin.expiresIn })
    } catch (err) {
      if (err instanceof SignupError) {
        res.status(err.status).json({ error: err.message })
        return
      }
      next(err)
    }
  })

  return router
}
