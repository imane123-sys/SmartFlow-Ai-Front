import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, RotateCw, AlertTriangle, ArrowRight, ArrowUpDown } from 'lucide-react'
import incidentService from '../../services/incidentService'
import categoryService from '../../services/categoryService'
import serviceService from '../../services/serviceService'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/formatters'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'NOUVEAU', label: 'Nouveau' },
  { value: 'EN_ANALYSE', label: 'En analyse' },
  { value: 'EN_ATTENTE_VALIDATION', label: 'En attente validation' },
  { value: 'ASSIGNE', label: 'Assigné' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'RESOLU', label: 'Résolu' },
  { value: 'CLOTURE', label: 'Clôturé' },
  { value: 'REJETE', label: 'Rejeté' }
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'Toutes les priorités' },
  { value: 'BASSE', label: 'Basse' },
  { value: 'MOYENNE', label: 'Moyenne' },
  { value: 'HAUTE', label: 'Haute' },
  { value: 'CRITIQUE', label: 'Critique' }
]

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Plus récents d’abord' },
  { value: 'createdAt,asc', label: 'Plus anciens d’abord' },
  { value: 'priority,desc', label: 'Priorité plus haute' },
  { value: 'title,asc', label: 'Titre alphabétique' }
]

export const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([])
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [sortBy, setSortBy] = useState('createdAt,desc')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, srvRes] = await Promise.all([
          categoryService.getAllCategories({ activeOnly: true }),
          serviceService.getAllServices({ activeOnly: true })
        ])
        setCategories(catRes || [])
        setServices(srvRes || [])
      } catch {
        setCategories([])
        setServices([])
      }
    }
    fetchDropdowns()
  }, [])

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        page,
        size: 10,
        sort: sortBy
      }

      if (search.trim()) params.search = search.trim()
      if (status) params.status = status
      if (priority) params.priority = priority
      if (categoryId) params.categoryId = categoryId
      if (serviceId) params.serviceId = serviceId

      const response = await incidentService.searchIncidents(params)
      setIncidents(response?.content || [])
      setTotalPages(response?.totalPages || 0)
      setTotalElements(response?.totalElements || 0)
    } catch (err) {
      setError(err.message || 'Impossible de récupérer la liste des incidents')
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, status, priority, categoryId, serviceId, sortBy])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleResetFilters = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setCategoryId('')
    setServiceId('')
    setSortBy('createdAt,desc')
    setPage(0)
  }

  const columns = [
    {
      key: 'reference',
      header: 'Référence',
      width: '130px',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          {row.reference}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Titre & Catégorie',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px' }}>
            <span>{row.categoryName || 'Catégorie non spécifiée'}</span>
            {row.serviceName && <span>• {row.serviceName}</span>}
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priorité',
      width: '110px',
      render: (row) => <StatusBadge value={row.priority} type="priority" />
    },
    {
      key: 'status',
      header: 'Statut',
      width: '150px',
      render: (row) => <StatusBadge value={row.status} type="incidentStatus" />
    },
    {
      key: 'reporterName',
      header: 'Déclarant',
      render: (row) => row.reporterName || row.reporterEmail || '-'
    },
    {
      key: 'assignedToName',
      header: 'Assigné à',
      render: (row) => (
        <span style={{ color: row.assignedToName ? 'var(--color-text-main)' : 'var(--color-text-light)' }}>
          {row.assignedToName || 'Non assigné'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '110px',
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'actions',
      header: 'Action',
      width: '90px',
      render: (row) => (
        <Link
          to={`/incidents/${row.id}`}
          className="btn btn-outline btn-sm"
          style={{ padding: '4px 8px' }}
        >
          Voir <ArrowRight size={12} />
        </Link>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Incidents</h1>
          <p className="page-subtitle">
            Consultation, recherche multi-critères et suivi du cycle de vie des incidents
          </p>
        </div>

        <Link to="/incidents/create" className="btn btn-primary btn-md">
          <PlusCircle size={16} />
          <span>Déclarer un incident</span>
        </Link>
      </div>

      <div className="filter-toolbar">
        <div className="filter-row">
          <div className="filter-item" style={{ minWidth: '240px' }}>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="input-field has-icon-left"
                placeholder="Rechercher par référence, mot-clé..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          </div>

          <div className="filter-item">
            <select
              className="filter-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select
              className="filter-select"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value)
                setPage(0)
              }}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select
              className="filter-select"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select
              className="filter-select"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Tous les services</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(0)
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleResetFilters}
            title="Réinitialiser les filtres"
          >
            Réinitialiser
          </button>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCw}
            onClick={fetchIncidents}
            disabled={loading}
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

      <DataTable
        columns={columns}
        data={incidents}
        loading={loading}
        emptyTitle="Aucun incident trouvé"
        emptyDescription="Aucun incident ne correspond aux critères de recherche sélectionnés."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}

export default IncidentsPage
