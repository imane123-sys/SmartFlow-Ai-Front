import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Loading from '../components/common/Loading'

import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import IncidentsPage from '../pages/incidents/IncidentsPage'
import CreateIncidentPage from '../pages/incidents/CreateIncidentPage'
import IncidentDetailsPage from '../pages/incidents/IncidentDetailsPage'
import AIAnalysisPage from '../pages/ai-analysis/AIAnalysisPage'
import ChartersPage from '../pages/charters/ChartersPage'
import CharterDetailsPage from '../pages/charters/CharterDetailsPage'
import InterventionsPage from '../pages/interventions/InterventionsPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import UsersPage from '../pages/users/UsersPage'
import SettingsPage from '../pages/settings/SettingsPage'
import ProfilePage from '../pages/settings/ProfilePage'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <Loading message="Vérification de la session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading message="Chargement..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/create" element={<CreateIncidentPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
        <Route
          path="/ai-analysis"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <AIAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route path="/charters" element={<ChartersPage />} />
        <Route path="/charters/:id" element={<CharterDetailsPage />} />
        <Route path="/interventions" element={<InterventionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
