import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'

export const UnauthorizedPage = () => {
  const { getDefaultPath } = useAuth()
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 24px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '8px'
          }}
        >
          Accès refusé
        </h2>

        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}
        >
          Votre profil ne dispose pas des privilèges nécessaires pour consulter cette page ou exécuter cette action.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate(getDefaultPath(), { replace: true })}
          >
            Retourner à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
