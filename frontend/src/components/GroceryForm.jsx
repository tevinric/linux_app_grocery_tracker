import React, { useState, useEffect } from 'react'
import { createGrocery, updateGrocery } from '../services/api'

function GroceryForm({ editingItem, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || '',
        quantity: editingItem.quantity
      })
    } else {
      setFormData({ name: '', description: '', quantity: 0 })
    }
  }, [editingItem])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (editingItem) {
        await updateGrocery(editingItem.id, formData)
      } else {
        await createGrocery(formData)
      }
      setFormData({ name: '', description: '', quantity: 0 })
      onSaveSuccess()
    } catch (err) {
      setError('Failed to save item: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = () => {
    setFormData({ name: '', description: '', quantity: 0 })
    setError(null)
    onCancel()
  }

  return (
    <div className="grocery-form">
      <h2>{editingItem ? 'Edit Grocery Item' : 'Add New Grocery Item'}</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Item Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Milk, Bread, Eggs"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Optional description or notes"
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            placeholder="0"
          />
        </div>

        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
          </button>
          {editingItem && (
            <button type="button" className="cancel" onClick={handleCancelClick}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default GroceryForm
