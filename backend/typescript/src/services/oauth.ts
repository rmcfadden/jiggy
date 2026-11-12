import { REFRESH_TOKEN_TYPE, SIGNIN_TOKEN_TYPE, type TokenService, type TokenSettings } from './tokens.ts'
import { verifyJwt } from './jwt.ts'
import type { SessionService } from './sessions.ts'
import type { UsersService } from './users.ts'

export const TOKEN_EXCHANGE_GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange'
export const REFRESH_TOKEN_GRANT = 'refresh_token'
export const ACCESS_TOKEN_URN = 'urn:ietf:params:oauth:token-type:access_token'

/** An RFC 6749 error response: `error` is the OAuth code, `status` the HTTP status. */
export class OAuthError extends Error {
  constructor(
    readonly error: 'invalid_request' | 'invalid_grant' | 'unsupported_grant_type',
    description: string,
    readonly status = 400,
  ) {
    super(description)
  }
}

export type TokenResponse = { access_token: string; issued_token_type: string; token_type: 'Bearer'; expires_in: number; refresh_token: string }

/** Token endpoint logic: RFC 8693 token exchange of a signin token, and the RFC 6749 refresh_token grant. */
export class OAuthService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
    private readonly settings: TokenSettings,
  ) {}

  async token(params: Record<string, unknown>, ip?: string): Promise<TokenResponse> {
    const text = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '')
    const grant = text('grant_type')
    if (!grant) throw new OAuthError('invalid_request', 'grant_type is required')
    if (grant === REFRESH_TOKEN_GRANT) return this.refresh(text('refresh_token'), ip)
    if (grant !== TOKEN_EXCHANGE_GRANT) throw new OAuthError('unsupported_grant_type', `grant_type must be ${TOKEN_EXCHANGE_GRANT} or ${REFRESH_TOKEN_GRANT}`)
    const subject = text('subject_token')
    if (!subject) throw new OAuthError('invalid_request', 'subject_token is required')
    // subject_token_type is optional here; when present it must name the kind of token we accept.
    const subjectType = text('subject_token_type')
    if (subjectType && subjectType !== ACCESS_TOKEN_URN && subjectType !== SIGNIN_TOKEN_TYPE) throw new OAuthError('invalid_request', 'unsupported subject_token_type')

    const row = await this.tokens.validate(subject, SIGNIN_TOKEN_TYPE)
    const userId = row ? await this.tokens.userIdOf(row) : undefined
    const user = userId === undefined ? undefined : await this.users.findById(userId)
    if (!row || !user || !user.isEnabled) throw new OAuthError('invalid_grant', 'subject_token is invalid, expired or already used')
    await this.tokens.revoke(row) // single use: a replay of the same signin token must fail

    const session = await this.sessions.create({ userId: Number(user.id), ip, relativeExpiration: this.settings.refreshTtl })
    const access = await this.tokens.issueAccess(Number(user.id), user.uuid, session.uuid)
    const refresh = await this.tokens.issueRefresh(Number(user.id), user.uuid, session.uuid)
    return { access_token: access.value, issued_token_type: ACCESS_TOKEN_URN, token_type: 'Bearer', expires_in: access.expiresIn, refresh_token: refresh.value }
  }

  /**
   * Trades a live refresh token for a new access token and a new refresh token of the same session. The refresh token
   * is single use (it is revoked here), and the session records a hit, which keeps it from lapsing while it is in use.
   */
  private async refresh(refreshToken: string, ip?: string): Promise<TokenResponse> {
    if (!refreshToken) throw new OAuthError('invalid_request', 'refresh_token is required')
    const invalid = () => new OAuthError('invalid_grant', 'refresh_token is invalid, expired or already used')
    const claims = verifyJwt(refreshToken, this.settings.jwtSecret)
    const row = claims ? await this.tokens.validate(refreshToken, REFRESH_TOKEN_TYPE) : undefined
    const userId = row ? await this.tokens.userIdOf(row) : undefined
    const user = userId === undefined ? undefined : await this.users.findById(userId)
    if (!claims || !row || !user || !user.isEnabled) throw invalid()
    if (!(await this.sessions.hit(claims.sid, ip))) throw invalid() // the session was signed out or lapsed
    await this.tokens.revoke(row)

    const access = await this.tokens.issueAccess(Number(user.id), user.uuid, claims.sid)
    const refresh = await this.tokens.issueRefresh(Number(user.id), user.uuid, claims.sid)
    return { access_token: access.value, issued_token_type: ACCESS_TOKEN_URN, token_type: 'Bearer', expires_in: access.expiresIn, refresh_token: refresh.value }
  }
}
