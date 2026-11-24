import React from 'react'

export const DistributionCard = ({
  title,
  items = [],
  emptyMessage = 'Aucune donnée enregistrée'
}) => {
  const hasData = items && items.some((item) => item.count > 0)

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      {!hasData ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
          {emptyMessage}
        </p>
      ) : (
        <div className="distribution-list">
          {items.map((item, index) => (
            <div key={item.key || index} className="distribution-item">
              <div className="distribution-header">
                <span className="distribution-label">{item.label}</span>
                <span className="distribution-value">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="distribution-progress-track">
                <div
                  className="distribution-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    backgroundColor: item.color || 'var(--color-blue-600)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DistributionCard
