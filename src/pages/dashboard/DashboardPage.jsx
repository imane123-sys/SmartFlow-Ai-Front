import React from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminManagerDashboard from './components/AdminManagerDashboard'
import AgentDashboard from './components/AgentDashboard'
import EmployeeDashboard from './components/EmployeeDashboard'

export const DashboardPage = () => {
  const { role, isAdmin, isManager, isAgent, isEmployee } = useAuth()

  if (isAdmin || isManager) {
    return <AdminManagerDashboard />
  }

  if (isAgent) {
    return <AgentDashboard />
  }

  if (isEmployee) {
    return <EmployeeDashboard />
  }

  return <EmployeeDashboard />
}

export default DashboardPage
