import type { Location } from 'react-router-dom'

/** Where to go once signed in: the page the user was sent from, else the puzzles. Only in-app paths are honored. */
export function destinationAfterAuth(location: Location): string {
  const from = (location.state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/puzzles'
}
