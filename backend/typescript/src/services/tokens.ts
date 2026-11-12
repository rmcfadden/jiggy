import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { TokenType } from '../../generated/types/datasource/tokenType.ts'
import { userToken, type UserToken } from '../../generated/types/datasource/userToken.ts'
import { token, type Token } from '../../generated/types/view/token.ts'
import { signJwt, verifyJwt, type JwtClaims } from './jwt.ts'

export const SIGNIN_TOKEN_TYPE = 'signin_token'
export const ACCESS_TOKEN_TYPE = 'jwt_access_token'
export const REFRESH_TOKEN_TYPE = 'jwt_refresh_token'

export type TokenSettings = { jwtSecret: string; signinTtl: number; accessTtl: number; refreshTtl: number }
export type IssuedToken = { value: string; expiresIn: number }

/** Reads JWT_SECRET (required) and the optional TTLs (seconds) from the environment. */
export function tokenSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): TokenSettings {
  if (env === process.env) {
    try {
      process.loadEnvFile() // .env in the working directory; never overrides variables that are already set
    } catch {
      /* no .env file: rely on the real environment */
    }
  }
  const jwtSecret = env.JWT_SECRET
  if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters')
  const seconds = (name: string, fallback: number) => (env[name] ? Number(env[name]) : fallback)
  return { jwtSecret, signinTtl: seconds('SIGNIN_TOKEN_TTL', 300), accessTtl: seconds('JWT_ACCESS_TTL', 86_400), refreshTtl: seconds('JWT_REFRESH_TTL', 86_400) }
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

/** Issues, validates and revokes signin, JWT access and JWT refresh tokens. Only a SHA-256 hash of each token is stored. */
export class TokenService {
  constructor(
    private readonly tokens: ICRUDRepository<Token>,
    private readonly userTokens: ICRUDRepository<UserToken>,
    private readonly tokenTypes: ICRUDRepository<TokenType>,
    private readonly settings: TokenSettings,
  ) {}

  /** Short-lived, single-use opaque token handed back by signin and exchanged at /api/oauth/token. */
  issueSignin(userId: number): Promise<IssuedToken> {
    return this.store(userId, SIGNIN_TOKEN_TYPE, `signin:${randomUUID()}`, randomBytes(32).toString('base64url'), this.settings.signinTtl)
  }

  issueAccess(userId: number, userUuid: string, sessionUuid: string): Promise<IssuedToken> {
    return this.issueJwt(userId, userUuid, sessionUuid, 'access', ACCESS_TOKEN_TYPE, this.settings.accessTtl)
  }

  issueRefresh(userId: number, userUuid: string, sessionUuid: string): Promise<IssuedToken> {
    return this.issueJwt(userId, userUuid, sessionUuid, 'refresh', REFRESH_TOKEN_TYPE, this.settings.refreshTtl)
  }

  /** The stored row when `plain` is a live token of `typeName` (enabled, not deleted, not revoked, not expired). */
  async validate(plain: string, typeName: string): Promise<Token | undefined> {
    if (typeName !== SIGNIN_TOKEN_TYPE) {
      const claims = verifyJwt(plain, this.settings.jwtSecret)
      if (!claims || claims.typ !== (typeName === ACCESS_TOKEN_TYPE ? 'access' : 'refresh')) return undefined
    }
    const hash = sha256(plain)
    for await (const row of this.tokens.read()) {
      if (row.secret !== hash || row.tokenTypeName !== typeName) continue
      const live = row.isEnabled && !row.isDeleted && !row.revoked && row.expires.getTime() > Date.now()
      return live ? row : undefined
    }
    return undefined
  }

  /** The user a stored token was issued to. */
  async userIdOf(row: Token): Promise<number | undefined> {
    for await (const link of this.userTokens.read()) if (Number(link.tokenId) === Number(row.id)) return Number(link.userId)
    return undefined
  }

  /** Marks a token revoked (and disabled) so it can never validate again. */
  async revoke(row: Token): Promise<void> {
    if (!row.revoked) await this.tokens.update({ ...row, revoked: new Date(), isEnabled: false })
  }

  /** Revokes every live access/refresh token that was issued for the session. */
  async revokeForSession(sessionUuid: string): Promise<void> {
    for await (const row of this.tokens.read()) if (row.name.startsWith(`session:${sessionUuid}:`)) await this.revoke(row)
  }

  private issueJwt(userId: number, userUuid: string, sessionUuid: string, typ: JwtClaims['typ'], typeName: string, ttl: number): Promise<IssuedToken> {
    const jti = randomUUID()
    const iat = Math.floor(Date.now() / 1000)
    const jwt = signJwt({ sub: userUuid, sid: sessionUuid, jti, typ, iat, exp: iat + ttl }, this.settings.jwtSecret)
    return this.store(userId, typeName, `session:${sessionUuid}:${jti}`, jwt, ttl)
  }

  private async store(userId: number, typeName: string, name: string, value: string, ttl: number): Promise<IssuedToken> {
    const tokenTypeId = await this.typeId(typeName)
    const created = await this.tokens.create(token({ tokenTypeId, name, secret: sha256(value), isEnabled: true, expires: new Date(Date.now() + ttl * 1000), revoked: null, isDeleted: false }))
    try {
      await this.userTokens.create(userToken({ userId, tokenId: created.id }))
    } catch (error) {
      await this.tokens.delete(created) // an unlinked token could never be traced back to its user
      throw error
    }
    return { value, expiresIn: ttl }
  }

  private async typeId(name: string): Promise<number> {
    for await (const row of this.tokenTypes.read()) if (row.name === name) return Number(row.id)
    throw new Error(`token type "${name}" is missing; run the migrations`)
  }
}
