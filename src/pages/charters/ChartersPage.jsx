import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { FileText } from 'lucide-react'

export const ChartersPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chartes d'Intervention</h1>
          <p className="page-subtitle">
            Consultation, approbation et suivi du cycle de validation des chartes
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={FileText}
          title="Module Chartes initialisé"
          description="La gestion des versions de chartes et les flux de validation seront connectés à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default ChartersPage
