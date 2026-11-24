import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { Users } from 'lucide-react'

export const UsersPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            Administration des comptes collaborateurs, attribution des pôles et des rôles
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Users}
          title="Module Utilisateurs initialisé"
          description="La gestion administrative des utilisateurs et des permissions sera disponible à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default UsersPage
