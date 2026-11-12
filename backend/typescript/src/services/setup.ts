import type { ICRUDRepository } from '@deterministic-code/datasources'
import { randomBytes } from 'node:crypto'
import { group, type Group } from '../../generated/types/datasource/group.ts'
import { role, type Role } from '../../generated/types/datasource/role.ts'
import type { UsersService } from './users.ts'

/** The roles and groups `setup` creates. */
export const DEFAULT_ROLES = ['admin', 'editor']
export const DEFAULT_GROUPS = ['admin', 'support']
export const ADMIN_USERNAME = 'admin'
export const USER_USERNAME = 'user'

/** Seeds the identity data `setup` needs: default roles and groups, and a first admin user. */
export class SetupService {
  constructor(
    private readonly roles: ICRUDRepository<Role>,
    private readonly groups: ICRUDRepository<Group>,
    private readonly users: UsersService,
  ) {}

  /** Adds the default roles and groups that are missing; returns what it added. */
  async addDefaults(): Promise<{ roles: string[]; groups: string[] }> {
    return {
      roles: await this.addMissing(this.roles, DEFAULT_ROLES, (name) => role({ name })),
      groups: await this.addMissing(this.groups, DEFAULT_GROUPS, (name) => group({ name })),
    }
  }

  /**
   * Creates the `admin` user (role and group `admin`) when there are no users at all.
   * Uses `password` when given, otherwise a random one that is returned so the caller can show it once.
   */
  async addAdmin(password?: string): Promise<{ password: string; generated: boolean } | undefined> {
    if (await this.users.hasUsers()) return undefined
    const generated = !password
    const chosen = password || randomBytes(15).toString('base64url')
    await this.users.create({ username: ADMIN_USERNAME, password: chosen, roles: ['admin'], groups: ['admin'] })
    return { password: chosen, generated }
  }

  /**
   * Creates the plain `user` account (no roles, no groups) when it does not exist yet.
   * Uses `password` when given, otherwise a random one that is returned so the caller can show it once.
   */
  async addUser(password?: string): Promise<{ password: string; generated: boolean } | undefined> {
    if (await this.users.find(USER_USERNAME)) return undefined
    const generated = !password
    const chosen = password || randomBytes(15).toString('base64url')
    await this.users.create({ username: USER_USERNAME, password: chosen, roles: [], groups: [] })
    return { password: chosen, generated }
  }

  private async addMissing<T extends { name: string }>(repo: ICRUDRepository<T>, names: string[], make: (name: string) => T): Promise<string[]> {
    const have = new Set<string>()
    for await (const row of repo.read()) have.add(row.name)
    const added: string[] = []
    for (const name of names) {
      if (have.has(name)) continue
      await repo.create(make(name))
      added.push(name)
    }
    return added
  }
}
