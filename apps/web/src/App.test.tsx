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
  expect(screen.getByRole('heading', { name: 'Puzzle' })).toBeTruthy()
})

it('filters the catalog by category, including sub-categories', () => {
  renderAt('/puzzles')
  const count = () => screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/puzzle?id=')).length
  const all = count()
  fireEvent.click(screen.getByRole('button', { name: 'Birds' }))
  expect(screen.getByText('Atlantic Puffin')).toBeTruthy()
  expect(screen.queryByText('Matterhorn at Sunset')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Nature' }))
  expect(screen.getByText('Matterhorn at Sunset')).toBeTruthy()
  expect(count()).toBeLessThan(all)
  fireEvent.click(screen.getByRole('button', { name: 'All puzzles' }))
  expect(count()).toBe(all)
})

it('plays a catalog puzzle with its title and reviews', () => {
  renderAt('/puzzle?id=puffin')
  expect(screen.getByText(/Atlantic Puffin · 0\/20 placed|Atlantic Puffin · 0\/20/)).toBeTruthy()
  expect(screen.getByText(/Reviews \(2\)/)).toBeTruthy()
  // puffin is configured as a next-pieces puzzle
  expect(screen.getByRole('button', { name: 'Next pieces in panel' }).getAttribute('aria-pressed')).toBe('true')
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

it('shows progress in the player', () => {
  renderAt('/puzzle?id=2x2-5')
  expect(screen.getByText(/0\/4 placed/)).toBeTruthy()
  expect(screen.queryByText('Solved!')).toBeNull()
})

it('switches the player between the two main game modes', () => {
  renderAt('/puzzle?id=2x2-5')
  const scrambled = screen.getByRole('button', { name: 'Scrambled pieces' })
  expect(scrambled.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Next pieces in panel' }))
  expect(screen.getByRole('button', { name: 'Next pieces in panel' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByLabelText('Piece selector')).toBeTruthy()
  expect(screen.getByText(/0\/4 placed/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Scrambled pieces' }))
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
})
