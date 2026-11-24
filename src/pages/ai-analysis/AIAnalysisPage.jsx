import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Bot
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import incidentService from '../../services/incidentService'
import aiAnalysisService from '../../services/aiAnalysisService'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import AiAnalysisCard from './components/AiAnalysisCard'
import { formatDateTime, formatDate } from '../../utils/formatters'

export const AIAnalysisPage = () => {
  const { user, isAdmin, isManager } = useAuth()

  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [selectedIncident, setSelectedIncident] = useState(null)
  const [incidentAnalyses, setIncidentAnalyses] = useState([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)
  const [loadingAnalyses, setLoadingAnalyses] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState('')
  const [applyingPriority, setApplyingPriority] = useState(false)

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page: 0,
        size: 50,
        sort: 'createdAt,desc'
      }
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const res = await incidentService.searchIncidents(params)
      const list = res.content || []
      setIncidents(list)

      if (list.length > 0 && !selectedIncident) {
        handleSelectIncident(list[0])
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger la liste des incidents.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleSelectIncident = async (inc) => {
    setSelectedIncident(inc)
    setSelectedAnalysisId(null)
    setIncidentAnalyses([])
    setLoadingAnalyses(true)
    setAiError('')

    try {
      const analyses = await aiAnalysisService.getAnalysesByIncident(inc.id)
      setIncidentAnalyses(analyses || [])
      if (analyses && analyses.length > 0) {
        setSelectedAnalysisId(analyses[0].id)
      }
    } catch (err) {
      setAiError(err.message || 'Impossible de charger les analyses pour cet incident.')
    } finally {
      setLoadingAnalyses(false)
    }
  }

  const handleRunAnalysis = async () => {
    if (!selectedIncident) return
    setAnalyzing(true)
    setAiError('')

    try {
      const newAnalysis = await aiAnalysisService.analyzeIncident(selectedIncident.id)
      setActionSuccess(`Analyse IA terminée pour ${selectedIncident.reference}.`)

      const updatedInc = await incidentService.getIncidentById(selectedIncident.id)
      setSelectedIncident(updatedInc)
      setIncidents((prev) =>
        prev.map((item) => (item.id === updatedInc.id ? updatedInc : item))
      )

      const analyses = await aiAnalysisService.getAnalysesByIncident(selectedIncident.id)
      setIncidentAnalyses(analyses || [])
      if (newAnalysis && newAnalysis.id) {
        setSelectedAnalysisId(newAnalysis.id)
      } else if (analyses && analyses.length > 0) {
        setSelectedAnalysisId(analyses[0].id)
      }

      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setAiError(err.message || "Erreur lors de l'exécution de l'analyse IA.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleApplyPriority = async (suggestedPriority) => {
    if (!suggestedPriority || !selectedIncident) return
    setApplyingPriority(true)

    try {
      await incidentService.updateIncident(selectedIncident.id, {
        title: selectedIncident.title,
        description: selectedIncident.description,
        location: selectedIncident.location,
        priority: suggestedPriority,
        categoryId: selectedIncident.categoryId,
        serviceId: selectedIncident.serviceId
      })

      setActionSuccess(`Priorité de ${selectedIncident.reference} mise à jour à ${suggestedPriority}.`)

      const updatedInc = await incidentService.getIncidentById(selectedIncident.id)
      setSelectedIncident(updatedInc)
      setIncidents((prev) =>
        prev.map((item) => (item.id === updatedInc.id ? updatedInc : item))
      )

      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setAiError(err.message || "Erreur lors de la mise à jour de la priorité.")
    } finally {
      setApplyingPriority(false)
    }
  }

  const currentAnalysis =
    incidentAnalyses.find((a) => a.id === selectedAnalysisId) || incidentAnalyses[0] || null

  const canAnalyze =
    (isAdmin || isManager) &&
    selectedIncident &&
    selectedIncident.status !== 'CLOTURE' &&
    selectedIncident.status !== 'REJETE'

  return (
    <div>
      <div className="ai-banner-card">
        <div className="ai-banner-content">
          <div className="ai-banner-title">
            <Sparkles size={24} style={{ color: '#60a5fa' }} />
            <span>SmartFlow AI Diagnostics & Gemini</span>
          </div>
          <p className="ai-banner-desc">
            Module d'analyse prédictive et d'assistance au diagnostic basé sur Google Gemini.
            Évaluez automatiquement la sévérité d'un incident, détectez les causes potentielles
            et générez des recommandations concrètes pour guider les équipes techniques.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div className="ai-header-badge" style={{ backgroundColor: '#ffffff', color: '#0f2d59' }}>
            <BrainCircuit size={14} />
            Gemini 2.5 Flash
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: '#93c5fd' }}>
            Aide à la décision sous validation humaine
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: '20px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Incidents ({incidents.length})</h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px' }}
              onClick={fetchIncidents}
              title="Rafraîchir"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                className="filter-search-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Réf ou titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              style={{ width: '140px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_ANALYSE">En analyse</option>
              <option value="ASSIGNE">Assigné</option>
              <option value="EN_COURS">En cours</option>
              <option value="RESOLU">Résolu</option>
            </select>
          </div>

          {loading ? (
            <Loading message="Chargement des incidents..." />
          ) : incidents.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Aucun incident trouvé"
              description="Modifiez vos filtres ou effectuez une recherche différente."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
              {incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--color-blue-500)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-blue-50)' : 'var(--color-bg-card)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {inc.reference}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <StatusBadge value={inc.status} type="incidentStatus" />
                        <StatusBadge value={inc.priority} type="priority" />
                      </div>
                    </div>

                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      <span>{inc.serviceName || 'Service non spécifié'}</span>
                      <span>{formatDate(inc.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          {selectedIncident ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="incident-ref-badge">{selectedIncident.reference}</span>
                      <StatusBadge value={selectedIncident.status} type="incidentStatus" />
                      <StatusBadge value={selectedIncident.priority} type="priority" />
                    </div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {selectedIncident.title}
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Déclaré le {formatDateTime(selectedIncident.createdAt)} par {selectedIncident.reporterName || selectedIncident.reporterEmail}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      to={`/incidents/${selectedIncident.id}`}
                      className="btn btn-outline btn-sm"
                      title="Ouvrir la fiche complète"
                    >
                      <Eye size={14} />
                      <span>Fiche incident</span>
                    </Link>

                    {canAnalyze && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Sparkles}
                        loading={analyzing}
                        disabled={analyzing}
                        onClick={handleRunAnalysis}
                      >
                        {incidentAnalyses.length > 0 ? 'Ré-analyser avec Gemini' : 'Lancer analyse IA'}
                      </Button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                  <span className="info-item-label" style={{ display: 'block', marginBottom: '4px' }}>
                    Description signalée :
                  </span>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedIncident.description}
                  </p>
                </div>
              </div>

              {aiError && (
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
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>{aiError}</span>
                </div>
              )}

              {loadingAnalyses ? (
                <Loading message="Chargement des analyses IA..." />
              ) : incidentAnalyses.length > 0 ? (
                <div>
                  {incidentAnalyses.length > 1 && (
                    <div className="ai-history-selector">
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '6px' }}>
                        Historique des diagnostics :
                      </span>
                      {incidentAnalyses.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`ai-history-pill ${currentAnalysis?.id === item.id ? 'active' : ''}`}
                          onClick={() => setSelectedAnalysisId(item.id)}
                        >
                          <Sparkles size={12} />
                          <span>{idx === 0 ? 'Dernier diagnostic' : `Version #${item.id}`} ({formatDate(item.createdAt)})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <AiAnalysisCard
                    analysis={currentAnalysis}
                    currentIncidentPriority={selectedIncident.priority}
                    canApplyPriority={isAdmin || isManager}
                    onApplyPriority={handleApplyPriority}
                    applyingPriority={applyingPriority}
                  />
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Sparkles size={36} style={{ color: 'var(--color-blue-400)', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                    Aucune analyse IA disponible pour cet incident
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                    Déclenchez Google Gemini pour extraire un diagnostic automatisé, suggérer le niveau d'urgence adéquat et formuler des pistes de résolution.
                  </p>
                  {canAnalyze && (
                    <Button
                      variant="primary"
                      size="md"
                      icon={Sparkles}
                      loading={analyzing}
                      disabled={analyzing}
                      onClick={handleRunAnalysis}
                    >
                      Analyser avec Gemini
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <EmptyState
                icon={Bot}
                title="Sélectionnez un incident"
                description="Choisissez un incident dans la liste de gauche pour afficher ses diagnostics IA ou en lancer un nouveau."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIAnalysisPage
