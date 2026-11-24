export const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateString
  }
}

export const incidentStatusConfig = {
  NOUVEAU: { label: 'Nouveau', variant: 'info' },
  EN_ANALYSE: { label: 'En analyse', variant: 'warning' },
  EN_ATTENTE_VALIDATION: { label: 'En attente de validation', variant: 'warning' },
  ASSIGNE: { label: 'Assigné', variant: 'info' },
  EN_COURS: { label: 'En cours', variant: 'primary' },
  EN_ATTENTE: { label: 'En attente', variant: 'neutral' },
  RESOLU: { label: 'Résolu', variant: 'success' },
  CLOTURE: { label: 'Clôturé', variant: 'neutral' },
  REJETE: { label: 'Rejeté', variant: 'danger' }
}

export const priorityConfig = {
  BASSE: { label: 'Basse', variant: 'neutral' },
  MOYENNE: { label: 'Moyenne', variant: 'info' },
  HAUTE: { label: 'Haute', variant: 'warning' },
  CRITIQUE: { label: 'Critique', variant: 'danger' }
}

export const charterStatusConfig = {
  BROUILLON: { label: 'Brouillon', variant: 'neutral' },
  EN_ATTENTE_VALIDATION: { label: 'En attente validation', variant: 'warning' },
  VALIDEE: { label: 'Validée', variant: 'success' },
  REFUSEE: { label: 'Refusée', variant: 'danger' },
  ARCHIVEE: { label: 'Archivée', variant: 'neutral' }
}

export const interventionStatusConfig = {
  PLANIFIEE: { label: 'Planifiée', variant: 'info' },
  AFFECTEE: { label: 'Affectée', variant: 'info' },
  EN_COURS: { label: 'En cours', variant: 'primary' },
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  TERMINEE: { label: 'Terminée', variant: 'success' },
  ANNULEE: { label: 'Annulée', variant: 'danger' }
}

export const stepStatusConfig = {
  A_FAIRE: { label: 'À faire', variant: 'neutral' },
  EN_COURS: { label: 'En cours', variant: 'primary' },
  TERMINEE: { label: 'Terminée', variant: 'success' },
  BLOQUEE: { label: 'Bloquée', variant: 'danger' }
}

export const roleConfig = {
  ADMIN: { label: 'Administrateur', badge: 'Admin' },
  MANAGER: { label: 'Manager', badge: 'Manager' },
  AGENT: { label: 'Agent technique', badge: 'Agent' },
  EMPLOYEE: { label: 'Employé', badge: 'Employé' }
}
