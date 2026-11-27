import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Send,
  ShieldCheck,
  XCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import charterService from '../../services/charterService'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import CharterForm from './components/CharterForm'
import { applyCharterResponse } from './charterHelpers'
import { formatDateTime } from '../../utils/formatters'

const decisionTitles = {
  submit: 'Soumettre la charte',
  validate: 'Valider la charte',
  reject: 'Refuser la charte'
}

const decisionMessages = {
  submit: 'La charte passera en attente de validation. Un utilisateur autorisé devra ensuite statuer.',
  validate: 'Cette action est définitive et modifiera le statut de la charte.',
  reject: 'La charte sera refusée avec le motif saisi. Ce motif sera enregistré.'
}

export const CharterDetailsPage = () => {
  const { id } = useParams()
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['MANAGER', 'ADMIN'])

  const [charter, setCharter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [decision, setDecision] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [decisionError, setDecisionError] = useState('')
  const [decisionLoading, setDecisionLoading] = useState(false)

  const fetchCharter = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await charterService.getCharterById(id)
      setCharter(data)
    } catch (err) {
      setError(err.message || 'Impossible de charger la charte')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCharter()
  }, [fetchCharter])

  if (loading) {
    return <Loading message="Chargement de la charte d'intervention..." />
  }

  if (!charter) {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/charters" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} /> Retour aux chartes
          </Link>
        </div>
        <div className="card">
          <div className="charter-alert charter-alert-error">
            <AlertTriangle size={18} />
            <span>{error || 'Charte introuvable ou accès refusé.'}</span>
          </div>
        </div>
      </div>
    )
  }

  const steps = Array.isArray(charter.steps)
    ? [...charter.steps].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
    : []

  const canEdit = canManage && !['VALIDEE', 'ARCHIVEE'].includes(charter.status)
  const canSubmit = canManage && ['BROUILLON', 'REFUSEE'].includes(charter.status)
  const canDecide = canManage && charter.status === 'EN_ATTENTE_VALIDATION'
  const canValidate = canDecide
  const canReject = canDecide

  const validationLabel = {
    VALIDEE: 'Charte validée',
    REFUSEE: 'Charte refusée',
    EN_ATTENTE_VALIDATION: 'En attente de validation',
    ARCHIVEE: 'Charte archivée'
  }[charter.status] || 'Brouillon non soumis'

  const openDecision = (type) => {
    setDecision(type)
    setRejectionReason('')
    setDecisionError('')
    setSuccess('')
  }

  const closeDecision = () => {
    setDecision(null)
    setDecisionError('')
  }

  const handleUpdate = async (payload) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await charterService.updateCharter(id, payload)
      setCharter((current) => applyCharterResponse(current, updated))
      setEditing(false)
      setSuccess('Charte enregistrée avec succès.')
    } catch (err) {
      setError(err.message || 'Impossible d’enregistrer la charte')
    } finally {
      setSaving(false)
    }
  }

  const handleDecision = async () => {
    setDecisionError('')
    if (decision === 'reject' && !rejectionReason.trim()) {
      setDecisionError('Le motif de refus est obligatoire')
      return
    }

    setDecisionLoading(true)
    try {
      let updated
      let fallback

      if (decision === 'submit') {
        updated = await charterService.submitCharter(id)
        fallback = { status: 'EN_ATTENTE_VALIDATION' }
        setSuccess('Charte soumise pour validation.')
      } else if (decision === 'validate') {
        updated = await charterService.validateCharter(id)
        fallback = { status: 'VALIDEE' }
        setSuccess('Charte validée avec succès.')
      } else {
        updated = await charterService.rejectCharter(id, {
          rejectionReason: rejectionReason.trim()
        })
        fallback = { status: 'REFUSEE', rejectionReason: rejectionReason.trim() }
        setSuccess('Charte refusée. Le motif a été enregistré.')
      }

      setCharter((current) => applyCharterResponse(current, updated, fallback))
      setDecision(null)
    } catch (err) {
      setDecisionError(err.message || 'L’opération n’a pas pu être effectuée')
    } finally {
      setDecisionLoading(false)
    }
  }

  return (
    <div>
      <div className="charter-detail-header">
        <div className="charter-detail-title-group">
          <div className="charter-badges">
            <span className="incident-ref-badge">Charte #{charter.id}</span>
            <span className="charter-version">Version {charter.versionNumber ?? '-'}</span>
            <StatusBadge value={charter.status} type="charterStatus" />
          </div>
          <h1>{charter.title}</h1>
          <p>
            Incident{' '}
            {charter.incidentId ? (
              <Link to={`/incidents/${charter.incidentId}`} className="charter-link">
                {charter.incidentReference || `Incident #${charter.incidentId}`}
                <ArrowUpRight size={13} />
              </Link>
            ) : (
              'non renseigné'
            )}
            {' • '}Créée le {formatDateTime(charter.createdAt)}
          </p>
        </div>

        <div className="charter-detail-actions">
          <Link to="/charters" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Liste des chartes
          </Link>
          {canEdit && !editing && (
            <Button
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => {
                setEditing(true)
                setSuccess('')
              }}
            >
              Modifier
            </Button>
          )}
          {canSubmit && !editing && (
            <Button variant="outline" size="sm" icon={Send} onClick={() => openDecision('submit')}>
              Soumettre
            </Button>
          )}
          {canValidate && !editing && (
            <Button
              size="sm"
              icon={CheckCircle2}
              onClick={() => openDecision('validate')}
            >
              Valider
            </Button>
          )}
          {canReject && !editing && (
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => openDecision('reject')}
            >
              Refuser
            </Button>
          )}
        </div>
      </div>

      {success && (
        <div className="charter-alert charter-alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && !editing && (
        <div className="charter-alert charter-alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {editing ? (
        <div className="card charter-editor-card">
          <div className="card-header">
            <h3 className="card-title">Modifier la charte</h3>
          </div>
          <CharterForm
            key={`${charter.id}-${charter.updatedAt || ''}`}
            initialValues={charter}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditing(false)
              setError('')
            }}
            submitting={saving}
            submitLabel="Enregistrer"
            error={error}
          />
        </div>
      ) : (
        <div className="charter-grid-layout">
          <div className="charter-main-column">
            <div className="card charter-document-card">
              <div className="card-header">
                <h3 className="card-title">Document d'intervention</h3>
              </div>

              <section className="charter-section">
                <h4>Objectif de l'intervention</h4>
                <p>{charter.objective || 'Non renseigné'}</p>
              </section>

              <section className="charter-section">
                <h4>Précautions et risques</h4>
                <p>{charter.safetyPrecautions || 'Non renseigné'}</p>
              </section>

              <section className="charter-section">
                <h4>Ressources nécessaires</h4>
                <p>{charter.requiredResources || 'Non renseigné'}</p>
              </section>

              {charter.rejectionReason && (
                <section className="charter-section charter-section-danger">
                  <h4>Motif de refus</h4>
                  <p>{charter.rejectionReason}</p>
                </section>
              )}
            </div>

            <div className="card charter-steps-card">
              <div className="card-header">
                <h3 className="card-title">Actions ou étapes prévues</h3>
                <span className="charter-count-badge">{steps.length} étape(s)</span>
              </div>
              {steps.length > 0 ? (
                <ol className="charter-step-list">
                  {steps.map((step) => (
                    <li className="charter-step-item" key={step.id || step.stepOrder}>
                      <span className="charter-step-number">{step.stepOrder}</span>
                      <div className="charter-step-content">
                        <div className="charter-step-title">{step.title}</div>
                        <div className="charter-step-description">{step.description}</div>
                        {step.estimatedDurationMinutes != null && (
                          <div className="charter-step-meta">
                            <Clock size={13} /> {step.estimatedDurationMinutes} min estimées
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Aucune étape enregistrée"
                  description="Les étapes prévues apparaîtront ici dès que la charte sera complétée."
                />
              )}
            </div>
          </div>

          <div className="charter-side-column">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Informations</h3>
              </div>
              <div className="charter-meta-grid">
                <div className="info-item">
                  <span className="info-item-label">Incident associé</span>
                  <span className="info-item-value">
                    {charter.incidentId ? (
                      <Link to={`/incidents/${charter.incidentId}`} className="charter-link">
                        {charter.incidentReference || `Incident #${charter.incidentId}`}
                        <ArrowUpRight size={13} />
                      </Link>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-item-label">Créée le</span>
                  <span className="info-item-value">{formatDateTime(charter.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-item-label">Modifiée le</span>
                  <span className="info-item-value">{formatDateTime(charter.updatedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-item-label">Créée par</span>
                  <span className="info-item-value">{charter.createdByName || '-'}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Validation</h3>
              </div>
              <div className="charter-validation-block">
                <ShieldCheck size={22} />
                <div>
                  <strong>{validationLabel}</strong>
                  <p>
                    {charter.status === 'VALIDEE'
                      ? 'La charte a été validée par un utilisateur autorisé.'
                      : charter.status === 'REFUSEE'
                        ? 'Un motif de refus a été enregistré pour cette version.'
                        : charter.status === 'ARCHIVEE'
                          ? 'Cette version a été remplacée par une version validée plus récente.'
                          : charter.status === 'EN_ATTENTE_VALIDATION'
                            ? 'La décision revient à un manager ou un administrateur.'
                            : 'Le brouillon peut encore être modifié avant soumission.'}
                  </p>
                </div>
              </div>
              {(charter.validatedByName || charter.validatedAt) && (
                <div className="charter-meta-grid charter-validation-meta">
                  <div className="info-item">
                    <span className="info-item-label">Décidée par</span>
                    <span className="info-item-value">{charter.validatedByName || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Le</span>
                    <span className="info-item-value">{formatDateTime(charter.validatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(decision)}
        onClose={closeDecision}
        title={decision ? decisionTitles[decision] : ''}
        footer={
          <>
            <Button variant="outline" onClick={closeDecision} disabled={decisionLoading}>
              Annuler
            </Button>
            <Button
              variant={decision === 'reject' ? 'danger' : 'primary'}
              loading={decisionLoading}
              disabled={
                decisionLoading || (decision === 'reject' && !rejectionReason.trim())
              }
              onClick={handleDecision}
            >
              {decision === 'submit'
                ? 'Confirmer la soumission'
                : decision === 'validate'
                  ? 'Confirmer la validation'
                  : 'Confirmer le refus'}
            </Button>
          </>
        }
      >
        <div className="charter-decision-body">
          {decision && <p>{decisionMessages[decision]}</p>}
          {decision === 'reject' && (
            <div className="charter-field charter-reason-field">
              <label className="input-label" htmlFor="rejectionReason">
                Motif de refus<span className="input-required">*</span>
              </label>
              <textarea
                id="rejectionReason"
                className="input-field charter-textarea"
                rows={4}
                value={rejectionReason}
                onChange={(event) => {
                  setRejectionReason(event.target.value)
                  setDecisionError('')
                }}
                placeholder="Indiquez le motif du refus"
              />
            </div>
          )}
          {decisionError && (
            <div className="charter-alert charter-alert-error">
              <AlertCircle size={18} />
              <span>{decisionError}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CharterDetailsPage
