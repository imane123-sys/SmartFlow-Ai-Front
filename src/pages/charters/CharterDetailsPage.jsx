import React from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { FileCheck } from 'lucide-react'

export const CharterDetailsPage = () => {
  const { id } = useParams()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Charte #{id}</h1>
          <p className="page-subtitle">
            Objectif, précautions de sécurité, étapes requises et statut de validation
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={FileCheck}
          title={`Charte #${id} sélectionnée`}
          description="La visualisation détaillée des étapes et le formulaire de décision seront implémentés à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default CharterDetailsPage
