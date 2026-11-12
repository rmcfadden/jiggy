import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession, useSignOut } from './hooks'

/** The signed-in user's initial in a round button that opens a small menu; a Sign in link when signed out. */
export default function Avatar() {
  const session = useSession().data
  const signOut = useSignOut()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointer = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  if (!session) {
    if (pathname === '/signin' || pathname === '/signup') return null // the page itself is the sign-in
    return (
      <Link to="/signin" className="rounded px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-slate-100">
        Sign in
      </Link>
    )
  }

  const item = 'block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100'
  return (
    <div ref={root} className="relative">
      <button
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        title={session.username}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold uppercase text-[#0f172a] hover:bg-amber-400"
        onClick={() => setOpen(!open)}
      >
        {session.username.trim().charAt(0) || '?'}
      </button>
      {open && (
        <div role="menu" aria-label="Account" className="absolute right-0 z-40 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1 text-slate-900 shadow-lg">
          <div className="border-b border-slate-200 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
              <span aria-hidden className="h-2 w-2 rounded-full bg-green-500" />
              Signed in
            </p>
            <p className="truncate text-sm">
              as <strong>{session.username}</strong>
            </p>
          </div>
          <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)}>
            Account
          </Link>
          <button
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false)
              signOut()
              navigate('/signin')
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
