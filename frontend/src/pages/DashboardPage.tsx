import { useEffect, useState } from 'react'
import api from '../lib/api'

interface DashboardStats {
  totalSales: number
  totalPurchases: number
  accountsReceivable: number
  accountsPayable: number
  lowStockItems: number
  pendingOrders: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual dashboard API endpoint when available
    // For now, we'll show placeholder data
    setStats({
      totalSales: 0,
      totalPurchases: 0,
      accountsReceivable: 0,
      accountsPayable: 0,
      lowStockItems: 0,
      pendingOrders: 0,
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  const statCards = [
    { name: 'Total Sales', value: stats?.totalSales || 0, color: 'bg-blue-500' },
    { name: 'Total Purchases', value: stats?.totalPurchases || 0, color: 'bg-green-500' },
    { name: 'Accounts Receivable', value: stats?.accountsReceivable || 0, color: 'bg-yellow-500' },
    { name: 'Accounts Payable', value: stats?.accountsPayable || 0, color: 'bg-red-500' },
    { name: 'Low Stock Items', value: stats?.lowStockItems || 0, color: 'bg-orange-500' },
    { name: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {typeof card.value === 'number' 
                    ? card.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    : card.value}
                </p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500">Recent invoices, orders, and payments will appear here.</p>
      </div>
    </div>
  )
}

