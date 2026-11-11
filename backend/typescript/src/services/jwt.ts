import { createHmac, timingSafeEqual } from 'node:crypto'

/** Minimal HS256 JWT sign/verify; enough for our own tokens, no external dependency. */
export type JwtClaims = { sub: string; sid: string; jti: string; typ: 'access' | 'refresh'; iat: number; exp: number }

const b64url = (data: Buffer | string) => Buffer.from(data).toString('base64url')
const HEADER = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))

export function signJwt(claims: JwtClaims, secret: string): string {
  const body = `${HEADER}.${b64url(JSON.stringify(claims))}`
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}

/** Returns the claims when the signature matches and the token has not expired; otherwise undefined. */
export function verifyJwt(token: string, secret: string, now = Math.floor(Date.now() / 1000)): JwtClaims | undefined {
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== HEADER) return undefined // also rejects alg=none and other algorithms
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest()
  const actual = Buffer.from(parts[2], 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined
  try {
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as JwtClaims
    return claims.exp > now ? claims : undefined
  } catch {
    return undefined
  }
}
