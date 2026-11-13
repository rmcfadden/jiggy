import type { Session } from './session'

const TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange'
const REFRESH_GRANT = 'refresh_token'

export type SignupInput = { username?: string; email?: string; password: string }

type Issued = { signin_token: string; expires_in: number; username?: string }
type Tokens = { access_token: string; refresh_token: string; expires_in: number }
type ErrorBody = { error?: string; error_description?: string }

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = (await res.json().catch(() => undefined)) as (T & ErrorBody) | undefined
  if (!res.ok) throw new Error(json?.error_description ?? json?.error ?? `POST ${url} failed: ${res.status}`)
  return json as T
}

/** Trades the single-use signin token for access and refresh tokens (RFC 8693 token exchange). */
async function exchange(signinToken: string, username: string): Promise<Session> {
  const tokens = await post<Tokens>('/api/oauth/token', { grant_type: TOKEN_EXCHANGE, subject_token: signinToken })
  return {
    username,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  }
}

export type SsoProvider = { name: string; displayName: string; imageUrl?: string | null }

export type EmailStatus = { email: string | null; verified: boolean }

export const authApi = {
  /** Uses up the code from a confirmation email; rejects with the server's message when it is invalid, expired or used. */
  confirmEmail: async (code: string): Promise<void> => {
    await post<{ confirmed: boolean }>('/api/emails/confirm', { code })
  },
  /** The signed-in user's email and whether it is confirmed; null when the server cannot say. */
  emailStatus: async (session: Session): Promise<EmailStatus | null> => {
    const res = await fetch('/api/emails/status', { headers: { Authorization: `Bearer ${session.accessToken}` } }).catch(() => undefined)
    if (!res?.ok) return null
    const json = (await res.json().catch(() => undefined)) as Partial<EmailStatus> | undefined
    return typeof json?.verified === 'boolean' ? { email: typeof json.email === 'string' ? json.email : null, verified: json.verified } : null
  },
  /** Asks for a new confirmation email. */
  resendConfirmation: async (session: Session): Promise<void> => {
    const res = await fetch('/api/emails/resend', { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}` } })
    if (!res.ok) {
      const json = (await res.json().catch(() => undefined)) as ErrorBody | undefined
      throw new Error(json?.error_description ?? json?.error ?? `could not send the email (${res.status})`)
    }
  },
  /** The signed-in user's avatar URL, or null when there is none (or the request fails). */
  avatar: async (session: Session): Promise<string | null> => {
    const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.accessToken}` } }).catch(() => undefined)
    if (!res?.ok) return null
    const json = (await res.json().catch(() => undefined)) as { avatar?: unknown } | undefined
    return typeof json?.avatar === 'string' && /^https?:\/\//.test(json.avatar) ? json.avatar : null
  },
  /** The single sign-on providers the backend has configured; empty when the endpoint is missing or fails. */
  ssoProviders: async (): Promise<SsoProvider[]> => {
    const res = await fetch('/api/identity-providers').catch(() => undefined)
    if (!res?.ok) return []
    const json: unknown = await res.json().catch(() => undefined)
    return Array.isArray(json) ? (json as SsoProvider[]).filter((p) => typeof p?.name === 'string' && typeof p.displayName === 'string') : []
  },
  /** Finishes a single sign-on: the callback page hands over the signin token the backend issued. */
  completeSso: (signinToken: string, username: string): Promise<Session> => exchange(signinToken, username),
  /** Trades the refresh token for a new access token and refresh token (RFC 6749 refresh grant); the refresh token is single use. */
  refresh: async (session: Session): Promise<Session> => {
    const tokens = await post<Tokens>('/api/oauth/token', { grant_type: REFRESH_GRANT, refresh_token: session.refreshToken })
    if (typeof tokens?.access_token !== 'string' || typeof tokens.refresh_token !== 'string' || typeof tokens.expires_in !== 'number') throw new Error('the token endpoint sent no tokens')
    return { username: session.username, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: Date.now() + tokens.expires_in * 1000 }
  },
  signin: async (username: string, password: string): Promise<Session> => {
    const issued = await post<Issued>('/api/signin', { username, password })
    return exchange(issued.signin_token, username)
  },
  /** Creates the account, then signs it in. The server returns the (possibly generated) username. */
  signup: async (input: SignupInput): Promise<Session> => {
    const issued = await post<Issued & { username: string }>('/api/signup', input)
    return exchange(issued.signin_token, issued.username)
  },
}
