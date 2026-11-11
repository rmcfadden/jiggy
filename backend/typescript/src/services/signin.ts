import type { TokenService, IssuedToken } from './tokens.ts'
import type { UsersService } from './users.ts'

/** Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token. */
export class SigninService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  /** Returns undefined for an unknown user, a wrong password or a disabled account (callers must not distinguish them). */
  async signin(credentials: { username: string; password: string }): Promise<IssuedToken | undefined> {
    const username = credentials.username.trim()
    const ok = await this.users.verifyPassword(username, credentials.password)
    const user = ok ? await this.users.find(username) : undefined
    if (!user || !user.isEnabled) return undefined
    return this.tokens.issueSignin(Number(user.id))
  }
}
