import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { Wrench } from 'lucide-react'

export const InterventionsPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interventions</h1>
          <p className="page-subtitle">
            Planification, exécution terrain par étapes et clôture avec compte rendu
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Wrench}
          title="Module Interventions initialisé"
          description="Le tableau de suivi des interventions terrain sera disponible à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default InterventionsPage
