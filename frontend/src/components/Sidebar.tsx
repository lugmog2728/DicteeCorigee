import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Calendar, Users, ChartColumn, X, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface MenuItem {
  path: string
  label: string
  icon: LucideIcon
}

const menuItems: MenuItem[] = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/bibliotheque', label: 'Bibliothèque', icon: BookOpen },
  { path: '/planification', label: 'Planification', icon: Calendar },
  { path: '/classes', label: 'Classes', icon: Users },
  { path: '/statistiques', label: 'Statistiques', icon: ChartColumn },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`w-64 bg-white border-r border-[#e5e7eb] flex flex-col fixed h-screen left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-14 lg:h-16 px-4 lg:px-6 border-b border-[#e5e7eb] flex items-center gap-2 shrink-0">
        <div className="logo-gradient w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-sm text-white shrink-0">
          DC
        </div>
        <span className="text-xl font-medium text-[#101828] flex-1">DictéeCorrige</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="lg:hidden size-8 flex items-center justify-center rounded-lg text-[#6a7282] hover:bg-[#f5f5f5] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 h-9 px-3 rounded-[10px] no-underline text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-black bg-(--electric-pink-50)'
                  : 'text-[#364153] hover:bg-[#f5f5f5]'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#e5e7eb] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#e5e7eb] flex items-center justify-center font-medium text-[#4a5565] text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#101828] leading-5 truncate">
              {user?.name ?? '—'}
            </div>
            <div className="text-xs text-[#6a7282] leading-4">Enseignant</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="size-8 flex items-center justify-center rounded-lg text-[#6a7282] hover:bg-[#f5f5f5] hover:text-[#d4183d] transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
