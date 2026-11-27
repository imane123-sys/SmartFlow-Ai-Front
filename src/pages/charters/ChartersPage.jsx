import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import charterService from '../../services/charterService'
import incidentService from '../../services/incidentService'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import CharterForm from './components/CharterForm'
import { getCharterId } from './charterHelpers'
import { charterStatusConfig, formatDateTime } from '../../utils/formatters'

export const ChartersPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['MANAGER', 'ADMIN'])

  const incidentFromUrl = searchParams.get('incident')
  const [charters, setCharters] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [restrictedCount, setRestrictedCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(incidentFromUrl))
  const [incidentOptions, setIncidentOptions] = useState([])
  const [incidentSearch, setIncidentSearch] = useState('')
  const [incidentLoading, setIncidentLoading] = useState(false)
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidentFromUrl || '')
  const [creationMode, setCreationMode] = useState('ai')
  const [creating, setCreating] = useState(false)
  const [creationError, setCreationError] = useState('')

  const loadCharters = useCallback(async (pageNumber = 0, append = false, term = '') => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const params = { page: pageNumber, size: 30, sort: 'createdAt,desc' }
      if (term) {
        params.search = term
      }

      const incidentPage = await incidentService.searchIncidents(params)
      const incidents = incidentPage?.content || []

      const results = await Promise.all(
        incidents.map(async (incident) => {
          try {
            const incidentCharters = await charterService.getChartersByIncident(incident.id)
            return Array.isArray(incidentCharters) ? incidentCharters : []
          } catch (err) {
            if (err?.status === 403) {
              return null
            }
            throw err
          }
        })
      )

      const collected = results.reduce(
        (acc, list) => (Array.isArray(list) ? acc.concat(list) : acc),
        []
      )
      collected.sort((a, b) => {
        const left = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const right = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return right - left
      })

      setCharters((prev) => (append ? [...prev, ...collected] : collected))
      setRestrictedCount(results.filter((result) => result === null).length)
      setHasMore(Boolean(incidentPage && !incidentPage.last))
      setPage(pageNumber)
    } catch (err) {
      setError(err.message || 'Impossible de charger les chartes d’intervention')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadCharters(0, false, '')
  }, [loadCharters])

  const fetchIncidentOptions = useCallback(async (term = '') => {
    setIncidentLoading(true)
    setCreationError('')
    try {
      const params = { page: 0, size: 30, sort: 'createdAt,desc' }
      if (term) {
        params.search = term
      }
      const incidentPage = await incidentService.searchIncidents(params)
      setIncidentOptions(incidentPage?.content || [])
    } catch (err) {
      setCreationError(err.message || 'Impossible de charger les incidents')
    } finally {
      setIncidentLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isCreateModalOpen) {
      setCreationError('')
      fetchIncidentOptions('')
    }
  }, [isCreateModalOpen, fetchIncidentOptions])

  const filteredCharters = useMemo(
    () => charters.filter((charter) => !statusFilter || charter.status === statusFilter),
    [charters, statusFilter]
  )

  const selectedIncident = incidentOptions.find(
    (incident) => String(incident.id) === String(selectedIncidentId)
  )
  const selectedIncidentAllowed =
    selectedIncident && !['CLOTURE', 'REJETE'].includes(selectedIncident.status)

  const openCreateModal = (incidentId = '') => {
    setSelectedIncidentId(incidentId)
    setCreationMode('ai')
    setCreationError('')
    setIncidentSearch('')
    setIsCreateModalOpen(true)
    if (incidentId) {
      setSearchParams({ incident: incidentId }, { replace: true })
    } else if (searchParams.has('incident')) {
      setSearchParams({}, { replace: true })
    }
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreationError('')
    if (searchParams.has('incident')) {
      setSearchParams({}, { replace: true })
    }
  }

  const handleSearch = () => {
    loadCharters(0, false, searchTerm.trim())
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    loadCharters(0, false, '')
  }

  const handleGenerateDraft = async () => {
    if (!selectedIncidentAllowed) return
    setCreating(true)
    setCreationError('')
    try {
      const created = await charterService.generateCharterDraft(selectedIncident.id)
      const createdId = getCharterId(created)
      if (createdId === null) {
        throw new Error('Le backend n’a pas renvoyé d’identifiant de charte.')
      }
      closeCreateModal()
      navigate(`/charters/${createdId}`)
    } catch (err) {
      setCreationError(err.message || 'Impossible de générer le brouillon de charte')
    } finally {
      setCreating(false)
    }
  }

  const handleManualCreate = async (payload) => {
    if (!selectedIncidentAllowed) return
    setCreating(true)
    setCreationError('')
    try {
      const created = await charterService.createManualCharter(selectedIncident.id, payload)
      const createdId = getCharterId(created)
      if (createdId === null) {
        throw new Error('Le backend n’a pas renvoyé d’identifiant de charte.')
      }
      closeCreateModal()
      navigate(`/charters/${createdId}`)
    } catch (err) {
      setCreationError(err.message || 'Impossible de créer la charte')
    } finally {
      setCreating(false)
    }
  }

  const columns = [
    {
      key: 'reference',
      header: 'Charte',
      render: (charter) => (
        <div>
          <div className="charter-cell-primary">Charte #{charter.id}</div>
          <div className="charter-cell-secondary">
            Version {charter.versionNumber ?? '-'}
          </div>
        </div>
      )
    },
    {
      key: 'incident',
      header: 'Incident',
      render: (charter) =>
        charter.incidentId ? (
          <Link
            to={`/incidents/${charter.incidentId}`}
            className="charter-link"
            title="Ouvrir l'incident associé"
          >
            {charter.incidentReference || `Incident #${charter.incidentId}`}
            <ArrowUpRight size={13} />
          </Link>
        ) : (
          '-'
        )
    },
    {
      key: 'title',
      header: 'Titre',
      render: (charter) => <span className="charter-cell-title">{charter.title}</span>
    },
    {
      key: 'status',
      header: 'Statut',
      render: (charter) => <StatusBadge value={charter.status} type="charterStatus" />
    },
    {
      key: 'createdAt',
      header: 'Créée le',
      render: (charter) => formatDateTime(charter.createdAt || charter.updatedAt)
    },
    {
      key: 'createdBy',
      header: 'Responsable',
      render: (charter) => charter.createdByName || '-'
    },
    {
      key: 'actions',
      header: '',
      render: (charter) => (
        <Link to={`/charters/${charter.id}`} className="btn btn-outline btn-sm">
          Ouvrir
        </Link>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chartes d'Intervention</h1>
          <p className="page-subtitle">
            Consultation, création et suivi du cycle de validation des chartes
          </p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={() => openCreateModal()}>
            Nouvelle charte
          </Button>
        )}
      </div>

      {error && (
        <div className="charter-alert charter-alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {restrictedCount > 0 && (
        <div className="charter-alert charter-alert-info">
          <AlertTriangle size={18} />
          <span>
            {restrictedCount} incident(s) ont été ignorés car leur accès est refusé à votre profil.
          </span>
        </div>
      )}

      <div className="filter-toolbar">
        <div className="filter-row">
          <div className="filter-item">
            <Input
              name="charterSearch"
              placeholder="Rechercher une référence ou un titre d'incident..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              icon={Search}
            />
          </div>
          <div className="filter-item charter-status-filter">
            <label className="input-label" htmlFor="charterStatusFilter">
              Statut
            </label>
            <select
              id="charterStatusFilter"
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(charterStatusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Rechercher
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={handleReset}>
            Réinitialiser
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCharters}
        loading={loading}
        emptyTitle="Aucune charte d'intervention"
        emptyDescription="Aucune charte n'est disponible pour les incidents accessibles."
      />

      {hasMore && (
        <div className="charter-load-more">
          <Button
            variant="outline"
            loading={loadingMore}
            disabled={loadingMore}
            onClick={() => loadCharters(page + 1, true, searchTerm.trim())}
          >
            Charger plus de chartes
          </Button>
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Nouvelle charte d'intervention"
      >
        <div className="charter-create-modal">
          <div className="charter-field">
            <label className="input-label" htmlFor="charterIncidentSelect">
              Incident associé<span className="input-required">*</span>
            </label>
            <div className="charter-incident-search">
              <Input
                name="charterIncidentSearch"
                placeholder="Rechercher un incident..."
                value={incidentSearch}
                onChange={(event) => setIncidentSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') fetchIncidentOptions(incidentSearch.trim())
                }}
                icon={Search}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={incidentLoading}
                onClick={() => fetchIncidentOptions(incidentSearch.trim())}
              >
                Rechercher
              </Button>
            </div>
            <select
              id="charterIncidentSelect"
              className="filter-select"
              value={selectedIncidentId}
              onChange={(event) => setSelectedIncidentId(event.target.value)}
              disabled={incidentLoading}
            >
              <option value="">Sélectionner un incident</option>
              {incidentOptions.map((incident) => (
                <option
                  key={incident.id}
                  value={incident.id}
                  disabled={['CLOTURE', 'REJETE'].includes(incident.status)}
                >
                  {incident.reference} — {incident.title}
                  {['CLOTURE', 'REJETE'].includes(incident.status) ? ' (clôturé/rejeté)' : ''}
                </option>
              ))}
            </select>
            {incidentLoading && <span className="input-helper-text">Chargement des incidents...</span>}
          </div>

          <div className="charter-mode-switch">
            <button
              type="button"
              className={`charter-mode-tab ${creationMode === 'ai' ? 'active' : ''}`}
              onClick={() => setCreationMode('ai')}
            >
              <Sparkles size={15} /> Génération assistée
            </button>
            <button
              type="button"
              className={`charter-mode-tab ${creationMode === 'manual' ? 'active' : ''}`}
              onClick={() => setCreationMode('manual')}
            >
              Création manuelle
            </button>
          </div>

          {creationError && (
            <div className="charter-alert charter-alert-error">
              <AlertTriangle size={18} />
              <span>{creationError}</span>
            </div>
          )}

          {creationMode === 'ai' ? (
            <div className="charter-mode-panel">
              <p className="charter-mode-help">
                Le brouillon est généré à partir de l'incident et de sa dernière analyse IA.
                Aucune validation n'est effectuée automatiquement.
              </p>
              <div className="charter-form-actions">
                <Button variant="outline" onClick={closeCreateModal} disabled={creating}>
                  Annuler
                </Button>
                <Button
                  icon={Sparkles}
                  loading={creating}
                  disabled={creating || !selectedIncidentAllowed}
                  onClick={handleGenerateDraft}
                >
                  Générer le brouillon
                </Button>
              </div>
            </div>
          ) : selectedIncidentAllowed ? (
            <CharterForm
              key={`manual-${selectedIncidentId}`}
              initialValues={null}
              onSubmit={handleManualCreate}
              onCancel={closeCreateModal}
              submitting={creating}
              submitLabel="Créer le brouillon"
            />
          ) : (
            <div className="charter-mode-panel">
              <p className="charter-mode-help">
                Sélectionnez un incident ouvert pour créer une charte manuellement.
              </p>
              <div className="charter-form-actions">
                <Button variant="outline" onClick={closeCreateModal}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ChartersPage
