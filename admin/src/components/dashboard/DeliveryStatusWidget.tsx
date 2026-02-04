import React from 'react'

export interface DeliveryStats {
  total: number
  received: number
  pickedUp: number
}

interface DeliveryStatusWidgetProps {
  stats: DeliveryStats
  isLoading?: boolean
  onViewAll?: () => void
}

export function DeliveryStatusWidget({ stats, isLoading = false, onViewAll }: DeliveryStatusWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const receivedPercent = stats.total > 0 ? (stats.received / stats.total) * 100 : 0
  const pickedUpPercent = stats.total > 0 ? (stats.pickedUp / stats.total) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Status</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Total Deliveries */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2"></div>
        </div>

        {/* Received */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Received</span>
            <span className="text-lg font-semibold text-orange-600">
              {stats.received} ({receivedPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-500"
              style={{ width: `${receivedPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Picked Up */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Picked Up</span>
            <span className="text-lg font-semibold text-green-600">
              {stats.pickedUp} ({pickedUpPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: `${pickedUpPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-600">Received</span>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-600">Picked Up</span>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  )
}

export default DeliveryStatusWidget
