import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { PlusCircle } from 'lucide-react'

export const CreateIncidentPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Déclarer un incident</h1>
          <p className="page-subtitle">
            Formulaire de déclaration et rattachement des pièces jointes
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={PlusCircle}
          title="Module Déclaration d'incident initialisé"
          description="Le formulaire complet avec validation et sélection de catégorie sera disponible à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default CreateIncidentPage
