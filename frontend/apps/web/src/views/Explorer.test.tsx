import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import Explorer from './Explorer'
import { parsePrefs } from './browsePrefs'
import { parseProfile, pushRecent, toggleInList } from './profile'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const renderExplorer = () =>
  render(
    <MemoryRouter>
      <Explorer />
    </MemoryRouter>,
  )

const pressed = (group: string, name: string) =>
  within(screen.getByRole('group', { name: group })).getByRole('button', { name })

it('moves the category sidebar to the right and remembers it', () => {
  renderExplorer()
  const layoutOf = () => screen.getByRole('navigation', { name: 'Categories' }).parentElement!.className
  expect(layoutOf()).toContain('md:flex-row')
  expect(layoutOf()).not.toContain('flex-row-reverse')
  fireEvent.click(pressed('Sidebar', 'Right'))
  expect(layoutOf()).toContain('md:flex-row-reverse')
  cleanup()
  renderExplorer()
  expect(pressed('Sidebar', 'Right').getAttribute('aria-pressed')).toBe('true')
})

it('resizes icons across three sizes', () => {
  renderExplorer()
  const imgClass = () => screen.getAllByRole('img')[0].className
  expect(imgClass()).toContain('h-40')
  fireEvent.click(pressed('Icons', 'S'))
  expect(imgClass()).toContain('h-24')
  fireEvent.click(pressed('Icons', 'L'))
  expect(imgClass()).toContain('h-56')
})

it('shows Netflix rows with top rated, category selection and a profile list', () => {
  renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  expect(screen.getByRole('region', { name: 'Top rated' })).toBeTruthy()
  expect(screen.getByRole('region', { name: 'Animals' })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'My List' })).toBeNull()

  fireEvent.click(pressed('Rows', 'Animals'))
  expect(screen.queryByRole('region', { name: 'Animals' })).toBeNull()

  fireEvent.click(within(screen.getByRole('region', { name: 'Top rated' })).getAllByRole('button')[0])
  expect(screen.getByRole('region', { name: 'My List' })).toBeTruthy()
})

it('lists a puzzle as recently played once opened', () => {
  renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  expect(screen.queryByRole('region', { name: 'Continue playing' })).toBeNull()
  fireEvent.click(within(screen.getByRole('region', { name: 'Top rated' })).getAllByRole('link')[0])
  cleanup()
  renderExplorer()
  expect(screen.getByRole('region', { name: 'Continue playing' })).toBeTruthy()
})

it('falls back to defaults for bad stored data', () => {
  expect(parsePrefs('nope')).toMatchObject({ layout: 'classic', side: 'left', iconSize: 'medium' })
  expect(parsePrefs('{"side":"right","iconSize":"huge"}')).toMatchObject({ side: 'right', iconSize: 'medium' })
  expect(parseProfile('nope')).toEqual({ list: [], recent: [] })
})

it('keeps the profile list and recents tidy', () => {
  expect(toggleInList(['a'], 'b')).toEqual(['a', 'b'])
  expect(toggleInList(['a', 'b'], 'a')).toEqual(['b'])
  expect(pushRecent(['a', 'b'], 'b')).toEqual(['b', 'a'])
})
