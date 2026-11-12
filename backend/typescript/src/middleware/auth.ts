import type { NextFunction, Request, Response } from 'express'
import { ACCESS_TOKEN_TYPE, type TokenService } from '../services/tokens.ts'

/**
 * Requires `Authorization: Bearer <access token>` (the JWT from /api/oauth/token). On success the user's id is in
 * `res.locals.userId`; otherwise the request is answered 401 and never reaches the route.
 */
export function requireAuth(tokens: TokenService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const match = /^Bearer (\S+)$/i.exec(req.header('authorization') ?? '')
      const row = match && (await tokens.validate(match[1], ACCESS_TOKEN_TYPE))
      const userId = row && (await tokens.userIdOf(row))
      if (userId === undefined || !row) {
        res.set('WWW-Authenticate', 'Bearer').status(401).json({ error: 'a valid access token is required' })
        return
      }
      res.locals.userId = userId
      next()
    } catch (err) {
      next(err)
    }
  }
}
