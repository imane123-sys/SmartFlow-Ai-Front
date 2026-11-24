import React from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { FileSearch } from 'lucide-react'

export const IncidentDetailsPage = () => {
  const { id } = useParams()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Détail de l'incident #{id}</h1>
          <p className="page-subtitle">
            Informations détaillées, pièces jointes, historique et actions d'intervention
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={FileSearch}
          title={`Incident #${id} chargé`}
          description="La vue complète du détail de l'incident sera connectée lors de la prochaine étape."
        />
      </div>
    </div>
  )
}

export default IncidentDetailsPage
