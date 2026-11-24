import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import StatusBadge from '../../../components/common/StatusBadge'
import { formatDate } from '../../../utils/formatters'

export const RecentIncidentsTable = ({
  incidents = [],
  title = 'Incidents récents',
  emptyMessage = 'Aucun incident récent enregistré.'
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <Link
          to="/incidents"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.813rem',
            fontWeight: 600
          }}
        >
          Tous les incidents <ArrowUpRight size={14} />
        </Link>
      </div>

      {!incidents || incidents.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
          {emptyMessage}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-recent-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Titre</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {incident.reference}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{incident.title}</div>
                    {incident.categoryName && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {incident.categoryName}
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge value={incident.priority} type="priority" />
                  </td>
                  <td>
                    <StatusBadge value={incident.status} type="incidentStatus" />
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.813rem' }}>
                    {formatDate(incident.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecentIncidentsTable
