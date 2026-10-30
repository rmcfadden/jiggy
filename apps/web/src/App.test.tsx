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
  expect(screen.getByRole('heading', { name: 'Puzzles' })).toBeTruthy()
  const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.startsWith('/puzzle?id='))!
  fireEvent.click(link)
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
})

it('filters the catalog by category, including sub-categories', () => {
  renderAt('/puzzles')
  const count = () => screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/puzzle?id=')).length
  const all = count()
  fireEvent.click(screen.getByRole('button', { name: 'Birds' }))
  expect(screen.queryByText('Matterhorn at Sunset')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Nature' }))
  expect(screen.getByText('Matterhorn at Sunset')).toBeTruthy()
  expect(count()).toBeLessThan(all)
  fireEvent.click(screen.getByRole('button', { name: 'All puzzles' }))
  expect(count()).toBe(all)
})

it('plays a catalog puzzle with its reviews', () => {
  renderAt('/puzzle?id=puffin')
  expect(screen.getByText(/Reviews \(2\)/)).toBeTruthy()
  // puffin is configured as a next-pieces puzzle
  expect(screen.getByLabelText('Piece selector')).toBeTruthy()
})

it('navigates via the sidebar and collapses it', () => {
  renderAt('/puzzles')
  fireEvent.click(screen.getByRole('link', { name: 'Designer' }))
  expect(screen.getByRole('tab', { name: 'Piece' })).toBeTruthy()
  const toggle = screen.getByRole('button', { name: 'Toggle sidebar' })
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
})

it('has no puzzle header in the player', () => {
  renderAt('/puzzle?id=2x2-5')
  expect(screen.queryByRole('heading', { name: 'Puzzle' })).toBeNull()
  expect(screen.queryByText(/placed/)).toBeNull()
  expect(screen.queryByText('Solved!')).toBeNull()
})

it('picks the player mode from the URL', () => {
  renderAt('/puzzle?id=2x2-5&mode=next-pieces')
  expect(screen.getByLabelText('Piece selector')).toBeTruthy()
  cleanup()
  renderAt('/puzzle?id=2x2-5')
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
})
