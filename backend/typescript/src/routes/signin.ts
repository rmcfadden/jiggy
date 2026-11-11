import { Router } from 'express'
import type { SigninService } from '../services/signin.ts'

export function signinRouter(service: SigninService): Router {
  const router = Router()

  router.post('/', async (req, res, next) => {
    try {
      const { username, password } = req.body ?? {}
      if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        res.status(400).json({ error: 'username and password are required' })
        return
      }
      const issued = await service.signin({ username, password })
      res.set('Cache-Control', 'no-store')
      if (!issued) res.status(401).json({ error: 'invalid username or password' })
      else res.json({ signin_token: issued.value, expires_in: issued.expiresIn })
    } catch (err) {
      next(err)
    }
  })

  return router
}
