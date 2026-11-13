import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeScopes, facebookFields, parseClaims, unsupportedClaims } from './identityProviderPresets.ts'
import { IdentityProviderError, IdentityProvidersService } from './identityProviders.ts'
import { identityProvider } from '../../generated/types/view/identityProvider.ts'

/** A minimal in-memory repo: read() iterates, create assigns an id, update replaces by id. */
function fakeRepo<T extends { id?: number }>(rows: T[] = []) {
  return {
    rows,
    async *read() {
      for (const r of rows) yield structuredClone(r)
    },
    async create(row: T) {
      const saved = { ...structuredClone(row), id: rows.length + 1 }
      rows.push(saved)
      return saved
    },
    async update(row: T) {
      rows[rows.findIndex((r) => r.id === row.id)] = structuredClone(row)
    },
  }
}

const service = (base = 'https://example.com') =>
  new IdentityProvidersService(fakeRepo<any>() as any, fakeRepo<any>([{ id: 1, name: 'oidc' }, { id: 2, name: 'oauth2' }]) as any, base)

const google = { preset: 'google', clientId: 'cid', clientSecret: 'sec' }

test('claims: parse, reject unknown, dedupe', () => {
  assert.deepEqual(parseClaims('email, first_name,email'), ['email', 'first_name'])
  assert.throws(() => parseClaims('email,phone'), /unknown claim: phone/)
})

test('scopes per preset', () => {
  assert.equal(computeScopes('google', 'oidc', ['email']).join(' '), 'openid email')
  assert.equal(computeScopes('google', 'oidc', ['email', 'first_name', 'last_name', 'avatar']).join(' '), 'openid email profile')
  assert.equal(computeScopes('facebook', 'oauth2', ['email', 'avatar']).join(' '), 'public_profile email')
  assert.equal(computeScopes('apple', 'oidc', ['email', 'first_name', 'last_name']).join(' '), 'email name')
  assert.equal(computeScopes('custom', 'oauth2', ['email'], ['read:user']).join(' '), 'read:user')
  assert.equal(computeScopes('google', 'oidc', ['email'], ['openid', 'calendar']).join(' '), 'openid email calendar')
})

test('claims a provider cannot supply', () => {
  assert.deepEqual(unsupportedClaims('apple', 'oidc', ['email', 'avatar']), ['avatar'])
  assert.deepEqual(unsupportedClaims('custom', 'oauth2', ['avatar']), [])
  assert.equal(facebookFields(['email', 'avatar']), 'id,email,picture.type(large)')
})

test('create fills a google preset and defaults the claims to email', async () => {
  const s = service()
  const { provider, warnings } = await s.create('google', google)
  assert.deepEqual(warnings, [])
  assert.equal(provider.identityProviderTypeName, 'oidc')
  assert.equal(provider.settings.authorize_url, 'https://accounts.google.com/o/oauth2/v2/auth')
  assert.equal(provider.settings.claims, 'email')
  assert.equal(provider.settings.scopes, 'openid email')
  assert.equal(provider.settings.redirect_uri, 'https://example.com/api/identity-providers/google/callback')
  assert.equal(provider.settings.display_name, 'Google')
})

test('create validates its input', async () => {
  const s = service()
  await assert.rejects(s.create('Google', google), /name must be/)
  await assert.rejects(s.create('google', { preset: 'google', clientId: 'x' }), /--client-secret is required/)
  await assert.rejects(s.create('google', { ...google, preset: 'nope' }), /unknown preset/)
  await assert.rejects(s.create('google', { ...google, type: 'oauth2' }), /preset google is oidc/)
  await assert.rejects(s.create('google', { ...google, claims: 'ssn' }), /unknown claim/)
  await assert.rejects(service('').create('google', google), /callback URL is unknown/)
  await assert.rejects(s.create('corp', { clientId: 'a', clientSecret: 'b' }), /custom oidc provider needs --authorize-url, --token-url/)
  await assert.rejects(s.create('corp', { clientId: 'a', clientSecret: 'b', type: 'oauth2', authorizeUrl: 'x', tokenUrl: 'y' }), /--userinfo-url/)
  await s.create('google', google)
  await assert.rejects(s.create('google', google), /already exists/)
})

test('apple warns that avatar is unavailable but still adds it', async () => {
  const { warnings, provider } = await service().create('apple', { preset: 'apple', clientId: 'a', clientSecret: 'b', claims: 'email,avatar' })
  assert.match(warnings[0]!, /apple cannot supply: avatar/)
  assert.equal(provider.settings.scopes, 'email')
  assert.equal(provider.settings.response_mode, 'form_post')
})

test('update edits a copy of the settings and recomputes scopes from claims', async () => {
  const s = service()
  await s.create('google', google)
  const { provider, changed } = await s.update('google', { claims: 'email,first_name', imageUrl: 'https://img/g.png', set: ['hd=example.com'] })
  assert.equal(provider.settings.scopes, 'openid email profile')
  assert.equal(provider.settings.image_url, 'https://img/g.png')
  assert.equal(provider.settings.hd, 'example.com')
  assert.equal(provider.settings.client_secret, 'sec') // untouched settings survive the whole-map rewrite
  assert.ok(changed.includes('scopes') && changed.includes('hd') && !changed.includes('client_secret'))
  const next = await s.update('google', { unset: ['hd'], isEnabled: false })
  assert.equal(next.provider.settings.hd, undefined)
  assert.equal(next.provider.isEnabled, false)
})

test('update refuses empty, unknown, managed and required changes', async () => {
  const s = service()
  await s.create('google', google)
  await assert.rejects(s.update('google', {}), /nothing to update/)
  await assert.rejects(s.update('google', { clientId: 'cid' }), /nothing to update/)
  await assert.rejects(s.update('nope', { clientId: 'x' }), /not found/)
  await assert.rejects(s.update('google', { preset: 'apple' }), /cannot change the preset/)
  await assert.rejects(s.update('google', { set: ['scopes=x'] }), /managed by --claims/)
  await assert.rejects(s.update('google', { unset: ['client_secret'] }), /cannot be unset/)
  await assert.rejects(s.update('google', { set: ['novalue'] }), /key=value/)
})

test('extra scopes are kept across later claim changes', async () => {
  const s = service()
  await s.create('google', { ...google, scopes: 'calendar' })
  const { provider } = await s.update('google', { claims: 'email,avatar' })
  assert.equal(provider.settings.scopes, 'openid email profile calendar')
  assert.equal(provider.settings.extra_scopes, 'calendar')
  assert.ok(IdentityProviderError && identityProvider)
})
