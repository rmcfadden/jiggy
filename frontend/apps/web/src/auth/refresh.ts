import { authApi } from './authApi'
import { loadSession, saveSession, type Session } from './session'

/** A token with less than this left is renewed before it is used. */
export const REFRESH_WINDOW_MS = 10 * 60 * 1000

/** One renewal at a time: a refresh token works once, so two parallel requests must share one renewal. */
let inFlight: Promise<Session> | null = null

async function renew(session: Session): Promise<Session> {
  try {
    const next = await authApi.refresh(session)
    saveSession(next)
    return next
  } catch {
    // Refused, or the network is down. Another tab may have renewed first, so prefer what is stored now; failing that,
    // keep the current token and let the server decide (a 401 sends the user to sign in).
    return loadSession() ?? session
  }
}

/**
 * The access token to send, or null when signed out. A token with under {@link REFRESH_WINDOW_MS} left is first
 * swapped for a fresh one using the refresh token, so a signed-in user who keeps using the app stays signed in.
 */
export async function freshAccessToken(): Promise<string | null> {
  const session = loadSession()
  if (!session) return null
  if (session.expiresAt - Date.now() >= REFRESH_WINDOW_MS) return session.accessToken
  inFlight ??= renew(session).finally(() => {
    inFlight = null
  })
  return (await inFlight).accessToken
}
