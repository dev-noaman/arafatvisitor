import { useState, useEffect } from 'react'
import type { Host, PaginatedResponse } from '@/types'

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
}

export default function HostsList({
  hosts,
  isLoading,
  pagination,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
}: HostsListProps) {
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
          placeholder="Search by name, email, or department..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Department
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : hosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hosts found. Create your first host to get started.
                </td>
              </tr>
            ) : (
              hosts.map((host) => (
                <tr key={host.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{host.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{host.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{host.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{host.department || '—'}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => onEdit(host)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(host)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
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
      {!isLoading && hosts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} hosts
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
