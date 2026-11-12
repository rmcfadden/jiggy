import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/puzzles', label: 'Puzzles', short: 'E' },
  { to: '/designer', label: 'Designer', short: 'D' },
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
  const [collapsedPref, setCollapsed] = useState(loadCollapsed)
  const collapsed = collapsedPref

  const toggle = () => {
    setCollapsed(!collapsedPref)
    try {
      localStorage.setItem(STORAGE_KEY, collapsedPref ? '0' : '1')
    } catch {
      // storage unavailable; the toggle still works for this session
    }
  }

  return (
    <nav
      aria-label="Main"
      className={`flex shrink-0 gap-1 bg-slate-100 p-2 text-slate-800 max-md:items-center max-md:justify-between md:flex-col md:transition-[width] ${
        collapsed ? 'md:w-14' : 'md:w-56'
      }`}
    >
      <button
        aria-label="Toggle sidebar"
        aria-expanded={!collapsed}
        className="mb-2 flex h-9 max-md:hidden items-center justify-center rounded text-lg hover:bg-slate-200"
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
            `flex h-9 items-center rounded px-3 text-sm font-medium max-md:flex-1 max-md:justify-center ${
              collapsed ? 'md:justify-center md:px-0' : ''
            } ${isActive ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-[#0f172a]' : 'hover:bg-slate-200'}`
          }
        >
          {collapsed ? (
            <>
              <span className="md:hidden">{l.label}</span>
              <span className="max-md:hidden">{l.short}</span>
            </>
          ) : (
            l.label
          )}
        </NavLink>
      ))}
    </nav>
  )
}
