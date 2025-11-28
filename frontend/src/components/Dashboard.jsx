import React from 'react'

function Dashboard({ lowStockItems, loading }) {
  if (loading) {
    return (
      <div className="dashboard">
        <h2>Low Stock Alert</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h2>Low Stock Alert</h2>
      {lowStockItems.length === 0 ? (
        <p>All items are well stocked!</p>
      ) : (
        <div className="low-stock-alert">
          <p><strong>Warning:</strong> {lowStockItems.length} item(s) are running low (2 units or less)</p>
          {lowStockItems.map(item => (
            <div key={item.id} className="low-stock-item">
              <strong>{item.name}</strong> - Only {item.quantity} unit(s) remaining
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
