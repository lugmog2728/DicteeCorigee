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
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">DC</div>
        <span className="logo-text">DictéeCorrige</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">AG</div>
          <div className="user-info">
            <div className="user-name">Andréa Gardanne</div>
            <div className="user-role">Enseignante</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
