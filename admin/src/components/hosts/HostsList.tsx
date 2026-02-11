import { useState } from 'react'
import type { Host } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface HostsListProps {
  hosts: Host[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onSearch: (search: string) => void
  onPageChange: (page: number) => void
  onEdit: (host: Host) => void
  onDelete: (host: Host) => void
  entityLabel?: string
  hideCompany?: boolean
}

export default function HostsList({
  hosts,
  isLoading,
  pagination,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
  entityLabel = 'hosts',
  hideCompany,
}: HostsListProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[18%]">Name</th>
              {!hideCompany && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">Company</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[22%]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[14%]">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[14%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={hideCompany ? 5 : 6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : hosts.length === 0 ? (
              <tr>
                <td colSpan={hideCompany ? 5 : 6} className="px-4 py-8 text-center text-gray-500">
                  No {entityLabel} found. Create your first to get started.
                </td>
              </tr>
            ) : (
              hosts.map((host) => (
                <tr key={host.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-2.5 text-sm text-gray-900 font-medium truncate" title={host.name}>{host.name}</td>
                  {!hideCompany && <td className="px-4 py-2.5 text-sm text-gray-600 truncate" title={host.company}>{host.company}</td>}
                  <td className="px-4 py-2.5 text-sm text-gray-600 truncate" title={host.email}>{host.email}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">{host.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                    {host.location ? host.location.replace(/_/g, ' ') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(host)}
                          className="inline-flex items-center p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => onDelete(host)}
                          className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && hosts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} {entityLabel}
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
