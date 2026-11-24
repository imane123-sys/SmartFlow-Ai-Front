import React from 'react'

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'primary'
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-content">
        <span className="kpi-label">{title}</span>
        <span className="kpi-value">{value !== null && value !== undefined ? value : '-'}</span>
        {subtext && <span className="kpi-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className={`kpi-icon-box kpi-icon-box-${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  )
}

export default StatCard
