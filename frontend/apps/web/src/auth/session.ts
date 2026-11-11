/**
 * The signed-in session as kept in localStorage. The username is stored next to the tokens because the
 * access token's claims carry only ids, not the name to display.
 */
export type Session = {
  username: string
  accessToken: string
  refreshToken: string
  /** When the access token stops being valid, in ms since the epoch. */
  expiresAt: number
}

const KEY = 'jiggy.auth'

const isSession = (v: unknown): v is Session => {
  const s = v as Partial<Session> | null
  return (
    typeof s === 'object' &&
    s !== null &&
    typeof s.username === 'string' &&
    typeof s.accessToken === 'string' &&
    typeof s.refreshToken === 'string' &&
    typeof s.expiresAt === 'number'
  )
}

/** The stored session, or null when there is none or storage is unavailable or holds something else. */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // storage unavailable; the session lasts until the page is closed
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing stored that could be cleared
  }
}

/** The access token for an `Authorization: Bearer` header, or null when signed out. */
export const getAccessToken = (): string | null => loadSession()?.accessToken ?? null
