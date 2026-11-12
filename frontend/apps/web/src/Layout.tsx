import { Outlet } from 'react-router-dom'
import Avatar from './auth/Avatar'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col max-md:order-first">
        <header className="flex shrink-0 items-center justify-end border-b border-slate-200 px-4 py-2">
          <Avatar />
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
