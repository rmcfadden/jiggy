import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCompleteSso, useSession } from '../auth/hooks'

/** Where the backend sends the browser after a single sign-on: the signin token is in the URL fragment, so it never reaches a server log. */
export default function SsoCallback() {
  const session = useSession().data
  const complete = useCompleteSso()
  const { hash } = useLocation()
  const started = useRef(false)
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const token = params.get('signin_token')
  const username = params.get('username')
  const from = params.get('from')
  const destination = from && from.startsWith('/') && !from.startsWith('//') ? from : '/puzzles'

  useEffect(() => {
    if (!token || !username || started.current) return
    started.current = true
    // The token is single use: drop it from the address bar before trading it.
    window.history.replaceState(null, '', window.location.pathname)
    complete.mutate({ token, username })
  }, [token, username, complete])

  if (session) return <Navigate to={destination} replace />
  if (complete.error) return <Navigate to={`/signin?sso_error=${encodeURIComponent(complete.error.message)}`} replace />
  if (!token && !username && !complete.isPending && !complete.isSuccess) return <Navigate to="/signin" replace />
  return <p className="p-4 md:p-6">Signing you in…</p>
}
