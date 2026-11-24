import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Loading from './Loading'
import EmptyState from './EmptyState'

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Aucune donnée',
  emptyDescription = 'Aucun élément ne correspond à votre recherche.',
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onPageChange
}) => {
  if (loading) {
    return (
      <div className="data-table-container">
        <Loading message="Chargement des données..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={column.key || index} style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={column.key || colIndex}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && onPageChange && (
        <div className="data-table-pagination">
          <span style={{ fontSize: '0.813rem', color: 'var(--color-text-muted)' }}>
            Page {page + 1} sur {totalPages} {totalElements ? `(${totalElements} éléments)` : ''}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
