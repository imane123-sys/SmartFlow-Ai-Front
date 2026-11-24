import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { Settings } from 'lucide-react'

export const SettingsPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">
            Configuration globale de l’application et préférences utilisateur
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Settings}
          title="Module Paramètres initialisé"
          description="Les paramètres système et de profil seront enrichis à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default SettingsPage
