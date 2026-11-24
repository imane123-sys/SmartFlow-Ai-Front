import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Clock, CheckCircle2, RotateCw, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import interventionService from '../../../services/interventionService'
import incidentService from '../../../services/incidentService'
import StatCard from './StatCard'
import RecentIncidentsTable from './RecentIncidentsTable'
import Loading from '../../../components/common/Loading'
import Button from '../../../components/common/Button'
import StatusBadge from '../../../components/common/StatusBadge'
import { formatDate } from '../../../utils/formatters'

export const AgentDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [interventions, setInterventions] = useState([])
  const [totalInterventions, setTotalInterventions] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [recentIncidents, setRecentIncidents] = useState([])

  const fetchAgentData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [interventionsRes, incidentsRes] = await Promise.all([
        interventionService.searchInterventions({ page: 0, size: 10, sort: 'createdAt,desc' }),
        incidentService.searchIncidents({ page: 0, size: 5, sort: 'createdAt,desc' })
      ])

      const content = interventionsRes?.content || []
      setInterventions(content)
      setTotalInterventions(interventionsRes?.totalElements || content.length)

      const active = content.filter(
        (i) => i.status === 'EN_COURS' || i.status === 'AFFECTEE' || i.status === 'PLANIFIEE'
      ).length
      const completed = content.filter((i) => i.status === 'TERMINEE').length

      setActiveCount(active)
      setCompletedCount(completed)
      setRecentIncidents(incidentsRes?.content || [])
    } catch (err) {
      setError(err.message || 'Impossible de charger vos interventions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAgentData()
  }, [fetchAgentData])

  return (
    <div>
      <div className="dashboard-toolbar">
        <div>
          <h1 className="page-title">Espace Agent Technique</h1>
          <p className="page-subtitle">
            Suivi de vos interventions terrain, exécution des étapes et incidents rattachés
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RotateCw}
          onClick={() => fetchAgentData(true)}
          loading={refreshing}
        >
          Actualiser
        </Button>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: '20px'
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Chargement de vos interventions..." />
      ) : (
        <>
          <div className="dashboard-kpi-grid">
            <StatCard
              title="Mes interventions actives"
              value={activeCount}
              subtext="À traiter ou en cours"
              icon={Clock}
              variant="primary"
            />
            <StatCard
              title="Interventions terminées"
              value={completedCount}
              subtext="Clôturées avec succès"
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Total interventions"
              value={totalInterventions}
              subtext="Affectées à votre pôle"
              icon={Wrench}
              variant="navy"
            />
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Mes interventions prioritaires</h3>
              <Link
                to="/interventions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.813rem',
                  fontWeight: 600
                }}
              >
                Toutes mes interventions <ArrowUpRight size={14} />
              </Link>
            </div>

            {interventions.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
                Aucune intervention ne vous est affectée pour le moment.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-recent-table">
                  <thead>
                    <tr>
                      <th>Réf. Intervention</th>
                      <th>Incident associé</th>
                      <th>Statut</th>
                      <th>Date prévue</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interventions.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          {item.reference}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{item.incidentTitle}</div>
                          {item.incidentReference && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {item.incidentReference}
                            </span>
                          )}
                        </td>
                        <td>
                          <StatusBadge value={item.status} type="interventionStatus" />
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.813rem' }}>
                          {formatDate(item.scheduledStartDate || item.createdAt)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/interventions/${item.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            Suivre
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <RecentIncidentsTable
            incidents={recentIncidents}
            title="Incidents récents dans votre périmètre"
          />
        </>
      )}
    </div>
  )
}

export default AgentDashboard
