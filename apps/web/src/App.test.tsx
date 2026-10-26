import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

it('redirects / to the explorer and links puzzles to the player', () => {
  renderAt('/')
  expect(screen.getByRole('heading', { name: 'Puzzles Explorer' })).toBeTruthy()
  const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.startsWith('/puzzle?id='))!
  fireEvent.click(link)
  expect(screen.getByRole('heading', { name: 'Puzzle Player' })).toBeTruthy()
})

it('navigates via the sidebar and collapses it', () => {
  renderAt('/puzzles')
  fireEvent.click(screen.getByRole('link', { name: 'Puzzle Designer' }))
  expect(screen.getByRole('tab', { name: 'Piece' })).toBeTruthy()
  const toggle = screen.getByRole('button', { name: 'Toggle sidebar' })
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
})

it('shows progress in the player', () => {
  renderAt('/puzzle?id=2x2-5')
  expect(screen.getByText(/0\/4 placed/)).toBeTruthy()
  expect(screen.queryByText('Solved!')).toBeNull()
})
