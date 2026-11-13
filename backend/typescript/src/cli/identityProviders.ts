import { parseArgs } from 'node:util'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { IdentityProviderType } from '../../generated/types/datasource/identityProviderType.ts'
import type { IdentityProvider } from '../../generated/types/view/identityProvider.ts'
import { IdentityProviderError, IdentityProvidersService, type ProviderInput, type ProviderResult } from '../services/identityProviders.ts'

const ADD_USAGE =
  'add-identity-provider <name> --preset=google|facebook|apple|custom --client-id=<id> --client-secret=<secret> [--type=oidc|oauth2] ' +
  '[--image-url=<url>] [--display-name=<label>] [--claims=email,first_name,last_name,avatar] [--scopes="a b"] ' +
  '[--authorize-url=..] [--token-url=..] [--userinfo-url=..] [--issuer=..] [--jwks-url=..] [--redirect-uri=..] ' +
  '[--set key=value]... [--description=<text>] [--is_enabled=true|false]'
const UPDATE_USAGE =
  'update-identity-provider <name> [--client-id=<id>] [--client-secret=<secret>] [--image-url=<url>] [--display-name=<label>] [--claims=..] [--scopes="a b"] ' +
  '[--authorize-url=..] [--token-url=..] [--userinfo-url=..] [--issuer=..] [--jwks-url=..] [--redirect-uri=..] ' +
  '[--set key=value]... [--unset key]... [--description=<text>] [--is_enabled=true|false]'

type IdentityDatasource = Datasource & {
  identityProviders: ICRUDRepository<IdentityProvider>
  identityProviderTypes: ICRUDRepository<IdentityProviderType>
}

export function createIdentityProvidersService(): IdentityProvidersService {
  const ds = Datasource.default as IdentityDatasource
  return new IdentityProvidersService(ds.identityProviders, ds.identityProviderTypes)
}

const text = { type: 'string' } as const
const OPTIONS = {
  preset: text,
  type: text,
  description: text,
  is_enabled: text,
  'client-id': text,
  'client-secret': text,
  'image-url': text,
  'display-name': text,
  claims: text,
  scopes: text,
  'authorize-url': text,
  'token-url': text,
  'userinfo-url': text,
  issuer: text,
  'jwks-url': text,
  'redirect-uri': text,
  set: { type: 'string', multiple: true },
  unset: { type: 'string', multiple: true },
} as const

function parseBool(name: string, value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  throw new IdentityProviderError(`--${name} must be true or false, got "${value}"`)
}

export function parse(argv: string[], usage: string): { name: string; input: ProviderInput } {
  try {
    const { values: v, positionals } = parseArgs({ args: argv, allowPositionals: true, options: OPTIONS })
    if (positionals.length !== 1) throw new IdentityProviderError(`usage: ${usage}`)
    return {
      name: positionals[0]!,
      input: {
        preset: v.preset,
        type: v.type,
        description: v.description,
        isEnabled: parseBool('is_enabled', v.is_enabled),
        clientId: v['client-id'],
        clientSecret: v['client-secret'],
        imageUrl: v['image-url'],
        displayName: v['display-name'],
        claims: v.claims,
        scopes: v.scopes,
        authorizeUrl: v['authorize-url'],
        tokenUrl: v['token-url'],
        userinfoUrl: v['userinfo-url'],
        issuer: v.issuer,
        jwksUrl: v['jwks-url'],
        redirectUri: v['redirect-uri'],
        set: v.set,
        unset: v.unset,
      },
    }
  } catch (error) {
    if (error instanceof IdentityProviderError) throw error
    throw new IdentityProviderError(`${(error as Error).message}\nusage: ${usage}`)
  }
}

/** Setting names that hold credentials; their values are never printed. */
const SECRET_SETTINGS = new Set(['client_secret'])

function report(verb: string, name: string, result: ProviderResult): void {
  const changed = result.changed.map((k) => (SECRET_SETTINGS.has(k) ? `${k} (hidden)` : k))
  console.log(`${verb} identity provider ${name} (id ${result.provider.id}); ${verb === 'added' ? 'settings' : 'changed'}: ${changed.join(', ')}`)
  for (const warning of result.warnings) console.error(`warning: ${warning}`)
}

/** Wraps a command so an IdentityProviderError prints its message and exits 1 instead of a stack trace. */
function guarded(run: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await run()
    } catch (error) {
      if (!(error instanceof IdentityProviderError)) throw error
      console.error(error.message)
      process.exit(1)
    }
  }
}

export const addIdentityProvider = guarded(async () => {
  const { name, input } = parse(process.argv.slice(3), ADD_USAGE)
  report('added', name, await createIdentityProvidersService().create(name, input))
})

export const updateIdentityProvider = guarded(async () => {
  const { name, input } = parse(process.argv.slice(3), UPDATE_USAGE)
  report('updated', name, await createIdentityProvidersService().update(name, input))
})
