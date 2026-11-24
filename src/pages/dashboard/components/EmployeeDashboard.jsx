import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, AlertTriangle, Clock, CheckCircle2, RotateCw } from 'lucide-react'
import incidentService from '../../../services/incidentService'
import StatCard from './StatCard'
import RecentIncidentsTable from './RecentIncidentsTable'
import Loading from '../../../components/common/Loading'
import Button from '../../../components/common/Button'

export const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [incidents, setIncidents] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [resolvedCount, setResolvedCount] = useState(0)

  const fetchEmployeeData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const response = await incidentService.searchIncidents({
        page: 0,
        size: 10,
        sort: 'createdAt,desc'
      })

      const content = response?.content || []
      setIncidents(content)
      setTotalCount(response?.totalElements || content.length)

      const inProgress = content.filter(
        (i) => i.status !== 'RESOLU' && i.status !== 'CLOTURE' && i.status !== 'REJETE'
      ).length
      const resolved = content.filter(
        (i) => i.status === 'RESOLU' || i.status === 'CLOTURE'
      ).length

      setInProgressCount(inProgress)
      setResolvedCount(resolved)
    } catch (err) {
      setError(err.message || 'Impossible de charger vos incidents déclarés')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployeeData()
  }, [fetchEmployeeData])

  return (
    <div>
      <div className="dashboard-toolbar">
        <div>
          <h1 className="page-title">Espace Collaborateur</h1>
          <p className="page-subtitle">
            Suivi en temps réel de vos demandes d’assistance et déclarations d’incidents
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RotateCw}
          onClick={() => fetchEmployeeData(true)}
          loading={refreshing}
        >
          Actualiser
        </Button>
      </div>

      <div className="quick-action-banner">
        <div>
          <h2 className="quick-action-title">Un dysfonctionnement ou un équipement en panne ?</h2>
          <p className="quick-action-desc">
            Déclarez immédiatement un incident technique pour que notre équipe et nos diagnostics intelligents le prennent en charge.
          </p>
        </div>
        <Link to="/incidents/create" className="btn btn-primary btn-md" style={{ backgroundColor: 'var(--color-blue-600)', borderColor: 'var(--color-blue-600)' }}>
          <PlusCircle size={18} />
          <span>Déclarer un incident</span>
        </Link>
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
        <Loading message="Chargement de votre suivi d'incidents..." />
      ) : (
        <>
          <div className="dashboard-kpi-grid">
            <StatCard
              title="Mes signalements"
              value={totalCount}
              subtext="Total des incidents déclarés"
              icon={AlertTriangle}
              variant="navy"
            />
            <StatCard
              title="En cours de traitement"
              value={inProgressCount}
              subtext="Prise en charge active"
              icon={Clock}
              variant="primary"
            />
            <StatCard
              title="Incidents résolus"
              value={resolvedCount}
              subtext="Intervention clôturée"
              icon={CheckCircle2}
              variant="success"
            />
          </div>

          <RecentIncidentsTable
            incidents={incidents}
            title="Mes dernières déclarations"
            emptyMessage="Vous n'avez déclaré aucun incident pour le moment."
          />
        </>
      )}
    </div>
  )
}

export default EmployeeDashboard
