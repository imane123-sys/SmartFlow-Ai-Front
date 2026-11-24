import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Edit,
  Download,
  Trash2,
  Upload,
  AlertTriangle,
  Clock,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Bot
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import incidentService from '../../services/incidentService'
import categoryService from '../../services/categoryService'
import serviceService from '../../services/serviceService'
import attachmentService from '../../services/attachmentService'
import charterService from '../../services/charterService'
import interventionService from '../../services/interventionService'
import userService from '../../services/userService'
import aiAnalysisService from '../../services/aiAnalysisService'

import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Loading from '../../components/common/Loading'
import Input from '../../components/common/Input'
import { formatDateTime, formatDate } from '../../utils/formatters'
import AiAnalysisCard from '../ai-analysis/components/AiAnalysisCard'

const getAvailableTransitions = (currentStatus, role) => {
  if (role === 'AGENT') {
    return [
      { value: 'EN_COURS', label: 'En cours d\'intervention' },
      { value: 'EN_ATTENTE', label: 'Mettre en attente (pièce manquante / blocage)' },
      { value: 'RESOLU', label: 'Déclarer résolu' }
    ].filter((t) => t.value !== currentStatus)
  }

  const map = {
    NOUVEAU: [
      { value: 'EN_ANALYSE', label: 'En analyse' },
      { value: 'EN_ATTENTE_VALIDATION', label: 'En attente de validation' },
      { value: 'ASSIGNE', label: 'Assigner' },
      { value: 'REJETE', label: 'Rejeter l\'incident' }
    ],
    EN_ANALYSE: [
      { value: 'EN_ATTENTE_VALIDATION', label: 'En attente de validation' },
      { value: 'ASSIGNE', label: 'Assigner' },
      { value: 'EN_COURS', label: 'Passer en cours' },
      { value: 'REJETE', label: 'Rejeter' }
    ],
    EN_ATTENTE_VALIDATION: [
      { value: 'ASSIGNE', label: 'Assigner' },
      { value: 'EN_COURS', label: 'Passer en cours' },
      { value: 'REJETE', label: 'Rejeter' }
    ],
    ASSIGNE: [
      { value: 'EN_COURS', label: 'Démarrer (En cours)' },
      { value: 'EN_ATTENTE', label: 'Mettre en attente' },
      { value: 'REJETE', label: 'Rejeter' }
    ],
    EN_COURS: [
      { value: 'EN_ATTENTE', label: 'Mettre en attente' },
      { value: 'RESOLU', label: 'Résoudre' },
      { value: 'REJETE', label: 'Rejeter' }
    ],
    EN_ATTENTE: [
      { value: 'EN_COURS', label: 'Reprendre en cours' },
      { value: 'REJETE', label: 'Rejeter' }
    ],
    RESOLU: [
      { value: 'CLOTURE', label: 'Clôturer définitivement' },
      { value: 'EN_COURS', label: 'Rouvrir l\'incident (En cours)' }
    ],
    CLOTURE: [
      { value: 'EN_COURS', label: 'Rouvrir l\'incident (En cours)' }
    ],
    REJETE: [
      { value: 'NOUVEAU', label: 'Réexaminer (Repasser en Nouveau)' }
    ]
  }

  return map[currentStatus] || []
}

