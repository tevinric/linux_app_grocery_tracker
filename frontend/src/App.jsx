import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import GroceryForm from './components/GroceryForm'
import GroceryList from './components/GroceryList'
import { getAllGroceries, getLowStockGroceries } from './services/api'

function App() {
  const [groceries, setGroceries] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  const fetchGroceries = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allItems, lowStock] = await Promise.all([
        getAllGroceries(),
        getLowStockGroceries()
      ])
      setGroceries(allItems)
      setLowStockItems(lowStock)
    } catch (err) {
      setError('Failed to fetch groceries: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroceries()
  }, [])

  const handleEdit = (item) => {
    setEditingItem(item)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleSaveSuccess = () => {
    setEditingItem(null)
    fetchGroceries()
  }

  return (
    <div>
      <div className="header">
        <div className="container">
          <h1>Grocery Inventory Tracker</h1>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <Dashboard lowStockItems={lowStockItems} loading={loading} />

        <GroceryForm
          editingItem={editingItem}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelEdit}
        />

        <GroceryList
          groceries={groceries}
          loading={loading}
          onEdit={handleEdit}
          onDeleteSuccess={fetchGroceries}
        />
      </div>
    </div>
  )
}

export default App
