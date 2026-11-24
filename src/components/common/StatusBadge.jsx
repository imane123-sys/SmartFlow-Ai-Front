import React from 'react'
import {
  incidentStatusConfig,
  priorityConfig,
  charterStatusConfig,
  interventionStatusConfig,
  stepStatusConfig,
  roleConfig
} from '../../utils/formatters'

export const StatusBadge = ({ value, type = 'incidentStatus' }) => {
  if (!value) return null

  let config = null

  if (type === 'incidentStatus') config = incidentStatusConfig[value]
  else if (type === 'priority') config = priorityConfig[value]
  else if (type === 'charterStatus') config = charterStatusConfig[value]
  else if (type === 'interventionStatus') config = interventionStatusConfig[value]
  else if (type === 'stepStatus') config = stepStatusConfig[value]
  else if (type === 'role') {
    const roleItem = roleConfig[value]
    return (
      <span className="status-badge status-badge-primary">
        {roleItem ? roleItem.badge : value}
      </span>
    )
  }

  const label = config ? config.label : value
  const variant = config ? config.variant : 'neutral'

  return <span className={`status-badge status-badge-${variant}`}>{label}</span>
}

export default StatusBadge
