import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const getDefaultPathForRole = () => {
  return '/dashboard'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          localStorage.setItem('user', JSON.stringify(currentUser))
        } catch (error) {
          if (error.status === 401) {
            logout()
          }
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [logout])

  const login = async (email, password) => {
    const response = await authService.login({ email, password })
    const authToken = response.token
    const authUser = {
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      role: response.role,
      serviceId: response.serviceId,
      serviceName: response.serviceName
    }

    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(authUser))
    setToken(authToken)
    setUser(authUser)
    return authUser
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles = []) => {
    if (!user?.role) return false
    return roles.includes(user.role)
  }

  const role = user?.role || null
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'
  const isAgent = role === 'AGENT'
  const isEmployee = role === 'EMPLOYEE'

  const value = {
    user,
    token,
    role,
    isAdmin,
    isManager,
    isAgent,
    isEmployee,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    getDefaultPath: () => getDefaultPathForRole()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
