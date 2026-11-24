import React from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'

export const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil utilisateur</h1>
          <p className="page-subtitle">
            Coordonnées et informations sur votre compte SmartFlow AI
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Nom complet
            </label>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Adresse email
            </label>
            <p style={{ fontSize: '0.938rem', color: 'var(--color-text-main)' }}>
              {user?.email}
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Rôle attribué
            </label>
            <div style={{ marginTop: '4px' }}>
              <StatusBadge value={user?.role} type="role" />
            </div>
          </div>

          {user?.serviceName && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Service / Pôle
              </label>
              <p style={{ fontSize: '0.938rem', color: 'var(--color-text-main)' }}>
                {user?.serviceName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
