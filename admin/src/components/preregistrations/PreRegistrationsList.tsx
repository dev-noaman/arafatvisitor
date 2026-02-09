import { useState } from 'react'
import type { PreRegistration } from '@/types'
import { getStatusBadgeColor, getStatusLabel } from '@/services/preregistrations'
import { useAuth } from '@/hooks/useAuth'

interface PreRegistrationsListProps {
  preRegistrations: PreRegistration[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onSearch: (search: string) => void
  onStatusFilter: (status: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | '') => void
  onPageChange: (page: number) => void
  onEdit: (preReg: PreRegistration) => void
  onDelete: (preReg: PreRegistration) => void
  onApprove?: (preReg: PreRegistration) => void
  onReject?: (preReg: PreRegistration) => void
  onReApprove?: (preReg: PreRegistration) => void
  onQr?: (preReg: PreRegistration) => void
}

const PRE_REG_STATUSES: Array<'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED'> = [
  'PENDING_APPROVAL',
  'REJECTED',
  'APPROVED',
]

export default function PreRegistrationsList({
  preRegistrations,
  isLoading,
  pagination,
  onSearch,
  onStatusFilter,
  onPageChange,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onReApprove,
  onQr,
}: PreRegistrationsListProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canEdit = user?.role === 'ADMIN' || user?.role === 'RECEPTION'
  const canApproveReject = user?.role !== 'RECEPTION'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<
    'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | ''
  >('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const handleStatusFilter = (
    status: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | ''
  ) => {
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

  const canApprove = (preReg: PreRegistration) => preReg.status === 'PENDING_APPROVAL'
  const canReject = (preReg: PreRegistration) => preReg.status === 'PENDING_APPROVAL'
  const canReApprove = (preReg: PreRegistration) => preReg.status === 'REJECTED'

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
            {PRE_REG_STATUSES.map((status) => (
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Scheduled Date
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
            ) : preRegistrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No pre-registrations found.
                </td>
              </tr>
            ) : (
              preRegistrations.map((preReg) => (
                <tr key={preReg.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {preReg.visitorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{preReg.visitorPhone || '—'}</div>
                    <div className="text-xs text-gray-500">{preReg.visitorEmail || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{preReg.host?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {preReg.expectedDate ? (
                      <>
                        {new Date(preReg.expectedDate).toLocaleDateString()} at{' '}
                        {new Date(preReg.expectedDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(preReg.status)}`}
                    >
                      {getStatusLabel(preReg.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-1">
                    {canApproveReject && canApprove(preReg) && onApprove && (
                      <button
                        onClick={() => onApprove(preReg)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-green-600 hover:bg-green-50 transition"
                      >
                        Approve
                      </button>
                    )}
                    {canApproveReject && canReject(preReg) && onReject && (
                      <button
                        onClick={() => onReject(preReg)}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Reject
                      </button>
                    )}
                    {canApproveReject && canReApprove(preReg) && onReApprove && (
                      <button
                        onClick={() => onReApprove(preReg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition"
                        title="Re-Approve"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Re-Approve
                      </button>
                    )}
                    {preReg.status === 'APPROVED' && onQr && (
                      <button
                        onClick={() => onQr(preReg)}
                        className="inline-flex items-center p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                        title="QR Code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => onEdit(preReg)}
                        className="inline-flex items-center p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(preReg)}
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
      {!isLoading && preRegistrations.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} pre-registrations
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
