import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-main)',
        padding: '20px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px 32px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <Layers size={24} />
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em'
            }}
          >
            SmartFlow <span style={{ color: 'var(--color-blue-600)' }}>AI</span>
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: '6px'
            }}
          >
            Connectez-vous pour accéder à votre espace de travail
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Adresse email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@entreprise.com"
            icon={Mail}
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
            autoComplete="current-password"
          />

          <div style={{ marginTop: '24px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || !email || !password}
            >
              Se connecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
