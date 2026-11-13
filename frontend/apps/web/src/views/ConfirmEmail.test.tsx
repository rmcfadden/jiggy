import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { mockAuthApi, renderAt } from '../auth/test-utils'

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

it('uses the code from the link once and says the email is confirmed', async () => {
  const calls = mockAuthApi({ '/api/emails/confirm': { body: { confirmed: true } } })
  renderAt('/confirm-email?code=abc123')
  await screen.findByText(/email address is confirmed/i)
  expect(calls).toEqual([{ url: '/api/emails/confirm', method: 'POST', body: { code: 'abc123' } }])
  expect(screen.getAllByRole('link', { name: 'Sign in' })).toHaveLength(2) // the header's and the page's own
})

it('shows the server message when the code is invalid, expired or used', async () => {
  mockAuthApi({ '/api/emails/confirm': { status: 400, body: { error: 'this confirmation link is invalid, expired or already used' } } })
  renderAt('/confirm-email?code=old')
  expect((await screen.findByRole('alert')).textContent).toMatch(/invalid, expired or already used/)
})

it('asks for the link when there is no code and sends nothing', () => {
  const calls = mockAuthApi({})
  renderAt('/confirm-email')
  expect(screen.getByRole('alert').textContent).toMatch(/link from your confirmation email/i)
  expect(calls).toEqual([])
})
