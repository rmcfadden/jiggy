import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { REFRESH_WINDOW_MS, freshAccessToken } from './refresh'
import { loadSession, saveSession } from './session'

const MIN = 60_000
const sessionWith = (leftMs: number) => ({ username: 'ann', accessToken: 'old', refreshToken: 'r1', expiresAt: Date.now() + leftMs })
const tokens = { access_token: 'new', refresh_token: 'r2', expires_in: 86_400, token_type: 'Bearer' }

let fetchMock: ReturnType<typeof vi.fn>
beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify(tokens)))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('is null when signed out and never calls the server', async () => {
  expect(await freshAccessToken()).toBeNull()
  expect(fetchMock).not.toHaveBeenCalled()
})

it('uses the stored token as it is while 10 minutes or more are left', async () => {
  saveSession(sessionWith(REFRESH_WINDOW_MS + MIN))
  expect(await freshAccessToken()).toBe('old')
  expect(fetchMock).not.toHaveBeenCalled()
})

it('swaps the token for a fresh one with the refresh token when under 10 minutes are left', async () => {
  saveSession(sessionWith(9 * MIN))
  expect(await freshAccessToken()).toBe('new')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  expect(url).toBe('/api/oauth/token')
  expect(JSON.parse(String(init.body))).toEqual({ grant_type: 'refresh_token', refresh_token: 'r1' })
  // The new tokens and a new 24 hour expiry are stored, and the name stays.
  const saved = loadSession()!
  expect(saved).toMatchObject({ username: 'ann', accessToken: 'new', refreshToken: 'r2' })
  expect(saved.expiresAt - Date.now()).toBeGreaterThan(23 * 60 * MIN)
  // With a fresh token stored, the next use needs no further call.
  expect(await freshAccessToken()).toBe('new')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('renews an already expired token too', async () => {
  saveSession(sessionWith(-MIN))
  expect(await freshAccessToken()).toBe('new')
})

it('shares one renewal between parallel requests, since a refresh token works once', async () => {
  saveSession(sessionWith(MIN))
  expect(await Promise.all([freshAccessToken(), freshAccessToken(), freshAccessToken()])).toEqual(['new', 'new', 'new'])
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('keeps the current token when the renewal is refused, so the server decides', async () => {
  saveSession(sessionWith(5 * MIN))
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }))
  expect(await freshAccessToken()).toBe('old')
  expect(loadSession()?.refreshToken).toBe('r1')
})

it('keeps the current token when the server cannot be reached', async () => {
  saveSession(sessionWith(5 * MIN))
  fetchMock.mockRejectedValue(new TypeError('network down'))
  expect(await freshAccessToken()).toBe('old')
})

it('ignores a reply that has no tokens', async () => {
  saveSession(sessionWith(5 * MIN))
  fetchMock.mockResolvedValue(new Response('[]'))
  expect(await freshAccessToken()).toBe('old')
})

it('uses the tokens another tab stored when its renewal made ours fail', async () => {
  saveSession(sessionWith(5 * MIN))
  fetchMock.mockImplementation(async () => {
    saveSession({ username: 'ann', accessToken: 'from-other-tab', refreshToken: 'r9', expiresAt: Date.now() + 24 * 60 * MIN })
    return new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 })
  })
  expect(await freshAccessToken()).toBe('from-other-tab')
})
