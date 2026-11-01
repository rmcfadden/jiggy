import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <Sidebar />
      <div className="min-h-0 min-w-0 flex-1 overflow-auto max-md:order-first">
        <Outlet />
      </div>
    </div>
  )
}
