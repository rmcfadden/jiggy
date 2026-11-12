import { useCallback, useState } from 'react'

/** Per-profile puzzle lists, kept in this browser until real accounts exist. */
export type ProfileData = { list: string[] }

const KEY = 'jiggy.profile.data'
const EMPTY: ProfileData = { list: [] }

const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

export function parseProfile(text: string | null): ProfileData {
  if (!text) return EMPTY
  try {
    const raw = JSON.parse(text) as Partial<Record<keyof ProfileData, unknown>>
    return { list: ids(raw.list) }
  } catch {
    return EMPTY
  }
}

export const toggleInList = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

function load(): ProfileData {
  try {
    return parseProfile(localStorage.getItem(KEY))
  } catch {
    return EMPTY
  }
}

function save(data: ProfileData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage unavailable; the change still applies for this session
  }
}

export function useProfile() {
  const [data, setData] = useState(load)
  const toggle = useCallback((id: string) => {
    setData((d) => {
      const next = { ...d, list: toggleInList(d.list, id) }
      save(next)
      return next
    })
  }, [])
  return { ...data, toggle }
}
