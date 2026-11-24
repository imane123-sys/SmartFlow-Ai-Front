import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { LayoutDashboard } from 'lucide-react'

export const DashboardPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Indicateurs clés, métriques et vue globale de l’activité SmartFlow AI
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={LayoutDashboard}
          title="Module Tableau de bord initialisé"
          description="Les graphiques de répartition et indicateurs clés seront reliés lors de la prochaine étape."
        />
      </div>
    </div>
  )
}

export default DashboardPage
