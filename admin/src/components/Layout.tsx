import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  AlertTriangle,
  DollarSign,
  LogOut,
  Wrench,
} from 'lucide-react'
import { auth } from '../lib/auth'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/listings', icon: Package, label: 'Listings' },
  { to: '/rentals', icon: FileText, label: 'Rentals' },
  { to: '/fines', icon: DollarSign, label: 'Fines' },
  { to: '/damage', icon: AlertTriangle, label: 'Damage Reports' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  function handleLogout() {
    auth.logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="sidebar w-60 flex-shrink-0 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench size={15} className="text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold leading-tight">Rent-A-Equip</div>
              <div className="text-xs" style={{ color: 'hsl(var(--sidebar-fg))' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin name + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-4 py-2 mb-1">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="text-sm text-white font-medium truncate">{auth.getName()}</div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
