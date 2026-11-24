import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { AlertTriangle } from 'lucide-react'

export const IncidentsPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Incidents</h1>
          <p className="page-subtitle">
            Suivi des incidents, recherche multi-critères et historique des traitements
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={AlertTriangle}
          title="Module Incidents initialisé"
          description="La liste filtrable et paginée des incidents sera connectée lors de la prochaine étape."
        />
      </div>
    </div>
  )
}

export default IncidentsPage
