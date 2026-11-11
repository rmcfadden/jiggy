import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { Contact } from '../../generated/types/view/contact.ts'
import type { Email } from '../../generated/types/view/email.ts'
import type { TokenService, IssuedToken } from './tokens.ts'
import type { UsersService } from './users.ts'

/** Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token. */
export class SigninService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly contacts: ICRUDRepository<Contact>,
    private readonly emails: ICRUDRepository<Email>,
  ) {}

  /** `credentials.username` may be a username or an email address. Returns undefined for an unknown user, a wrong password or a disabled account (callers must not distinguish them). */
  async signin(credentials: { username: string; password: string }): Promise<IssuedToken | undefined> {
    const username = await this.resolveUsername(credentials.username.trim())
    const ok = await this.users.verifyPassword(username, credentials.password)
    const user = ok ? await this.users.find(username) : undefined
    if (!user || !user.isEnabled) return undefined
    return this.tokens.issueSignin(Number(user.id))
  }

  /** A username stays as it is; an email address is mapped to its owner (emails.contact_id -> contacts.user_id). */
  private async resolveUsername(identifier: string): Promise<string> {
    if (!identifier.includes('@') || (await this.users.find(identifier))) return identifier
    const address = identifier.toLowerCase()
    let contactId: number | undefined
    for await (const row of this.emails.read()) {
      if (row.address.toLowerCase() === address) contactId = Number(row.contactId)
    }
    if (contactId === undefined) return identifier
    for await (const row of this.contacts.read()) {
      if (Number(row.id) === contactId) return (await this.users.findById(Number(row.userId)))?.username ?? identifier
    }
    return identifier
  }
}
