import type { Session } from './session'

const TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange'

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

export const authApi = {
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
