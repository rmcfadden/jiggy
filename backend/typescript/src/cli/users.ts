import { parseArgs } from 'node:util'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Group } from '../../generated/types/datasource/group.ts'
import type { Role } from '../../generated/types/datasource/role.ts'
import type { SecretType } from '../../generated/types/datasource/secretType.ts'
import type { UserSecret } from '../../generated/types/datasource/userSecret.ts'
import type { Secret } from '../../generated/types/view/secret.ts'
import type { User } from '../../generated/types/view/user.ts'
import { SetupService } from '../services/setup.ts'
import { UserError, UsersService } from '../services/users.ts'

type IdentityDatasource = Datasource & {
  users: ICRUDRepository<User>
  roles: ICRUDRepository<Role>
  groups: ICRUDRepository<Group>
  secrets: ICRUDRepository<Secret>
  secretTypes: ICRUDRepository<SecretType>
  userSecrets: ICRUDRepository<UserSecret>
}

export function createUsersService(): UsersService {
  const ds = Datasource.default as IdentityDatasource
  return new UsersService(ds.users, ds.roles, ds.groups, ds.secrets, ds.secretTypes, ds.userSecrets)
}

export function createSetupService(): SetupService {
  const ds = Datasource.default as IdentityDatasource
  return new SetupService(ds.roles, ds.groups, createUsersService())
}

const list = (value: string | undefined) => (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)

function parseBool(name: string, value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  throw new UserError(`--${name} must be true or false, got "${value}"`)
}

function parse(usage: string) {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(3),
      allowPositionals: true,
      options: { password: { type: 'string' }, groups: { type: 'string' }, roles: { type: 'string' }, is_enabled: { type: 'string' } },
    })
    if (positionals.length !== 1) throw new UserError(`usage: ${usage}`)
    return { username: positionals[0]!, values }
  } catch (error) {
    if (error instanceof UserError) throw error
    throw new UserError(`${(error as Error).message}\nusage: ${usage}`)
  }
}

/** Wraps a command so a UserError prints its message and exits 1 instead of a stack trace. */
function guarded(run: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await run()
    } catch (error) {
      if (!(error instanceof UserError)) throw error
      console.error(error.message)
      process.exit(1)
    }
  }
}

export const addUser = guarded(async () => {
  const { username, values } = parse('add-user <username> --password=<pw> [--groups=a,b] [--roles=a,b] [--is_enabled=true|false]')
  if (values.password === undefined) throw new UserError('--password is required')
  const created = await createUsersService().create({
    username,
    password: values.password,
    groups: list(values.groups),
    roles: list(values.roles),
    isEnabled: parseBool('is_enabled', values.is_enabled),
  })
  console.log(`added user ${created.username} (id ${created.id})`)
})

export const updateUser = guarded(async () => {
  const { username, values } = parse('update-user <username> [--password=<pw>] [--is_enabled=true|false]')
  if (values.groups !== undefined || values.roles !== undefined) throw new UserError('update-user only changes --password and --is_enabled')
  const updated = await createUsersService().update(username, { password: values.password, isEnabled: parseBool('is_enabled', values.is_enabled) })
  console.log(`updated user ${updated.username}`)
})
