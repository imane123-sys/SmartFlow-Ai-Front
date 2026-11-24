import React from 'react'
import {
  Sparkles,
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ListOrdered,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'
import StatusBadge from '../../../components/common/StatusBadge'
import Button from '../../../components/common/Button'
import { formatDateTime } from '../../../utils/formatters'

export const AiAnalysisCard = ({
  analysis,
  currentIncidentPriority,
  canApplyPriority = false,
  onApplyPriority,
  applyingPriority = false
}) => {
  if (!analysis) return null

  const isPriorityMatching =
    currentIncidentPriority &&
    analysis.suggestedPriority &&
    currentIncidentPriority.toUpperCase() === analysis.suggestedPriority.toUpperCase()

  const causes = Array.isArray(analysis.possibleCauses) ? analysis.possibleCauses : []
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : []
  const missingInfo = Array.isArray(analysis.missingInfo) ? analysis.missingInfo : []

  return (
    <div className="ai-card">
      <div className="ai-meta-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="ai-header-badge">
            <Sparkles size={13} />
            Diagnostic Gemini AI
          </span>
          {analysis.incidentReference && (
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
              {analysis.incidentReference}
            </span>
          )}
        </div>

        <div className="ai-meta-info">
          {analysis.requestedByName && (
            <div className="ai-meta-item">
              <User size={13} />
              <span>Analysé par {analysis.requestedByName}</span>
            </div>
          )}
          {analysis.createdAt && (
            <div className="ai-meta-item">
              <Clock size={13} />
              <span>{formatDateTime(analysis.createdAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`ai-priority-box ${isPriorityMatching ? '' : 'mismatch'}`}>
        <div>
          <div className="ai-priority-comparison">
            {currentIncidentPriority && (
              <div className="ai-priority-col">
                <span className="ai-priority-label">Priorité actuelle</span>
                <StatusBadge value={currentIncidentPriority} type="priority" />
              </div>
            )}

            {currentIncidentPriority && analysis.suggestedPriority && (
              <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', marginTop: '16px' }} />
            )}

            {analysis.suggestedPriority && (
              <div className="ai-priority-col">
                <span className="ai-priority-label">Priorité recommandée</span>
                <StatusBadge value={analysis.suggestedPriority} type="priority" />
              </div>
            )}
          </div>

          {analysis.priorityReason && (
            <p className="ai-priority-reason">
              <strong>Motivation du diagnostic :</strong> {analysis.priorityReason}
            </p>
          )}
        </div>

        {canApplyPriority && analysis.suggestedPriority && (
          <div>
            {isPriorityMatching ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  padding: '6px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0'
                }}
              >
                <CheckCircle size={14} />
                <span>Priorité conforme</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                loading={applyingPriority}
                disabled={applyingPriority}
                onClick={() => onApplyPriority && onApplyPriority(analysis.suggestedPriority)}
              >
                Appliquer la priorité {analysis.suggestedPriority}
              </Button>
            )}
          </div>
        )}
      </div>

      {analysis.summary && (
        <div className="ai-summary-box">
          <div className="ai-summary-title">
            <Lightbulb size={16} />
            Synthèse du diagnostic
          </div>
          <p className="ai-summary-text">{analysis.summary}</p>
        </div>
      )}

      {causes.length > 0 && (
        <div>
          <div className="ai-section-title">
            <HelpCircle size={15} />
            Origines et causes probables identifiées ({causes.length})
          </div>
          <div className="ai-causes-list">
            {causes.map((cause, index) => (
              <div key={index} className="ai-cause-item">
                <div className="ai-cause-bullet" />
                <span>{cause}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <div className="ai-section-title">
            <ListOrdered size={15} />
            Recommandations d'intervention proposées ({recommendations.length})
          </div>
          <div className="ai-recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="ai-recommendation-item">
                <span className="ai-step-badge">{index + 1}</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingInfo.length > 0 && (
        <div className="ai-missing-box">
          <div className="ai-missing-title">
            <AlertTriangle size={15} />
            Éléments et informations manquants à recueillir ({missingInfo.length})
          </div>
          <ul className="ai-missing-list">
            {missingInfo.map((info, index) => (
              <li key={index} className="ai-missing-item">
                <span>•</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AiAnalysisCard
