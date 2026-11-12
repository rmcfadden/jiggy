import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { loadSession } from '../auth/session'
import { mockAuthApi, okHandlers, renderAt } from '../auth/test-utils'

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

it('signs in, exchanges the signin token, stores the session and leaves the page', async () => {
  const calls = mockAuthApi(okHandlers())
  renderAt('/signin')
  fill('Username or email', ' ann ')
  fill('Password', 'pw')
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await screen.findByRole('heading', { name: 'Puzzles' })
  expect(calls).toEqual([
    { url: '/api/signin', method: 'POST', body: { username: 'ann', password: 'pw' } },
    {
      url: '/api/oauth/token',
      method: 'POST',
      body: { grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange', subject_token: 'signin-1' },
    },
  ])
  expect(loadSession()).toMatchObject({ username: 'ann', accessToken: 'access-1', refreshToken: 'refresh-1' })
  expect(screen.getByRole('button', { name: 'Account menu' }).textContent).toBe('a')
})

it('shows the server message for bad credentials and stays signed out', async () => {
  mockAuthApi({ '/api/signin': { status: 401, body: { error: 'invalid username or password' } } })
  renderAt('/signin')
  fill('Username or email', 'ann')
  fill('Password', 'wrong')
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  expect((await screen.findByRole('alert')).textContent).toBe('invalid username or password')
  expect(loadSession()).toBeNull()
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy()
})

it('shows the error description when the token exchange is refused', async () => {
  mockAuthApi({
    ...okHandlers(),
    '/api/oauth/token': { status: 400, body: { error: 'invalid_grant', error_description: 'subject_token is invalid, expired or already used' } },
  })
  renderAt('/signin')
  fill('Username or email', 'ann')
  fill('Password', 'pw')
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  expect((await screen.findByRole('alert')).textContent).toBe('subject_token is invalid, expired or already used')
  expect(loadSession()).toBeNull()
})

it('signs in with an email address in the username field', async () => {
  const calls = mockAuthApi(okHandlers())
  renderAt('/signin')
  fill('Username or email', 'ann@example.com')
  fill('Password', 'pw')
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await screen.findByRole('heading', { name: 'Puzzles' })
  expect(calls[0]!.body).toEqual({ username: 'ann@example.com', password: 'pw' })
})

it('keeps the button disabled until both fields are filled', () => {
  mockAuthApi({})
  renderAt('/signin')
  const button = screen.getByRole('button', { name: 'Sign in' }) as HTMLButtonElement
  expect(button.disabled).toBe(true)
  fill('Username or email', 'ann')
  expect(button.disabled).toBe(true)
  fill('Password', 'pw')
  expect(button.disabled).toBe(false)
})

it('sends a signed-in visitor straight on and links to sign up otherwise', async () => {
  mockAuthApi({})
  localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: 1 }))
  renderAt('/signin')
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Puzzles' })).toBeTruthy())
  cleanup()
  localStorage.clear()

  renderAt('/signin')
  expect(screen.getByRole('link', { name: 'Create an account' }).getAttribute('href')).toBe('/signup')
})
