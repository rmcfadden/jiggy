import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { IdentityProviderType } from '../../generated/types/datasource/identityProviderType.ts'
import { identityProvider, type IdentityProvider } from '../../generated/types/view/identityProvider.ts'
import {
  CUSTOM_REQUIRED,
  DEFAULT_CLAIMS,
  IdentityProviderError,
  MANAGED_SETTINGS,
  PRESETS,
  PROVIDER_TYPES,
  SETTING_NAME,
  computeScopes,
  facebookFields,
  parseClaims,
  unsupportedClaims,
  type Claim,
  type ProviderType,
} from './identityProviderPresets.ts'

export { IdentityProviderError }

/** What the add and update commands accept; every field except `name` is optional on update. */
export type ProviderInput = {
  preset?: string
  type?: string
  description?: string
  isEnabled?: boolean
  clientId?: string
  clientSecret?: string
  imageUrl?: string
  displayName?: string
  claims?: string
  scopes?: string
  authorizeUrl?: string
  tokenUrl?: string
  userinfoUrl?: string
  issuer?: string
  jwksUrl?: string
  redirectUri?: string
  /** `key=value` pairs from `--set`. */
  set?: string[]
  /** Setting names from `--unset`. */
  unset?: string[]
}

export type ProviderResult = { provider: IdentityProvider; warnings: string[]; changed: string[] }

const words = (value: string) => value.split(/[\s,]+/).filter(Boolean)

/** Registers and edits sign-in providers; everything about a provider but its flags lives in its settings map. */
export class IdentityProvidersService {
  constructor(
    private readonly providers: ICRUDRepository<IdentityProvider>,
    private readonly types: ICRUDRepository<IdentityProviderType>,
    private readonly siteBaseUrl: string | undefined = process.env.SITE_BASE_URL,
  ) {}

  async find(name: string): Promise<IdentityProvider | undefined> {
    for await (const row of this.providers.read()) if (row.name === name) return row
    return undefined
  }

  async create(name: string, input: ProviderInput): Promise<ProviderResult> {
    name = name.trim()
    if (!/^[a-z][a-z0-9_-]*$/.test(name)) throw new IdentityProviderError('name must be lowercase letters, digits, - or _, starting with a letter (e.g. google)')
    const existing = await this.find(name)
    if (existing) throw new IdentityProviderError(`identity provider "${name}" already exists${existing.isDeleted ? ' (deleted)' : ''}`)

    const presetName = input.preset ?? 'custom'
    const preset = PRESETS[presetName]
    if (!preset && presetName !== 'custom') throw new IdentityProviderError(`unknown preset "${presetName}" (choose from ${[...Object.keys(PRESETS), 'custom'].join(', ')})`)
    const type = this.checkType(input.type ?? preset?.type ?? 'oidc')
    if (preset && input.type && input.type !== preset.type) throw new IdentityProviderError(`preset ${presetName} is ${preset.type}; drop --type or use --preset=custom`)
    if (!input.clientId) throw new IdentityProviderError('--client-id is required')
    if (!input.clientSecret) throw new IdentityProviderError('--client-secret is required')

    const claims = input.claims === undefined ? DEFAULT_CLAIMS : parseClaims(input.claims)
    const extra = words(input.scopes ?? '')
    const settings: Record<string, string> = {
      ...preset?.settings,
      preset: presetName,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      display_name: input.displayName ?? preset?.displayName ?? name,
      claims: claims.join(','),
    }
    const imageUrl = input.imageUrl ?? preset?.imageUrl
    if (imageUrl) settings.image_url = imageUrl
    this.applyEndpoints(settings, input)
    const redirect = input.redirectUri ?? (this.siteBaseUrl?.trim() ? `${this.siteBaseUrl!.replace(/\/+$/, '')}/api/identity-providers/${name}/callback` : undefined)
    if (!redirect) throw new IdentityProviderError('the callback URL is unknown: pass --redirect-uri or set SITE_BASE_URL')
    settings.redirect_uri = redirect
    this.applyScopes(settings, presetName, type, claims, extra, input.scopes !== undefined)
    this.applySet(settings, input)

    if (presetName === 'custom') {
      const missing = CUSTOM_REQUIRED[type].filter((key) => !settings[key])
      if (type === 'oidc' && !settings.issuer && !settings.jwks_url) missing.push('issuer (or jwks_url)')
      if (missing.length) throw new IdentityProviderError(`a custom ${type} provider needs ${missing.map((m) => `--${m.replace(/_/g, '-')}`).join(', ')}`)
    }

    await this.requireType(type)
    const created = await this.providers.create(
      identityProvider({
        name,
        description: input.description ?? null,
        identityProviderTypeName: type,
        isEnabled: input.isEnabled ?? true,
        isBuiltin: false,
        isDeleted: false,
        settings,
      }),
    )
    return { provider: created, warnings: this.warn(presetName, type, claims), changed: Object.keys(settings) }
  }

