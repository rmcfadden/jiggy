/** A bad argument or a missing/duplicate provider; the CLI prints the message and exits 1. */
export class IdentityProviderError extends Error {}

export const PROVIDER_TYPES = ['oidc', 'oauth2'] as const
export type ProviderType = (typeof PROVIDER_TYPES)[number]

/** Provider-neutral facts a provider can be asked for; `sub` is always taken. */
export const CLAIMS = ['email', 'first_name', 'last_name', 'avatar'] as const
export type Claim = (typeof CLAIMS)[number]
export const DEFAULT_CLAIMS: Claim[] = ['email']

export type Preset = {
  type: ProviderType
  displayName: string
  /** Default button image, served by the frontend. */
  imageUrl: string
  /** Endpoint settings the preset fills in (setting name -> value). */
  settings: Record<string, string>
  /** Scopes always requested, before the ones derived from claims. */
  baseScopes: string[]
  /** Scope that supplies each claim; a claim missing here cannot be had from this provider. */
  claimScopes: Partial<Record<Claim, string>>
}

/** Keep in step with the Rust and C# copies (identity_providers_cli.rs, IdentityProviderPresets.cs). */
export const PRESETS: Record<string, Preset> = {
  google: {
    type: 'oidc',
    displayName: 'Google',
    imageUrl: '/sso/google.svg',
    settings: {
      issuer: 'https://accounts.google.com',
      authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      token_url: 'https://oauth2.googleapis.com/token',
      userinfo_url: 'https://openidconnect.googleapis.com/v1/userinfo',
      jwks_url: 'https://www.googleapis.com/oauth2/v3/certs',
    },
    baseScopes: ['openid'],
    claimScopes: { email: 'email', first_name: 'profile', last_name: 'profile', avatar: 'profile' },
  },
  facebook: {
    type: 'oauth2',
    displayName: 'Facebook',
    imageUrl: '/sso/facebook.svg',
    settings: {
      authorize_url: 'https://www.facebook.com/v19.0/dialog/oauth',
      token_url: 'https://graph.facebook.com/v19.0/oauth/access_token',
      userinfo_url: 'https://graph.facebook.com/v19.0/me',
    },
    baseScopes: ['public_profile'],
    // first_name, last_name and picture come with public_profile, so only email needs a scope.
    claimScopes: { email: 'email', first_name: 'public_profile', last_name: 'public_profile', avatar: 'public_profile' },
  },
  apple: {
    type: 'oidc',
    displayName: 'Apple',
    imageUrl: '/sso/apple.svg',
    settings: {
      issuer: 'https://appleid.apple.com',
      authorize_url: 'https://appleid.apple.com/auth/authorize',
      token_url: 'https://appleid.apple.com/auth/token',
      jwks_url: 'https://appleid.apple.com/auth/keys',
      response_mode: 'form_post',
    },
    baseScopes: [],
    // Apple sends the name only on the first sign-in and has no avatar.
    claimScopes: { email: 'email', first_name: 'name', last_name: 'name' },
  },
}

/** What a `custom` provider needs: `oauth2` has no id_token, so it must say where userinfo lives. */
export const CUSTOM_REQUIRED: Record<ProviderType, string[]> = {
  oidc: ['authorize_url', 'token_url'],
  oauth2: ['authorize_url', 'token_url', 'userinfo_url'],
}

/** A custom oidc provider uses the standard scopes; a custom oauth2 provider has no standard ones. */
const OIDC_CLAIM_SCOPES: Preset['claimScopes'] = PRESETS.google!.claimScopes

export function parseClaims(value: string): Claim[] {
  const names = value.split(',').map((s) => s.trim()).filter(Boolean)
  const unknown = names.filter((n) => !(CLAIMS as readonly string[]).includes(n))
  if (unknown.length) throw new IdentityProviderError(`unknown claim${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')} (choose from ${CLAIMS.join(', ')})`)
  return [...new Set(names)] as Claim[]
}

/** Claims the provider cannot supply, so the CLI can warn instead of failing. */
export function unsupportedClaims(preset: string, type: ProviderType, claims: Claim[]): Claim[] {
  const map = PRESETS[preset]?.claimScopes ?? (type === 'oidc' ? OIDC_CLAIM_SCOPES : undefined)
  return map ? claims.filter((c) => !map[c]) : [] // a custom oauth2 provider's claims are unknown, so never warn
}

/** The scope list for a provider: base scopes, one per requested claim, then any extra scopes. */
export function computeScopes(preset: string, type: ProviderType, claims: Claim[], extra: string[] = []): string[] {
  const known = PRESETS[preset]
  const base = known ? known.baseScopes : type === 'oidc' ? ['openid'] : []
  const map = known ? known.claimScopes : type === 'oidc' ? OIDC_CLAIM_SCOPES : {}
  const scopes = [...base, ...claims.map((c) => map[c]).filter((s): s is string => !!s), ...extra]
  return [...new Set(scopes)]
}

/** Graph fields to ask Facebook for, from the claims (`id` is always needed). */
export function facebookFields(claims: Claim[]): string {
  const fields = ['id']
  if (claims.includes('email')) fields.push('email')
  if (claims.includes('first_name')) fields.push('first_name')
  if (claims.includes('last_name')) fields.push('last_name')
  if (claims.includes('avatar')) fields.push('picture.type(large)')
  return fields.join(',')
}

export const SETTING_NAME = /^[a-z][a-z0-9_]*$/
/** Settings the CLI manages itself; `--set`/`--unset` must use the options instead. */
export const MANAGED_SETTINGS = new Set(['preset', 'claims', 'scopes', 'extra_scopes', 'userinfo_fields'])
