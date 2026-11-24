import React from 'react'
import { Inbox } from 'lucide-react'

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Aucun élément trouvé',
  description = 'Il n’y a aucune donnée à afficher pour le moment.',
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState
