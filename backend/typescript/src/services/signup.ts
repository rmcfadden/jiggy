import { randomInt } from 'node:crypto'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { EmailType } from '../../generated/types/datasource/emailType.ts'
import type { Gender } from '../../generated/types/datasource/gender.ts'
import { contact, type Contact } from '../../generated/types/view/contact.ts'
import { email, type Email } from '../../generated/types/view/email.ts'
import type { IssuedToken, TokenService } from './tokens.ts'
import { UserError, UserExistsError, type UsersService } from './users.ts'

/** Name of the email type and gender used for contacts created at signup (looked up by name, not id). */
export const SIGNUP_EMAIL_TYPE = 'Personal'
export const SIGNUP_GENDER = 'Other'

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,32}$/
const MAX_EMAIL_LENGTH = 320
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const MAX_GENERATE_ATTEMPTS = 20

export type SignupInput = { username?: string; email?: string; password: string }
export type SignupResult = { username: string; signin: IssuedToken }

/** A rejected signup. `status` is the HTTP status the route should answer with. */
export class SignupError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 409,
  ) {
    super(message)
  }
}

/** Creates a user (and optionally an email contact) and issues the same signin token as /api/signin. */
export class SignupService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly contacts: ICRUDRepository<Contact>,
    private readonly emails: ICRUDRepository<Email>,
    private readonly emailTypes: ICRUDRepository<EmailType>,
    private readonly genders: ICRUDRepository<Gender>,
  ) {}

  async signup(input: SignupInput): Promise<SignupResult> {
    const requested = input.username?.trim() || undefined
    const address = input.email === undefined ? undefined : normalizeEmail(input.email)
    if (!requested && !address) throw new SignupError('username or email is required', 400)
    if (requested && !USERNAME_PATTERN.test(requested)) {
      throw new SignupError('username must be 3-32 characters: letters, digits, "_", "." or "-"', 400)
    }

    // Everything that can be checked before touching the database happens first.
    const emailTypeId = address ? await this.idByName(this.emailTypes, SIGNUP_EMAIL_TYPE, 'email type') : 0
    const genderId = address ? await this.idByName(this.genders, SIGNUP_GENDER, 'gender') : 0
    if (address && (await this.emailTaken(address))) throw new SignupError('email is already registered', 409)

    const created = await this.createUser(requested, address, input.password)
    try {
      if (address) await this.storeEmail(created.id, created.username, address, emailTypeId, genderId)
      const signin = await this.tokens.issueSignin(Number(created.id))
      return { username: created.username, signin }
    } catch (error) {
      await this.users.remove(created) // do not leave an account the caller never learned about
      throw error
    }
  }

  /** Uses the requested username, or derives one from the email, retrying with a random suffix on collisions. */
  private async createUser(requested: string | undefined, address: string | undefined, password: string) {
    try {
      if (requested) return await this.users.create({ username: requested, password })
      const base = usernameFromEmail(address!)
      for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
        const username = attempt === 0 ? base : `${base.slice(0, 27)}-${suffix()}`
        try {
          return await this.users.create({ username, password })
        } catch (error) {
          if (!(error instanceof UserExistsError)) throw error
        }
      }
      throw new SignupError('could not generate a unique username; please choose one', 409)
    } catch (error) {
      if (error instanceof UserExistsError) throw new SignupError('username is already taken', 409)
      if (error instanceof UserError) throw new SignupError(error.message, 400)
      throw error
    }
  }

  private async storeEmail(userId: number, username: string, address: string, emailTypeId: number, genderId: number): Promise<void> {
    const savedContact = await this.contacts.create(contact({ name: username, givenName: username, genderTypeId: genderId, userId }))
    try {
      await this.emails.create(email({ emailTypeId, contactId: savedContact.id, address, isPrimary: true }))
    } catch (error) {
      await this.contacts.delete(savedContact)
      throw error
    }
  }

  private async emailTaken(address: string): Promise<boolean> {
    for await (const row of this.emails.read()) if (row.address.toLowerCase() === address) return true
    return false
  }

  private async idByName<T extends { id: number; name: string }>(repo: ICRUDRepository<T>, name: string, kind: string): Promise<number> {
    for await (const row of repo.read()) if (row.name === name) return Number(row.id)
    throw new Error(`${kind} "${name}" is missing; run the migrations`)
  }
}

/** Trims and lowercases an address and applies basic shape checks (one "@", non-empty parts, a dot in the domain). */
export function normalizeEmail(raw: string): string {
  const address = raw.trim().toLowerCase()
  const at = address.indexOf('@')
  const local = address.slice(0, at)
  const domain = address.slice(at + 1)
  const valid =
    at > 0 &&
    address.length <= MAX_EMAIL_LENGTH &&
    at === address.lastIndexOf('@') &&
    !/\s/.test(address) &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.') &&
    local.length > 0
  if (!valid) throw new SignupError('email address is not valid', 400)
  return address
}

/** The email's local part reduced to username characters, padded to the minimum length; "user" if nothing is left. */
export function usernameFromEmail(address: string): string {
  const cleaned = address.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 32)
  if (!cleaned) return 'user'
  return cleaned.length >= 3 ? cleaned : `${cleaned}${suffix()}`.slice(0, 32)
}

function suffix(): string {
  let out = ''
  for (let i = 0; i < 4; i++) out += SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)]
  return out
}
