import { SIGNIN_TOKEN_TYPE, type TokenService, type TokenSettings } from './tokens.ts'
import type { SessionService } from './sessions.ts'
import type { UsersService } from './users.ts'

export const TOKEN_EXCHANGE_GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange'
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

/** Token endpoint logic. Only RFC 8693 token exchange of a signin token is supported. */
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
    if (grant !== TOKEN_EXCHANGE_GRANT) throw new OAuthError('unsupported_grant_type', `grant_type must be ${TOKEN_EXCHANGE_GRANT}`)
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
}
