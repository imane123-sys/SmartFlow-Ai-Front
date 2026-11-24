import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Loading from '../components/common/Loading'

import LoginPage from '../pages/auth/LoginPage'
import UnauthorizedPage from '../pages/auth/UnauthorizedPage'
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
  const location = useLocation()

  if (loading) {
    return <Loading message="Vérification de la session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <UnauthorizedPage />
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getDefaultPath } = useAuth()

  if (loading) {
    return <Loading message="Chargement..." />
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultPath()} replace />
  }

  return children
}

export const AppRoutes = () => {
  const { getDefaultPath } = useAuth()

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
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
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
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
