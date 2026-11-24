import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layers, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, getDefaultPath } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const validateFields = () => {
    const errors = {}

    if (!email.trim()) {
      errors.email = "L'adresse email est obligatoire"
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Format d'adresse email invalide"
    }

    if (!password) {
      errors.password = 'Le mot de passe est obligatoire'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!validateFields()) {
      return
    }

    setLoading(true)

    try {
      const loggedUser = await login(email.trim(), password)
      const redirectPath = location.state?.from?.pathname || getDefaultPath()
      navigate(redirectPath, { replace: true })
    } catch (err) {
      if (err.status === 401) {
        setServerError('Email ou mot de passe incorrect')
      } else if (err.status === 403) {
        setServerError('Votre compte utilisateur est inactif ou verrouillé')
      } else {
        setServerError(err.message || 'Impossible de se connecter au serveur backend')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }))
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
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Layers size={26} />
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

        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Adresse email"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="ex: admin@smartflow.com"
            icon={Mail}
            error={fieldErrors.email}
            required
            autoComplete="email"
            disabled={loading}
          />

          <Input
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            icon={Lock}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            disabled={loading}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div style={{ marginTop: '24px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
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
