import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { TokenType } from '../../generated/types/datasource/tokenType.ts'
import { emailToken, type EmailToken } from '../../generated/types/datasource/emailToken.ts'
import { userToken, type UserToken } from '../../generated/types/datasource/userToken.ts'
import { token, type Token } from '../../generated/types/view/token.ts'
import { signJwt, verifyJwt, type JwtClaims } from './jwt.ts'

export const SIGNIN_TOKEN_TYPE = 'signin_token'
export const ACCESS_TOKEN_TYPE = 'jwt_access_token'
export const REFRESH_TOKEN_TYPE = 'jwt_refresh_token'
export const EMAIL_CONFIRMATION_TOKEN_TYPE = 'email_confirmation'

export type TokenSettings = { jwtSecret: string; signinTtl: number; accessTtl: number; refreshTtl: number; emailConfirmationTtl: number }
export type IssuedToken = { value: string; expiresIn: number }

/** Reads JWT_SECRET (required) and the optional TTLs (seconds; EMAIL_CONFIRMATION_TTL defaults to 24 hours) from the environment. */
export function tokenSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): TokenSettings {
  if (env === process.env) {
    // .env, then .env.development (test-only dev defaults, skipped in production), in the working directory.
    // loadEnvFile never overrides a variable that is already set: the real environment wins, then .env, then .env.development.
    const production = [env.APP_ENV, env.NODE_ENV, env.ASPNETCORE_ENVIRONMENT].some((v) => v?.toLowerCase() === 'production')
    for (const file of production ? ['.env'] : ['.env', '.env.development']) {
      try {
        process.loadEnvFile(file)
      } catch {
        /* no such file: rely on the others */
      }
    }
  }
  const jwtSecret = env.JWT_SECRET
  if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters')
  const seconds = (name: string, fallback: number) => (env[name] ? Number(env[name]) : fallback)
  return { jwtSecret, signinTtl: seconds('SIGNIN_TOKEN_TTL', 300), accessTtl: seconds('JWT_ACCESS_TTL', 86_400), refreshTtl: seconds('JWT_REFRESH_TTL', 86_400), emailConfirmationTtl: seconds('EMAIL_CONFIRMATION_TTL', 86_400) }
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

/** Issues, validates and revokes signin, JWT access and JWT refresh tokens. Only a SHA-256 hash of each token is stored. */
export class TokenService {
  constructor(
    private readonly tokens: ICRUDRepository<Token>,
    private readonly userTokens: ICRUDRepository<UserToken>,
    private readonly emailTokens: ICRUDRepository<EmailToken>,
    private readonly tokenTypes: ICRUDRepository<TokenType>,
    private readonly settings: TokenSettings,
  ) {}

  /** Short-lived, single-use opaque token handed back by signin and exchanged at /api/oauth/token. */
  issueSignin(userId: number): Promise<IssuedToken> {
    return this.store(userId, SIGNIN_TOKEN_TYPE, `signin:${randomUUID()}`, randomBytes(32).toString('base64url'), this.settings.signinTtl)
  }

  /**
   * A long random code for the link in a confirmation email, tied to the user and to the email it confirms. Only its hash is
   * stored; it expires after EMAIL_CONFIRMATION_TTL and works once (see `revoke`).
   */
  async issueEmailConfirmation(userId: number, emailId: number): Promise<IssuedToken> {
    const { issued, tokenId } = await this.storeRow(userId, EMAIL_CONFIRMATION_TOKEN_TYPE, `email:${emailId}:${randomUUID()}`, randomBytes(32).toString('base64url'), this.settings.emailConfirmationTtl)
    try {
      await this.emailTokens.create(emailToken({ emailId, tokenId }))
    } catch (error) {
      for await (const row of this.tokens.read()) if (Number(row.id) === tokenId) await this.tokens.delete(row)
      throw error
    }
    return issued
  }

  /** The email a confirmation token was issued for. */
  async emailIdOf(row: Token): Promise<number | undefined> {
    for await (const link of this.emailTokens.read()) if (Number(link.tokenId) === Number(row.id)) return Number(link.emailId)
    return undefined
  }

  /** When the newest confirmation token for the email was issued, to rate-limit resends. */
  async lastEmailConfirmation(emailId: number): Promise<Date | undefined> {
    const ids = new Set<number>()
    for await (const link of this.emailTokens.read()) if (Number(link.emailId) === emailId) ids.add(Number(link.tokenId))
    let newest: Date | undefined
    for await (const row of this.tokens.read()) if (ids.has(Number(row.id)) && (!newest || row.created > newest)) newest = row.created
    return newest
  }

  issueAccess(userId: number, userUuid: string, sessionUuid: string): Promise<IssuedToken> {
    return this.issueJwt(userId, userUuid, sessionUuid, 'access', ACCESS_TOKEN_TYPE, this.settings.accessTtl)
  }

  issueRefresh(userId: number, userUuid: string, sessionUuid: string): Promise<IssuedToken> {
    return this.issueJwt(userId, userUuid, sessionUuid, 'refresh', REFRESH_TOKEN_TYPE, this.settings.refreshTtl)
  }

  /** The stored row when `plain` is a live token of `typeName` (enabled, not deleted, not revoked, not expired). */
  async validate(plain: string, typeName: string): Promise<Token | undefined> {
    if (typeName === ACCESS_TOKEN_TYPE || typeName === REFRESH_TOKEN_TYPE) {
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
    return (await this.storeRow(userId, typeName, name, value, ttl)).issued
  }

  private async storeRow(userId: number, typeName: string, name: string, value: string, ttl: number): Promise<{ issued: IssuedToken; tokenId: number }> {
    const tokenTypeId = await this.typeId(typeName)
    const created = await this.tokens.create(token({ tokenTypeId, name, secret: sha256(value), isEnabled: true, expires: new Date(Date.now() + ttl * 1000), revoked: null, isDeleted: false }))
    try {
      await this.userTokens.create(userToken({ userId, tokenId: created.id }))
    } catch (error) {
      await this.tokens.delete(created) // an unlinked token could never be traced back to its user
      throw error
    }
    return { issued: { value, expiresIn: ttl }, tokenId: Number(created.id) }
  }

  private async typeId(name: string): Promise<number> {
    for await (const row of this.tokenTypes.read()) if (row.name === name) return Number(row.id)
    throw new Error(`token type "${name}" is missing; run the migrations`)
  }
}
