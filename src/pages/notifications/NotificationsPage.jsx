import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { Bell } from 'lucide-react'

export const NotificationsPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Historique des alertes système et notifications d'événements
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Bell}
          title="Module Notifications initialisé"
          description="Le centre de notifications paginé et interactif sera disponible à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default NotificationsPage
