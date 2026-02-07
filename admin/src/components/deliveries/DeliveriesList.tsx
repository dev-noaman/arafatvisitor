import { useState } from 'react'
import type { Delivery, DeliveryStatus } from '@/types'
import { getStatusBadgeColor, getStatusLabel } from '@/services/deliveries'
import { useAuth } from '@/hooks/useAuth'

interface DeliveriesListProps {
  deliveries: Delivery[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onSearch: (search: string) => void
  onStatusFilter: (status: DeliveryStatus | '') => void
  onPageChange: (page: number) => void
  onEdit: (delivery: Delivery) => void
  onDelete: (delivery: Delivery) => void
  onMarkPickedUp?: (delivery: Delivery) => void
}

const DELIVERY_STATUSES: DeliveryStatus[] = ['RECEIVED', 'PICKED_UP']

export default function DeliveriesList({
  deliveries,
  isLoading,
  pagination,
  onSearch,
  onStatusFilter,
  onPageChange,
  onEdit,
  onDelete,
  onMarkPickedUp,
}: DeliveriesListProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | ''>('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleStatusFilter = (status: DeliveryStatus | '') => {
    setSelectedStatus(status)
    onStatusFilter(status)
  }

  const handlePrevious = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1)
    }
  }

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1)
    }
  }

  const canMarkPickedUp = (delivery: Delivery) => delivery.status === 'RECEIVED' || delivery.status === 'PENDING'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search by recipient, company, or description..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedStatus === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {DELIVERY_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : `${getStatusBadgeColor(status)} hover:opacity-80`
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Host Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Courier
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Received Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No deliveries found.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900 font-medium">{delivery.recipient || '—'}</div>
                    <div className="text-xs text-gray-500">{delivery.host?.name || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{delivery.host?.company || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{delivery.courier || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {delivery.receivedAt
                      ? new Date(delivery.receivedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(delivery.status)}`}
                    >
                      {getStatusLabel(delivery.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-1">
                    {canMarkPickedUp(delivery) && onMarkPickedUp && (
                      <button
                        onClick={() => onMarkPickedUp(delivery)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-600 hover:bg-green-50 transition"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(delivery)}
                      className="inline-flex items-center p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(delivery)}
                        className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && deliveries.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} deliveries
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const current = pagination.page
                const total = pagination.totalPages
                const pages: (number | '...')[] = []
                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (current > 3) pages.push('...')
                  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
                  if (current < total - 2) pages.push('...')
                  pages.push(total)
                }
                return pages.map((page, idx) =>
                  page === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-sm text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        page === current
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )
              })()}
            </div>
            <button
              onClick={handleNext}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
