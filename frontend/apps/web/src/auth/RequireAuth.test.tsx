import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { mockAuthApi, okHandlers, renderAt } from './test-utils'

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

it('sends a signed-out visitor from /designer to the sign-in page', async () => {
  mockAuthApi(okHandlers())
  renderAt('/designer')
  await screen.findByRole('heading', { name: 'Sign in' })
})

it('returns to the designer after signing in', async () => {
  mockAuthApi(okHandlers())
  renderAt('/designer')
  fireEvent.change(await screen.findByLabelText('Username or email'), { target: { value: 'ann' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  await screen.findByRole('tab', { name: /game/i })
})

it('opens the designer for a signed-in user', async () => {
  localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 60_000 }))
  mockAuthApi(okHandlers())
  renderAt('/designer')
  await screen.findByRole('tab', { name: /game/i })
})

it('sends a signed-out visitor from /puzzle to sign in, but leaves the puzzle list open', async () => {
  mockAuthApi(okHandlers())
  renderAt('/puzzle?id=puffin')
  await screen.findByRole('heading', { name: 'Sign in' })
  cleanup()
  renderAt('/puzzles')
  await screen.findByRole('heading', { name: 'Puzzles' })
})

it('shows a Sign in link in the header when signed out and an avatar menu with Sign out when signed in', async () => {
  mockAuthApi(okHandlers())
  renderAt('/puzzles')
  await screen.findByRole('heading', { name: 'Puzzles' })
  expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Profile' })).toBeNull() // gone from the sidebar
  cleanup()

  localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 60_000 }))
  renderAt('/puzzles')
  fireEvent.click(await screen.findByRole('button', { name: 'Account menu' }))
  expect(screen.getByText('Signed in')).toBeTruthy()
  expect(screen.getByText('ann', { selector: 'strong' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Profile' }).getAttribute('href')).toBe('/profile')
  fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))
  await screen.findByRole('heading', { name: 'Sign in' })
  expect(localStorage.getItem('jiggy.auth')).toBeNull()
})
