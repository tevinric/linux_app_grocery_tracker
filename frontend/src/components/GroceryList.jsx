import React, { useState } from 'react'
import { deleteGrocery } from '../services/api'

function GroceryList({ groceries, loading, onEdit, onDeleteSuccess }) {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    setDeletingId(id)
    setError(null)

    try {
      await deleteGrocery(id)
      onDeleteSuccess()
    } catch (err) {
      setError('Failed to delete item: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grocery-list">
        <h2>All Grocery Items</h2>
        <div className="loading">Loading groceries...</div>
      </div>
    )
  }

  return (
    <div className="grocery-list">
      <h2>All Grocery Items ({groceries.length})</h2>
      {error && <div className="error">{error}</div>}

      {groceries.length === 0 ? (
        <p>No grocery items found. Add your first item above!</p>
      ) : (
        groceries.map(item => (
          <div
            key={item.id}
            className={`grocery-item ${item.quantity <= 2 ? 'low-stock' : ''}`}
          >
            <div className="item-header">
              <span className="item-name">{item.name}</span>
              <span className={`item-quantity ${item.quantity <= 2 ? 'low' : ''}`}>
                Qty: {item.quantity}
              </span>
            </div>

            {item.description && (
              <div className="item-description">{item.description}</div>
            )}

            <div className="item-actions">
              <button
                className="edit"
                onClick={() => onEdit(item)}
                disabled={deletingId === item.id}
              >
                Edit
              </button>
              <button
                className="delete"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default GroceryList
