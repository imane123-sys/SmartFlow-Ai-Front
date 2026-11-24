import React from 'react'

export const Loading = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      {message && <p className="loading-text">{message}</p>}
    </div>
  )
}

export default Loading
