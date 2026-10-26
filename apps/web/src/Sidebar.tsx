import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/puzzles', label: 'Puzzles Explorer', short: 'E' },
  { to: '/puzzle', label: 'Puzzle Player', short: 'P' },
  { to: '/designer', label: 'Puzzle Designer', short: 'D' },
]

const STORAGE_KEY = 'jiggy.sidebar.collapsed'

function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(loadCollapsed)

  const toggle = () => {
    setCollapsed(!collapsed)
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '0' : '1')
    } catch {
      // storage unavailable; the toggle still works for this session
    }
  }

  return (
    <nav
      aria-label="Main"
      className={`flex shrink-0 flex-col gap-1 bg-slate-900 p-2 text-slate-200 transition-[width] ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      <button
        aria-label="Toggle sidebar"
        aria-expanded={!collapsed}
        className="mb-2 flex h-9 items-center justify-center rounded text-lg hover:bg-slate-700"
        onClick={toggle}
      >
        {collapsed ? '»' : '«'}
      </button>
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          title={l.label}
          aria-label={l.label}
          className={({ isActive }) =>
            `flex h-9 items-center rounded px-3 text-sm font-medium ${
              collapsed ? 'justify-center px-0' : ''
            } ${isActive ? 'bg-amber-500 text-slate-900' : 'hover:bg-slate-700'}`
          }
        >
          {collapsed ? l.short : l.label}
        </NavLink>
      ))}
    </nav>
  )
}