export const IncidentDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isManager, isAgent } = useAuth()

  const [incident, setIncident] = useState(null)
  const [history, setHistory] = useState([])
  const [charters, setCharters] = useState([])
  const [interventions, setInterventions] = useState([])
  const [attachments, setAttachments] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState('')
  const [applyingAiPriority, setApplyingAiPriority] = useState(false)

  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [agents, setAgents] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState('')

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [assignAgentId, setAssignAgentId] = useState('')
  const [assignComment, setAssignComment] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [statusError, setStatusError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editServiceId, setEditServiceId] = useState('')
  const [editing, setEditing] = useState(false)

  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchIncidentDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await incidentService.getIncidentById(id)
      setIncident(data)
      setAttachments(data.attachments || [])

      const [histRes, chartersRes, intervRes, analysesRes] = await Promise.all([
        incidentService.getIncidentHistory(id).catch(() => []),
        charterService.getChartersByIncident(id).catch(() => []),
        interventionService.getInterventionsByIncident(id).catch(() => []),
        aiAnalysisService.getAnalysesByIncident(id).catch(() => [])
      ])

      setHistory(histRes || [])
      setCharters(chartersRes || [])
      setInterventions(intervRes || [])
      const fetchedAnalyses = analysesRes || []
      setAnalyses(fetchedAnalyses)
      if (fetchedAnalyses.length > 0) {
        setSelectedAnalysisId((prev) => (prev ? prev : fetchedAnalyses[0].id))
      }
    } catch (err) {
      setError(err.message || "Impossible de charger les informations de l'incident")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchIncidentDetails()
  }, [fetchIncidentDetails])

  useEffect(() => {
    if (isAdmin || isManager) {
      const fetchFormOptions = async () => {
        try {
          const [cats, srvs] = await Promise.all([
            categoryService.getAllCategories({ activeOnly: true }),
            serviceService.getAllServices({ activeOnly: true })
          ])
          setCategories(cats || [])
          setServices(srvs || [])

          if (isAdmin) {
            const agentList = await userService.getAllUsers({ role: 'AGENT', active: true }).catch(() => [])
            setAgents(agentList || [])
          }
        } catch {
        }
      }
      fetchFormOptions()
    }
  }, [isAdmin, isManager])

  const canAssign = isAdmin || isManager
  const isAssignedAgent = isAgent && incident?.assignedToId === user?.id
  const canUpdateStatus = isAdmin || isManager || isAssignedAgent
  const isReporter = incident?.reporterId === user?.id
  const canEdit =
    (isAdmin || isManager || (isReporter && incident?.status === 'NOUVEAU')) &&
    incident?.status !== 'RESOLU' &&
    incident?.status !== 'CLOTURE'

  const handleOpenAssignModal = () => {
    setAssignAgentId(incident.assignedToId || (agents[0]?.id || ''))
    setAssignComment('')
    setIsAssignModalOpen(true)
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignAgentId) return
    setAssigning(true)
    setError(null)

    try {
      await incidentService.assignIncident(id, {
        agentId: Number(assignAgentId),
        comment: assignComment.trim() || undefined
      })
      setIsAssignModalOpen(false)
      setActionSuccess("L'incident a été assigné avec succès.")
      fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      setError(err.message || "Erreur lors de l'assignation de l'incident")
    } finally {
      setAssigning(false)
    }
  }

  const handleOpenStatusModal = () => {
    const transitions = getAvailableTransitions(incident.status, user?.role)
    setNewStatus(transitions[0]?.value || incident.status)
    setStatusComment('')
    setStatusError('')
    setIsStatusModalOpen(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    setStatusError('')

    if (!newStatus) return

    const requiresComment = ['REJETE', 'CLOTURE', 'EN_ATTENTE', 'RESOLU'].includes(newStatus)
    if (requiresComment && !statusComment.trim()) {
      setStatusError('Un motif explicite ou compte rendu est obligatoire pour cette transition.')
      return
    }

    setUpdatingStatus(true)
    setError(null)

    try {
      await incidentService.updateStatus(id, {
        status: newStatus,
        comment: statusComment.trim() || undefined
      })
      setIsStatusModalOpen(false)
      setActionSuccess("Le statut de l'incident a été mis à jour avec succès.")
      fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de statut')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleOpenEditModal = () => {
    setEditTitle(incident.title || '')
    setEditDescription(incident.description || '')
    setEditLocation(incident.location || '')
    setEditPriority(incident.priority || 'MOYENNE')
    setEditCategoryId(incident.categoryId || '')
    setEditServiceId(incident.serviceId || '')
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditing(true)
    setError(null)

    try {
      await incidentService.updateIncident(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim() || null,
        priority: editPriority,
        categoryId: Number(editCategoryId),
        serviceId: Number(editServiceId)
      })
      setIsEditModalOpen(false)
      setActionSuccess("Les informations de l'incident ont été mises à jour.")
      fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de l'incident")
    } finally {
      setEditing(false)
    }
  }

  const handleUploadAttachment = async (e) => {
    e.preventDefault()
    if (!uploadFile) return
    setUploading(true)
    setError(null)

    try {
      await attachmentService.uploadAttachment(id, uploadFile)
      setUploadFile(null)
      setActionSuccess('Pièce jointe téléversée avec succès.')
      fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi de la pièce jointe")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attId) => {
    if (!window.confirm('Voulez-vous supprimer cette pièce jointe ?')) return
    try {
      await attachmentService.deleteAttachment(attId)
      setAttachments((prev) => prev.filter((a) => a.id !== attId))
      setActionSuccess('Pièce jointe supprimée.')
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de la pièce jointe')
    }
  }

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true)
    setAiError('')
    setError(null)

    try {
      const res = await aiAnalysisService.analyzeIncident(id)
      setActionSuccess("L'analyse IA a été réalisée avec succès par Gemini.")
      if (res && res.id) {
        setSelectedAnalysisId(res.id)
      }
      await fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setAiError(err.message || "Erreur lors de l'analyse IA de l'incident.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleApplyAiPriority = async (suggestedPriority) => {
    if (!suggestedPriority || !incident) return
    setApplyingAiPriority(true)
    setError(null)

    try {
      await incidentService.updateIncident(id, {
        title: incident.title,
        description: incident.description,
        location: incident.location,
        priority: suggestedPriority,
        categoryId: incident.categoryId,
        serviceId: incident.serviceId
      })
      setActionSuccess(`La priorité de l'incident a été mise à jour à ${suggestedPriority} selon la recommandation de l'IA.`)
      await fetchIncidentDetails()
      setTimeout(() => setActionSuccess(''), 4000)
    } catch (err) {
      setError(err.message || "Erreur lors de l'application de la priorité recommandée.")
    } finally {
      setApplyingAiPriority(false)
    }
  }

  if (loading) {
    return <Loading message="Chargement des détails de l'incident..." />
  }

  if (!incident) {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/incidents" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} /> Retour à la liste
          </Link>
        </div>
        <div className="card">
          <p style={{ color: 'var(--color-danger)' }}>Incident introuvable ou accès refusé.</p>
        </div>
      </div>
    )
  }

  const availableTransitions = getAvailableTransitions(incident.status, user?.role)
  const selectedAnalysis =
    analyses.find((a) => a.id === selectedAnalysisId) || analyses[0] || null

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/incidents"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Retour à la liste des incidents
        </Link>
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

      <div className="incident-detail-header">
        <div className="incident-detail-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="incident-ref-badge">{incident.reference}</span>
            <StatusBadge value={incident.status} type="incidentStatus" />
            <StatusBadge value={incident.priority} type="priority" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {incident.title}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Déclaré le {formatDateTime(incident.createdAt)} par {incident.reporterName || incident.reporterEmail}
          </p>
        </div>

        <div className="incident-detail-actions">
          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              loading={analyzing}
              disabled={analyzing || incident.status === 'CLOTURE' || incident.status === 'REJETE'}
              onClick={handleRunAiAnalysis}
            >
              {analyses.length > 0 ? "Ré-analyser avec l'IA" : "Analyser avec l'IA"}
            </Button>
          )}

          {canEdit && (
            <Button variant="outline" size="sm" icon={Edit} onClick={handleOpenEditModal}>
              Modifier
            </Button>
          )}

          {canAssign && (
            <Button variant="outline" size="sm" icon={UserCheck} onClick={handleOpenAssignModal}>
              {incident.assignedToId ? 'Réassigner' : 'Assigner à un agent'}
            </Button>
          )}

          {canUpdateStatus && availableTransitions.length > 0 && (
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleOpenStatusModal}>
              Changer le statut
            </Button>
          )}
        </div>
      </div>

      <div className="incident-grid-layout">
        <div className="incident-info-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Description du dysfonctionnement</h3>
            </div>
            <p style={{ fontSize: '0.938rem', lineHeight: 1.7, color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
              {incident.description}
            </p>
            {incident.location && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                <span className="info-item-label">Emplacement exact :</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', marginLeft: '8px' }}>
                  {incident.location}
                </span>
              </div>
            )}
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

          {analyses.length > 0 ? (
            <div>
              {analyses.length > 1 && (
                <div className="ai-history-selector">
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '6px' }}>
                    Historique des diagnostics :
                  </span>
                  {analyses.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`ai-history-pill ${selectedAnalysis?.id === item.id ? 'active' : ''}`}
                      onClick={() => setSelectedAnalysisId(item.id)}
                    >
                      <Sparkles size={12} />
                      <span>{idx === 0 ? 'Dernier diagnostic' : `Version #${item.id}`} ({formatDate(item.createdAt)})</span>
                    </button>
                  ))}
                </div>
              )}

              <AiAnalysisCard
                analysis={selectedAnalysis}
                currentIncidentPriority={incident.priority}
                canApplyPriority={isAdmin || isManager}
                onApplyPriority={handleApplyAiPriority}
                applyingPriority={applyingAiPriority}
              />
            </div>
          ) : (
            <div className="card" style={{ borderLeft: '4px solid var(--color-blue-500)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ maxWidth: '580px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={18} style={{ color: 'var(--color-blue-600)' }} />
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Diagnostic intelligent par Google Gemini
                    </h3>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Obtenez une analyse instantanée de l'incident : synthèse du problème, identification des causes probables, préconisation de priorité et recommandations concrètes de résolution.
                  </p>
                </div>
                {(isAdmin || isManager) ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    loading={analyzing}
                    disabled={analyzing || incident.status === 'CLOTURE' || incident.status === 'REJETE'}
                    onClick={handleRunAiAnalysis}
                  >
                    Analyser avec l'IA
                  </Button>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Aucune analyse IA effectuée pour le moment
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pièces jointes ({attachments.length})</h3>
            </div>

            {attachments.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                Aucune pièce jointe rattachée à cet incident.
              </p>
            ) : (
              <div className="attachment-list">
                {attachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-info">
                      <Paperclip size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <div>
                        <div className="attachment-name" title={att.originalName}>
                          {att.originalName}
                        </div>
                        <div className="attachment-size">
                          {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} Ko` : '-'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => attachmentService.downloadAttachment(att.id, att.originalName)}
                        title="Télécharger"
                      >
                        <Download size={14} />
                      </button>
                      {(isAdmin || isManager || att.uploadedByEmail === user?.email) && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteAttachment(att.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleUploadAttachment} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0] || null)}
                  disabled={uploading}
                  style={{ fontSize: '0.813rem' }}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  loading={uploading}
                  disabled={!uploadFile || uploading}
                >
                  Ajouter
                </Button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Historique et journal des événements</h3>
            </div>

            {history.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                Aucun historique enregistré pour le moment.
              </p>
            ) : (
              <div className="timeline">
                {history.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot">
                      <Clock size={12} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-operator">
                          {item.operatorName || item.operatorEmail || 'Système'}
                        </span>
                        <span className="timeline-date">{formatDateTime(item.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                        Action : {item.actionType}
                        {item.newValue && (
                          <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                            ({item.oldValue ? `${item.oldValue} → ` : ''}{item.newValue})
                          </span>
                        )}
                      </div>
                      {item.comment && (
                        <p className="timeline-comment">{item.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informations générales</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="info-item">
                <span className="info-item-label">Service responsable</span>
                <span className="info-item-value">{incident.serviceName || '-'}</span>
              </div>

              <div className="info-item">
                <span className="info-item-label">Catégorie</span>
                <span className="info-item-value">{incident.categoryName || '-'}</span>
              </div>

              <div className="info-item">
                <span className="info-item-label">Déclarant</span>
                <span className="info-item-value">{incident.reporterName || incident.reporterEmail || '-'}</span>
              </div>

              <div className="info-item">
                <span className="info-item-label">Agent technique affecté</span>
                <span className="info-item-value">
                  {incident.assignedToName ? (
                    <span style={{ color: 'var(--color-blue-700)', fontWeight: 600 }}>
                      {incident.assignedToName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-light)' }}>Non assigné</span>
                  )}
                </span>
              </div>

              <div className="info-item">
                <span className="info-item-label">Date de création</span>
                <span className="info-item-value">{formatDateTime(incident.createdAt)}</span>
              </div>

              {incident.resolvedAt && (
                <div className="info-item">
                  <span className="info-item-label">Date de résolution</span>
                  <span className="info-item-value">{formatDateTime(incident.resolvedAt)}</span>
                </div>
              )}

              {incident.closedAt && (
                <div className="info-item">
                  <span className="info-item-label">Date de clôture</span>
                  <span className="info-item-value">{formatDateTime(incident.closedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {charters.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Charte d'intervention</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {charters.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Version {c.versionNumber} • <StatusBadge value={c.status} type="charterStatus" />
                      </div>
                    </div>
                    <Link to={`/charters/${c.id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
                      Voir
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {interventions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Interventions terrain</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {interventions.map((inv) => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                        {inv.reference}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <StatusBadge value={inv.status} type="interventionStatus" />
                      </div>
                    </div>
                    <Link to={`/interventions/${inv.id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
                      Suivre
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assigner l'incident ${incident.reference}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={assigning}
            >
              Annuler
            </button>
            <Button
              variant="primary"
              size="sm"
              loading={assigning}
              disabled={assigning || !assignAgentId}
              onClick={handleAssignSubmit}
            >
              Confirmer l'assignation
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="assignAgentId">
              Sélectionner l'agent technique <span className="input-required">*</span>
            </label>
            {isAdmin ? (
              <select
                id="assignAgentId"
                className="filter-select"
                value={assignAgentId}
                onChange={(e) => setAssignAgentId(e.target.value)}
                required
              >
                <option value="">Sélectionnez un agent disponible</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} ({a.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="assignAgentId"
                type="number"
                className="input-field"
                placeholder="Identifiant numérique de l'agent"
                value={assignAgentId}
                onChange={(e) => setAssignAgentId(e.target.value)}
                required
              />
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="assignComment">
              Commentaire ou consigne d'affectation
            </label>
            <textarea
              id="assignComment"
              className="input-field"
              rows={3}
              value={assignComment}
              onChange={(e) => setAssignComment(e.target.value)}
              placeholder="Indiquez les consignes d'intervention pour l'agent..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Mettre à jour le statut - ${incident.reference}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={updatingStatus}
            >
              Annuler
            </button>
            <Button
              variant="primary"
              size="sm"
              loading={updatingStatus}
              disabled={updatingStatus || !newStatus}
              onClick={handleStatusSubmit}
            >
              Enregistrer le statut
            </Button>
          </>
        }
      >
        <form onSubmit={handleStatusSubmit}>
          {statusError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-xs)',
                marginBottom: '14px'
              }}
            >
              <AlertTriangle size={14} />
              <span>{statusError}</span>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="newStatus">
              Nouveau statut <span className="input-required">*</span>
            </label>
            <select
              id="newStatus"
              className="filter-select"
              value={newStatus}
              onChange={(e) => {
                setNewStatus(e.target.value)
                setStatusError('')
              }}
              required
            >
              {availableTransitions.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="statusComment">
              {['REJETE', 'CLOTURE', 'EN_ATTENTE', 'RESOLU'].includes(newStatus) ? (
                <>
                  Motif / Compte rendu <span className="input-required">* (obligatoire pour cette action)</span>
                </>
              ) : (
                'Commentaire d’opération (facultatif)'
              )}
            </label>
            <textarea
              id="statusComment"
              className="input-field"
              rows={3}
              value={statusComment}
              onChange={(e) => {
                setStatusComment(e.target.value)
                setStatusError('')
              }}
              placeholder={
                newStatus === 'REJETE'
                  ? 'Précisez le motif du rejet...'
                  : newStatus === 'CLOTURE'
                  ? 'Justification de la clôture...'
                  : newStatus === 'RESOLU'
                  ? 'Détaillez la solution appliquée...'
                  : newStatus === 'EN_ATTENTE'
                  ? 'Indiquez la raison de l’attente...'
                  : 'Détails ou remarques...'
              }
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier l'incident - ${incident.reference}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={editing}
            >
              Annuler
            </button>
            <Button
              variant="primary"
              size="sm"
              loading={editing}
              disabled={editing || !editTitle.trim() || !editDescription.trim()}
              onClick={handleEditSubmit}
            >
              Sauvegarder
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <Input
            label="Titre de l'incident"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            disabled={editing}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Catégorie</label>
              <select
                className="filter-select"
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                disabled={editing}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Service</label>
              <select
                className="filter-select"
                value={editServiceId}
                onChange={(e) => setEditServiceId(e.target.value)}
                disabled={editing}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Localisation"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              disabled={editing}
            />

            <div className="input-group">
              <label className="input-label">Priorité</label>
              <select
                className="filter-select"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                disabled={editing}
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description détaillée</label>
            <textarea
              className="input-field"
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              disabled={editing}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default IncidentDetailsPage