  async update(name: string, input: ProviderInput): Promise<ProviderResult> {
    const existing = await this.find(name.trim())
    if (!existing || existing.isDeleted) throw new IdentityProviderError(`identity provider "${name}" not found`)
    if (input.preset !== undefined || input.type !== undefined) throw new IdentityProviderError('update-identity-provider cannot change the preset or type; add a new provider instead')

    // Update replaces the whole dictionary, so edit a copy of the stored map and write all of it back.
    const settings: Record<string, string> = { ...existing.settings }
    const before = { ...settings }
    const presetName = settings.preset ?? 'custom'
    const type = this.checkType(existing.identityProviderTypeName)
    if (input.clientId !== undefined) settings.client_id = input.clientId
    if (input.clientSecret !== undefined) settings.client_secret = input.clientSecret
    if (input.imageUrl !== undefined) settings.image_url = input.imageUrl
    if (input.displayName !== undefined) settings.display_name = input.displayName
    if (input.redirectUri !== undefined) settings.redirect_uri = input.redirectUri
    this.applyEndpoints(settings, input)

    const claims = input.claims === undefined ? parseClaims(settings.claims ?? '') : parseClaims(input.claims)
    const extra = input.scopes === undefined ? words(settings.extra_scopes ?? '') : words(input.scopes)
    if (input.claims !== undefined) settings.claims = claims.join(',')
    if (input.claims !== undefined || input.scopes !== undefined) this.applyScopes(settings, presetName, type, claims, extra, input.scopes !== undefined)
    this.applySet(settings, input)

    const changedSettings = [...new Set([...Object.keys(settings), ...Object.keys(before)])].filter((k) => settings[k] !== before[k])
    const flags: string[] = []
    const next = { ...existing }
    if (input.isEnabled !== undefined && input.isEnabled !== existing.isEnabled) {
      next.isEnabled = input.isEnabled
      flags.push('is_enabled')
    }
    if (input.description !== undefined && input.description !== existing.description) {
      next.description = input.description
      flags.push('description')
    }
    if (!changedSettings.length && !flags.length) throw new IdentityProviderError('nothing to update: pass at least one option that changes a value')
    next.settings = settings
    await this.providers.update(next)
    return { provider: next, warnings: this.warn(presetName, type, claims), changed: [...flags, ...changedSettings] }
  }

  private checkType(type: string): ProviderType {
    if (!(PROVIDER_TYPES as readonly string[]).includes(type)) throw new IdentityProviderError(`--type must be ${PROVIDER_TYPES.join(' or ')}, got "${type}"`)
    return type as ProviderType
  }

  /** The view is written by type name, so only check the lookup row exists (it comes from the seeds). */
  private async requireType(name: string): Promise<void> {
    for await (const row of this.types.read()) if (row.name === name) return
    throw new IdentityProviderError(`identity provider type "${name}" is missing; run the migrations`)
  }

  private applyEndpoints(settings: Record<string, string>, input: ProviderInput): void {
    if (input.authorizeUrl !== undefined) settings.authorize_url = input.authorizeUrl
    if (input.tokenUrl !== undefined) settings.token_url = input.tokenUrl
    if (input.userinfoUrl !== undefined) settings.userinfo_url = input.userinfoUrl
    if (input.issuer !== undefined) settings.issuer = input.issuer
    if (input.jwksUrl !== undefined) settings.jwks_url = input.jwksUrl
  }

  /** Stores the extra scopes as given and the full scope list the sign-in flow will request. */
  private applyScopes(settings: Record<string, string>, preset: string, type: ProviderType, claims: Claim[], extra: string[], extraGiven: boolean): void {
    if (extraGiven) {
      if (extra.length) settings.extra_scopes = extra.join(' ')
      else delete settings.extra_scopes
    }
    settings.scopes = computeScopes(preset, type, claims, extra).join(' ')
    if (preset === 'facebook') settings.userinfo_fields = facebookFields(claims)
  }

  /** `--set key=value` adds or overwrites a setting; `--unset key` removes one. The CLI-managed names are refused. */
  private applySet(settings: Record<string, string>, input: ProviderInput): void {
    for (const pair of input.set ?? []) {
      const at = pair.indexOf('=')
      const key = at < 0 ? pair : pair.slice(0, at)
      if (at < 0 || !key || !pair.slice(at + 1)) throw new IdentityProviderError(`--set needs key=value, got "${pair}"`)
      this.checkSettingName(key)
      settings[key] = pair.slice(at + 1)
    }
    for (const key of input.unset ?? []) {
      this.checkSettingName(key)
      if (['client_id', 'client_secret', 'redirect_uri'].includes(key)) throw new IdentityProviderError(`${key} is required and cannot be unset`)
      delete settings[key]
    }
  }

  private checkSettingName(key: string): void {
    if (!SETTING_NAME.test(key)) throw new IdentityProviderError(`setting name "${key}" must be lowercase letters, digits and _`)
    if (MANAGED_SETTINGS.has(key)) throw new IdentityProviderError(`"${key}" is managed by --claims/--scopes; use those options`)
  }

  private warn(preset: string, type: ProviderType, claims: Claim[]): string[] {
    const missing = unsupportedClaims(preset, type, claims)
    return missing.length ? [`${preset} cannot supply: ${missing.join(', ')}; those claims will be skipped`] : []
  }
}
