import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Sparkles,
  FileText,
  Wrench,
  Bell,
  Users,
  Settings,
  Layers
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Sidebar = () => {
  const { user } = useAuth()

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Layers size={18} />
        </div>
        <div className="sidebar-logo-text">
          SmartFlow <span>AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-heading">Général</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink
          to="/incidents"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={18} />
          <span>Incidents</span>
        </NavLink>

        {isManagerOrAdmin && (
          <NavLink
            to="/ai-analysis"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Sparkles size={18} />
            <span>Analyses IA</span>
          </NavLink>
        )}

        <NavLink
          to="/charters"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Chartes</span>
        </NavLink>

        <NavLink
          to="/interventions"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Wrench size={18} />
          <span>Interventions</span>
        </NavLink>

        <div className="sidebar-nav-heading">Système</div>
        <NavLink
          to="/notifications"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} />
          <span>Notifications</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Utilisateurs</span>
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Paramètres</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
