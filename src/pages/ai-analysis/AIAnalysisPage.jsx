import React from 'react'
import EmptyState from '../../components/common/EmptyState'
import { Sparkles } from 'lucide-react'

export const AIAnalysisPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyses IA</h1>
          <p className="page-subtitle">
            Diagnostics prédictifs et propositions d'actions formulées par Google Gemini
          </p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Sparkles}
          title="Module Analyse IA initialisé"
          description="L'interface de diagnostic Gemini et l'historique des analyses seront implémentés à l'étape suivante."
        />
      </div>
    </div>
  )
}

export default AIAnalysisPage
