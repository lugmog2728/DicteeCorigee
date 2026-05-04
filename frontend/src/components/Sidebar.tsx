import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Calendar, Users, ChartColumn } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col fixed h-screen left-0 top-0">
      <div className="h-16 px-6 border-b border-[#e5e7eb] flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-sm text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6F3 0%, #E91E8C 100%)' }}
        >
          DC
        </div>
        <span className="text-xl font-medium text-[#101828]">DictéeCorrige</span>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 h-9 px-3 rounded-[10px] no-underline text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-black bg-[var(--electric-pink-50)]'
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
            AG
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#101828] leading-5 truncate">Andréa Gardanne</div>
            <div className="text-xs text-[#6a7282] leading-4">Enseignante</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
