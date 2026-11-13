import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { Contact } from '../../generated/types/view/contact.ts'
import type { Email } from '../../generated/types/view/email.ts'
import type { EmailService } from './email.ts'
import type { LogsService } from './logs.ts'
import type { TemplatesService } from './templates.ts'
import { EMAIL_CONFIRMATION_TOKEN_TYPE, type TokenService } from './tokens.ts'
import type { UsersService } from './users.ts'

/** Language of the `confirm_email` template used for every message until accounts carry a language. */
const LANGUAGE = 'en'
const TEMPLATE_TYPE = 'confirm_email'
/** A second email is refused while the last one is younger than this. */
const RESEND_AFTER_MS = 60_000

/** A refused request. `status` is the HTTP status the route should answer with. */
export class ConfirmError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 409 | 429,
  ) {
    super(message)
  }
}

/**
 * Confirming an email address: a short-lived single-use code is mailed as a link; opening it marks the email verified.
 * The code is a token of type `email_confirmation` (only its hash is stored), linked to the email by `email_tokens`.
 */
export class EmailConfirmationService {
  private readonly siteBaseUrl: string

  constructor(
    private readonly tokens: TokenService,
    private readonly users: UsersService,
    private readonly templates: TemplatesService,
    private readonly emails: ICRUDRepository<Email>,
    private readonly contacts: ICRUDRepository<Contact>,
    private readonly mail: EmailService,
    private readonly logs: LogsService,
    siteBaseUrl: string | undefined,
  ) {
    this.siteBaseUrl = (siteBaseUrl || 'http://localhost:5174').replace(/\/+$/, '')
  }

  /**
   * Mails the confirmation link for `emailId` (which belongs to `userId`). Failures are logged, never thrown: an account must
   * not be lost because the mail server is down; the user can ask for another message.
   */
  async send(userId: number, emailId: number, username: string, address: string): Promise<void> {
    try {
      const template = (await this.templates.contentFor(TEMPLATE_TYPE, LANGUAGE)) as { subject?: string; text?: string; html?: string } | undefined
      if (!template) throw new Error(`template "${TEMPLATE_TYPE}" (${LANGUAGE}) is missing; run setup`)
      const issued = await this.tokens.issueEmailConfirmation(userId, emailId)
      const url = `${this.siteBaseUrl}/confirm-email?code=${issued.value}`
      const fill = (text = '', escape = false) => text.replaceAll('{{username}}', escape ? escapeHtml(username) : username).replaceAll('{{confirm_url}}', url)
      await this.mail.send(address, fill(template.subject), fill(template.text), fill(template.html, true))
      await this.logs.information('confirmation email sent', { user_id: String(userId), email_id: String(emailId) })
    } catch (error) {
      await this.logs.error('confirmation email not sent', { user_id: String(userId), email_id: String(emailId), error: error instanceof Error ? error.message : String(error) })
    }
  }

  /** The user's email address and whether it is confirmed, or undefined when the account has no email. */
  async status(userId: number): Promise<{ email: string; verified: boolean } | undefined> {
    const mine = await this.contactIds(userId)
    let found: Email | undefined
    for await (const row of this.emails.read()) if (mine.has(Number(row.contactId)) && (!found || (row.isPrimary && !found.isPrimary))) found = row
    return found && { email: found.address, verified: found.isVerified }
  }

  /** Sends a new link to the user's unverified email, unless one went out in the last minute. */
  async resend(userId: number): Promise<void> {
    const user = await this.users.findById(userId)
    const mine = await this.contactIds(userId)
    let email: Email | undefined
    for await (const row of this.emails.read()) if (mine.has(Number(row.contactId)) && !row.isVerified) email = row
    if (!user || !email) throw new ConfirmError('there is no unconfirmed email on this account', 409)
    const last = await this.tokens.lastEmailConfirmation(Number(email.id))
    if (last && Date.now() - last.getTime() < RESEND_AFTER_MS) throw new ConfirmError('a confirmation email was sent a moment ago; please wait a minute', 429)
    await this.send(userId, Number(email.id), user.username, email.address)
  }

  /** Verifies the email the code was sent for and uses the code up. */
  async confirm(code: string): Promise<void> {
    const refuse = async (reason: string): Promise<never> => {
      await this.logs.information('email confirmation refused', { reason })
      throw new ConfirmError('this confirmation link is invalid, expired or already used', 400)
    }
    const token = await this.tokens.validate(code.trim(), EMAIL_CONFIRMATION_TOKEN_TYPE)
    if (!token) return refuse('unknown, expired or used code')
    const emailId = await this.tokens.emailIdOf(token)
    if (emailId === undefined) return refuse('code is not linked to an email')
    let email: Email | undefined
    for await (const row of this.emails.read()) if (Number(row.id) === emailId) email = row
    if (!email) return refuse('email no longer exists')
    if (!email.isVerified) {
      email.isVerified = true
      await this.emails.update(email)
    }
    await this.tokens.revoke(token)
    await this.logs.information('email confirmed', { email_id: String(emailId) })
  }

  private async contactIds(userId: number): Promise<Set<number>> {
    const ids = new Set<number>()
    for await (const row of this.contacts.read()) if (Number(row.userId) === userId) ids.add(Number(row.id))
    return ids
  }
}

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
