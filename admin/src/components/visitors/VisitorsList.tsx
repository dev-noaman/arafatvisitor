import { useState } from 'react'
import type { Visit, VisitStatus } from '@/types'
import { getStatusBadgeColor, getStatusLabel } from '@/services/visitors'

interface VisitorsListProps {
  visitors: Visit[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onSearch: (search: string) => void
  onStatusFilter: (status: VisitStatus | '') => void
  onPageChange: (page: number) => void
  onEdit: (visitor: Visit) => void
  onDelete: (visitor: Visit) => void
  onApprove?: (visitor: Visit) => void
  onReject?: (visitor: Visit) => void
  onCheckout?: (visitor: Visit) => void
}

const VISIT_STATUSES: VisitStatus[] = ['PENDING', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED']

export default function VisitorsList({
  visitors,
  isLoading,
  pagination,
  onSearch,
  onStatusFilter,
  onPageChange,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onCheckout,
}: VisitorsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<VisitStatus | ''>('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleStatusFilter = (status: VisitStatus | '') => {
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

  const canApprove = (visitor: Visit) => visitor.status === 'PENDING'
  const canReject = (visitor: Visit) => visitor.status === 'PENDING'
  const canCheckout = (visitor: Visit) => visitor.status === 'CHECKED_IN'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search by name, email, phone, or purpose..."
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
            {VISIT_STATUSES.map((status) => (
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
                Visitor Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Host</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Purpose</th>
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
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No visitors found.
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {visitor.visitorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{visitor.visitorPhone || '—'}</div>
                    <div className="text-xs text-gray-500">{visitor.visitorEmail || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{visitor.host?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{visitor.purpose || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(visitor.status)}`}>
                      {getStatusLabel(visitor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-1">
                    {canApprove(visitor) && onApprove && (
                      <button
                        onClick={() => onApprove(visitor)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-600 hover:bg-green-50 transition"
                      >
                        Approve
                      </button>
                    )}
                    {canReject(visitor) && onReject && (
                      <button
                        onClick={() => onReject(visitor)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Reject
                      </button>
                    )}
                    {canCheckout(visitor) && onCheckout && (
                      <button
                        onClick={() => onCheckout(visitor)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-orange-600 hover:bg-orange-50 transition"
                      >
                        Checkout
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(visitor)}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(visitor)}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && visitors.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} visitors
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
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
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
