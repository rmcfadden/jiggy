import { afterEach, expect, it, vi } from 'vitest'
import { destinationAfterAuth } from './redirect'
import { clearSession, getAccessToken, loadSession, saveSession } from './session'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

const session = { username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: 123 }

it('round-trips a session and clears it', () => {
  expect(loadSession()).toBeNull()
  saveSession(session)
  expect(loadSession()).toEqual(session)
  expect(getAccessToken()).toBe('a')
  clearSession()
  expect(loadSession()).toBeNull()
  expect(getAccessToken()).toBeNull()
})

it.each(['not json', '{"username":"ann"}', 'null', '[]', '{"username":1,"accessToken":"a","refreshToken":"r","expiresAt":1}'])(
  'treats stored %s as signed out',
  (raw) => {
    localStorage.setItem('jiggy.auth', raw)
    expect(loadSession()).toBeNull()
  },
)

it('survives storage that throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(loadSession()).toBeNull()
  expect(() => saveSession(session)).not.toThrow()
  expect(() => clearSession()).not.toThrow()
})

it.each([
  [{ from: '/designer' }, '/designer'],
  [{ from: '//evil.example' }, '/puzzles'],
  [{ from: 'https://evil.example' }, '/puzzles'],
  [{ from: 5 }, '/puzzles'],
  [null, '/puzzles'],
])('redirects after auth with state %j to %s', (state, expected) => {
  expect(destinationAfterAuth({ state } as never)).toBe(expected)
})
