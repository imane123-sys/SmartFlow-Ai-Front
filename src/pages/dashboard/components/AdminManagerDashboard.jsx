import React, { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  FileCheck,
  Wrench,
  AlertOctagon,
  Activity,
  Hourglass,
  RotateCw
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import dashboardService from '../../../services/dashboardService'
import incidentService from '../../../services/incidentService'
import StatCard from './StatCard'
import DistributionCard from './DistributionCard'
import RecentIncidentsTable from './RecentIncidentsTable'
import Loading from '../../../components/common/Loading'
import Button from '../../../components/common/Button'
import { incidentStatusConfig, priorityConfig } from '../../../utils/formatters'

export const AdminManagerDashboard = () => {
  const { user, isAdmin } = useAuth()
  const [period, setPeriod] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [summary, setSummary] = useState(null)
  const [statusDistribution, setStatusDistribution] = useState([])
  const [priorityDistribution, setPriorityDistribution] = useState([])
  const [interventionMetrics, setInterventionMetrics] = useState(null)
  const [recentIncidents, setRecentIncidents] = useState([])

  const getPeriodParams = useCallback(() => {
    if (period === 'all') return {}
    const now = new Date()
    const days = period === '7d' ? 7 : 30
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    }
  }, [period])

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const params = getPeriodParams()

      const [summaryRes, statusRes, priorityRes, interventionRes, incidentsRes] =
        await Promise.all([
          dashboardService.getSummary(params).catch(() => null),
          dashboardService.getIncidentsByStatus(params).catch(() => []),
          dashboardService.getIncidentsByPriority(params).catch(() => []),
          dashboardService.getInterventionMetrics(params).catch(() => null),
          incidentService.searchIncidents({ page: 0, size: 5, sort: 'createdAt,desc' }).catch(() => null)
        ])

      setSummary(summaryRes)
      setStatusDistribution(statusRes || [])
      setPriorityDistribution(priorityRes || [])
      setInterventionMetrics(interventionRes)
      setRecentIncidents(incidentsRes?.content || [])
    } catch (err) {
      setError(err.message || 'Impossible de charger les données du tableau de bord')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getPeriodParams])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formattedStatusItems = statusDistribution.map((item) => {
    const config = incidentStatusConfig[item.status] || { label: item.status, variant: 'primary' }
    let color = '#2563eb'
    if (config.variant === 'success') color = '#059669'
    else if (config.variant === 'warning') color = '#d97706'
    else if (config.variant === 'danger') color = '#dc2626'
    else if (config.variant === 'neutral') color = '#64748b'

    return {
      key: item.status,
      label: config.label,
      count: item.count,
      percentage: item.percentage,
      color
    }
  })

  const formattedPriorityItems = priorityDistribution.map((item) => {
    const config = priorityConfig[item.priority] || { label: item.priority }
    let color = '#64748b'
    if (item.priority === 'CRITIQUE') color = '#dc2626'
    else if (item.priority === 'HAUTE') color = '#d97706'
    else if (item.priority === 'MOYENNE') color = '#0284c7'

    return {
      key: item.priority,
      label: config.label,
      count: item.count,
      percentage: item.percentage,
      color
    }
  })

  return (
    <div>
      <div className="dashboard-toolbar">
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Supervision globale' : 'Tableau de bord'}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Indicateurs opérationnels de l'ensemble de l'organisation"
              : `Pôle : ${user?.serviceName || 'Mon Pôle'} — Supervision des incidents et des chartes`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="dashboard-filter-group">
            <button
              type="button"
              className={`dashboard-filter-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
            >
              Tout
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
            >
              30 derniers jours
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
            >
              7 jours
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCw}
            onClick={() => fetchDashboardData(true)}
            loading={refreshing}
          >
            Actualiser
          </Button>
        </div>
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
        <Loading message="Chargement des indicateurs en cours..." />
      ) : (
        <>
          <div className="dashboard-kpi-grid">
            <StatCard
              title="Total incidents"
              value={summary?.totalIncidents ?? 0}
              subtext={`${summary?.newIncidents ?? 0} nouveau(x)`}
              icon={AlertTriangle}
              variant="navy"
            />
            <StatCard
              title="En traitement"
              value={summary?.inProgressIncidents ?? 0}
              subtext="En analyse ou en cours"
              icon={Clock}
              variant="primary"
            />
            <StatCard
              title="Incidents résolus"
              value={summary?.resolvedIncidents ?? 0}
              subtext={`${summary?.closedIncidents ?? 0} clôturé(s)`}
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title="Chartes à valider"
              value={summary?.pendingCharters ?? 0}
              subtext="Validation requise"
              icon={FileCheck}
              variant="warning"
            />
            <StatCard
              title="Interventions"
              value={summary?.totalInterventions ?? 0}
              subtext={`${summary?.activeInterventions ?? 0} active(s)`}
              icon={Wrench}
              variant="primary"
            />
            <StatCard
              title="Interventions bloquées"
              value={summary?.blockedInterventions ?? 0}
              subtext="Étape en blocage"
              icon={AlertOctagon}
              variant="danger"
            />
            <StatCard
              title="Taux de complétion"
              value={
                interventionMetrics?.completionRate !== undefined
                  ? `${interventionMetrics.completionRate}%`
                  : '-'
              }
              subtext="Interventions achevées"
              icon={Activity}
              variant="success"
            />
            <StatCard
              title="Délai moy. résolution"
              value={
                summary?.averageResolutionTimeHours !== null && summary?.averageResolutionTimeHours !== undefined
                  ? `${summary.averageResolutionTimeHours} h`
                  : '-'
              }
              subtext="Du signalement à la clôture"
              icon={Hourglass}
              variant="primary"
            />
          </div>

          <div className="dashboard-split-grid">
            <DistributionCard
              title="Répartition des incidents par statut"
              items={formattedStatusItems}
              emptyMessage="Aucun incident dans la période sélectionnée"
            />
            <DistributionCard
              title="Répartition des incidents par priorité"
              items={formattedPriorityItems}
              emptyMessage="Aucun incident dans la période sélectionnée"
            />
          </div>

          <RecentIncidentsTable
            incidents={recentIncidents}
            title={isAdmin ? "Derniers incidents de l'organisation" : "Derniers incidents du pôle"}
          />
        </>
      )}
    </div>
  )
}

export default AdminManagerDashboard
