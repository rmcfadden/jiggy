import type { ICRUDRepository } from '@deterministic-code/datasources'
import bcrypt from 'bcryptjs'
import type { Role } from '../../generated/types/datasource/role.ts'
import type { Group } from '../../generated/types/datasource/group.ts'
import { secret, type Secret } from '../../generated/types/view/secret.ts'
import type { SecretType } from '../../generated/types/datasource/secretType.ts'
import { userSecret, type UserSecret } from '../../generated/types/datasource/userSecret.ts'
import { user, type User } from '../../generated/types/view/user.ts'

/** The secret type that holds a bcrypt password hash (looked up by name, not id). */
export const PASSWORD_SECRET_TYPE = 'password_bcrypt'
/** bcrypt cost factor; a random salt is generated per hash and stored inside the hash string. */
export const BCRYPT_COST = 12
/** bcrypt only uses the first 72 bytes of the input. */
const MAX_PASSWORD_BYTES = 72

export type CreateUserInput = { username: string; password: string; roles?: string[]; groups?: string[]; isEnabled?: boolean }
export type UpdateUserInput = { password?: string; isEnabled?: boolean }

/** A bad argument or a missing/duplicate record; the CLI prints the message and exits 1. */
export class UserError extends Error {}
/** The username is already taken (signup maps this to 409). */
export class UserExistsError extends UserError {}

export class UsersService {
  constructor(
    private readonly users: ICRUDRepository<User>,
    private readonly roles: ICRUDRepository<Role>,
    private readonly groups: ICRUDRepository<Group>,
    private readonly secrets: ICRUDRepository<Secret>,
    private readonly secretTypes: ICRUDRepository<SecretType>,
    private readonly userSecrets: ICRUDRepository<UserSecret>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const username = input.username.trim()
    if (!username) throw new UserError('username is required')
    checkPassword(input.password)
    if (await this.find(username)) throw new UserExistsError(`user "${username}" already exists`)
    const roles = await this.byName(this.roles, input.roles ?? [], 'role')
    const groups = await this.byName(this.groups, input.groups ?? [], 'group')
    const secretTypeId = await this.passwordTypeId()
    const hash = await bcrypt.hash(input.password, BCRYPT_COST)

    const created = await this.users.create(user({ username, isEnabled: input.isEnabled ?? true, settings: {}, roles, groups }))
    try {
      await this.storePassword(created.id, secretTypeId, hash)
    } catch (error) {
      await this.users.delete(created) // do not leave a user nobody can log in as
      throw error
    }
    return created
  }

  async update(username: string, input: UpdateUserInput): Promise<User> {
    if (input.password === undefined && input.isEnabled === undefined) throw new UserError('nothing to update: pass --password and/or --is_enabled')
    if (input.password !== undefined) checkPassword(input.password)
    const existing = await this.find(username)
    if (!existing) throw new UserError(`user "${username}" not found`)
    const secretTypeId = input.password === undefined ? 0 : await this.passwordTypeId()
    const hash = input.password === undefined ? '' : await bcrypt.hash(input.password, BCRYPT_COST)

    let next = existing
    if (input.isEnabled !== undefined && input.isEnabled !== existing.isEnabled) {
      next = { ...existing, isEnabled: input.isEnabled }
      await this.users.update(next)
    }
    if (input.password !== undefined) {
      const current = await this.passwordSecret(existing.id, secretTypeId)
      if (current) await this.secrets.update({ ...current, value: hash })
      else await this.storePassword(existing.id, secretTypeId, hash)
    }
    return next
  }

  /** Deletes a user together with its password secrets (used to roll back a failed signup). */
  async remove(existing: User): Promise<void> {
    const links: UserSecret[] = []
    for await (const link of this.userSecrets.read()) if (Number(link.userId) === Number(existing.id)) links.push(link)
    const ids = new Set(links.map((link) => Number(link.secretId)))
    for (const link of links) await this.userSecrets.delete(link)
    for await (const row of this.secrets.read()) if (ids.has(Number(row.id))) await this.secrets.delete(row)
    await this.users.delete(existing)
  }

  /** True when `plain` matches the user's stored password hash. */
  async verifyPassword(username: string, plain: string): Promise<boolean> {
    const existing = await this.find(username)
    const current = existing ? await this.passwordSecret(existing.id, await this.passwordTypeId()) : undefined
    // Always run one bcrypt comparison so an unknown user costs the same as a wrong password.
    const matches = await bcrypt.compare(plain, current?.value ?? (await dummyHash()))
    return !!current && matches
  }

  async hasUsers(): Promise<boolean> {
    for await (const _ of this.users.read()) return true
    return false
  }

  async findById(id: number): Promise<User | undefined> {
    for await (const row of this.users.read()) if (Number(row.id) === Number(id)) return row
    return undefined
  }

  async find(username: string): Promise<User | undefined> {
    for await (const row of this.users.read()) if (row.username === username) return row
    return undefined
  }

  /** Resolves names to rows; throws listing every unknown name so nothing is half-created. */
  private async byName<T extends { name: string }>(repo: ICRUDRepository<T>, names: string[], kind: string): Promise<T[]> {
    if (!names.length) return []
    const rows = new Map<string, T>()
    for await (const row of repo.read()) rows.set(row.name, row)
    const unknown = names.filter((name) => !rows.has(name))
    if (unknown.length) throw new UserError(`unknown ${kind}${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')} (run "setup" to add the defaults)`)
    return [...new Set(names)].map((name) => rows.get(name)!)
  }

  private async passwordTypeId(): Promise<number> {
    for await (const row of this.secretTypes.read()) if (row.name === PASSWORD_SECRET_TYPE) return Number(row.id)
    throw new UserError(`secret type "${PASSWORD_SECRET_TYPE}" is missing; run the migrations`)
  }

  private async storePassword(userId: number, secretTypeId: number, hash: string): Promise<void> {
    const saved = await this.secrets.create(secret({ secretTypeId, value: hash, expires: null, isEnabled: true, isDeleted: false }))
    try {
      await this.userSecrets.create(userSecret({ userId, secretId: saved.id }))
    } catch (error) {
      await this.secrets.delete(saved)
      throw error
    }
  }

  /** The user's live password secret, if there is one. */
  private async passwordSecret(userId: number, secretTypeId: number): Promise<Secret | undefined> {
    const ids = new Set<number>()
    for await (const link of this.userSecrets.read()) if (Number(link.userId) === Number(userId)) ids.add(Number(link.secretId))
    for await (const row of this.secrets.read()) {
      if (ids.has(Number(row.id)) && Number(row.secretTypeId) === secretTypeId && !row.isDeleted) return row
    }
    return undefined
  }
}

let dummy: Promise<string> | undefined
/** A throwaway hash (never matches a real password) used to equalise timing for unknown users. */
function dummyHash(): Promise<string> {
  return (dummy ??= bcrypt.hash(`unused-${Math.random()}`, BCRYPT_COST))
}

function checkPassword(password: string): void {
  if (!password) throw new UserError('password must not be empty')
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) throw new UserError(`password is longer than ${MAX_PASSWORD_BYTES} bytes (bcrypt limit)`)
}
