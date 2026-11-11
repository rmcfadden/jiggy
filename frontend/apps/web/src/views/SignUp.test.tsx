import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { authConfig } from '../auth/config'
import { loadSession } from '../auth/session'
import { mockAuthApi, okHandlers, renderAt } from '../auth/test-utils'
import type { SignupMode } from '../auth/validation'

afterEach(() => {
  authConfig.signupMode = 'email'
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
const password = () => {
  fill('Password', 'pw123456')
  fill('Confirm password', 'pw123456')
}
const renderMode = (mode: SignupMode) => {
  authConfig.signupMode = mode
  renderAt('/signup')
}

it('asks for email and password by default, with no username field or mode switch', () => {
  mockAuthApi({})
  renderAt('/signup')
  expect(screen.getByLabelText('Email')).toBeTruthy()
  expect(screen.getByLabelText('Password')).toBeTruthy()
  expect(screen.getByLabelText('Confirm password')).toBeTruthy()
  expect(screen.queryByLabelText('Username')).toBeNull()
  expect(screen.queryByRole('group', { name: 'Sign up with' })).toBeNull()
  expect(screen.getByText(/pick a username for you/)).toBeTruthy()
})

it.each([
  ['username', () => fill('Username', ' ann_1 '), { username: 'ann_1', password: 'pw123456' }],
  ['email', () => fill('Email', ' Ann@Example.com '), { email: 'Ann@Example.com', password: 'pw123456' }],
  [
    'both',
    () => {
      fill('Email', 'ann@example.com')
      fill('Username', 'ann_1')
    },
    { username: 'ann_1', email: 'ann@example.com', password: 'pw123456' },
  ],
] as const)('in %s mode sends only that mode\'s fields', async (mode, fillIdentity, body) => {
  const calls = mockAuthApi(okHandlers())
  renderMode(mode)
  fillIdentity()
  password()
  submit()

  await screen.findByRole('heading', { name: 'Puzzles' })
  expect(calls[0]).toEqual({ url: '/api/signup', method: 'POST', body })
  expect(calls[1]!.url).toBe('/api/oauth/token')
})

it('stores the username the server generated for an email signup', async () => {
  mockAuthApi(okHandlers('ann.smith-4f9k'))
  renderAt('/signup')
  fill('Email', 'ann.smith@example.com')
  password()
  submit()

  await screen.findByRole('heading', { name: 'Puzzles' })
  expect(loadSession()?.username).toBe('ann.smith-4f9k')
})

it.each([
  ['a malformed email', () => { fill('Email', 'nope'); password() }, 'Enter a valid email address.'],
  ['mismatched passwords', () => { fill('Email', 'ann@example.com'); fill('Password', 'one'); fill('Confirm password', 'two') }, 'Passwords do not match.'],
  ['a missing password', () => fill('Email', 'ann@example.com'), 'Enter a password.'],
  ['an over-long password', () => { fill('Email', 'ann@example.com'); fill('Password', 'x'.repeat(73)); fill('Confirm password', 'x'.repeat(73)) }, 'Password must be at most 72 bytes.'],
])('does not send the form with %s', async (_name, fillForm, message) => {
  const calls = mockAuthApi(okHandlers())
  renderAt('/signup')
  fillForm()
  submit()

  expect((await screen.findByRole('alert')).textContent).toBe(message)
  expect(calls).toEqual([])
})

it('rejects a bad username before sending when the mode asks for one', async () => {
  const calls = mockAuthApi(okHandlers())
  renderMode('both')
  fill('Email', 'ann@example.com')
  fill('Username', 'a!')
  password()
  submit()

  expect((await screen.findByRole('alert')).textContent).toMatch(/Username must be 3-32/)
  expect(calls).toEqual([])
})

it('shows the server message for a taken email and stays signed out', async () => {
  mockAuthApi({ '/api/signup': { status: 409, body: { error: 'email is already registered' } } })
  renderAt('/signup')
  fill('Email', 'ann@example.com')
  password()
  submit()

  expect((await screen.findByRole('alert')).textContent).toBe('email is already registered')
  expect(loadSession()).toBeNull()
})

it('links to sign in from the page footer', () => {
  mockAuthApi({})
  renderAt('/signup')
  expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/signin')
})
