import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './hooks'

/** Wraps routes that need a signed-in user; anyone else is sent to /signin and returns here afterwards. */
export default function RequireAuth() {
  const location = useLocation()
  const session = useSession().data
  if (!session) return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />
  return <Outlet />
}
