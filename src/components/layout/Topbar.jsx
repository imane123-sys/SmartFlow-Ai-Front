import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Bell, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import notificationService from '../../services/notificationService'

export const Topbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount()
        if (isMounted && response?.unreadCount !== undefined) {
          setUnreadCount(response.unreadCount)
        }
      } catch {
        if (isMounted) setUnreadCount(0)
      }
    }
    if (user) {
      fetchUnreadCount()
    }
    return () => {
      isMounted = false
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {user?.serviceName ? `Pôle : ${user.serviceName}` : 'Portail SmartFlow AI'}
        </span>
      </div>

      <div className="topbar-right">
        <Link
          to="/notifications"
          className="btn btn-outline btn-sm"
          style={{ position: 'relative', padding: '8px' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--color-danger)',
                color: '#ffffff',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 5px',
                lineHeight: 1
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="topbar-user">
          <div className="topbar-avatar">{userInitials}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="topbar-user-role">{user?.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          title="Déconnexion"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar
