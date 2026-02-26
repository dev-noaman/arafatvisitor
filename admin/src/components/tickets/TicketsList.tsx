import { useState } from 'react'
import type { Ticket, TicketType, TicketStatus, TicketPriority, TicketCategory } from '@/types'
import {
  getStatusBadgeColor,
  getStatusLabel,
  getPriorityBadgeColor,
  getPriorityLabel,
  getCategoryLabel,
} from '@/services/tickets'

interface TicketsListProps {
  tickets: Ticket[]
  isLoading: boolean
  pagination: { page: number; limit: number; total: number; totalPages: number }
  activeTab: TicketType
  onTabChange: (tab: TicketType) => void
  onSearch: (search: string) => void
  onStatusFilter: (status: TicketStatus | '') => void
  onPriorityFilter: (priority: TicketPriority | '') => void
  onCategoryFilter: (category: TicketCategory | '') => void
  onPageChange: (page: number) => void
  onTicketClick: (ticket: Ticket) => void
  // New filter props
  adminUsers?: { id: number; name: string }[]
  onAssigneeFilter?: (assigneeId: number | '') => void
  onDateRangeFilter?: (dateFrom: string, dateTo: string) => void
  dateFrom?: string
  dateTo?: string
}

export default function TicketsList({
  tickets,
  isLoading,
  pagination,
  activeTab,
  onTabChange,
  onSearch,
  onStatusFilter,
  onPriorityFilter,
  onCategoryFilter,
  onPageChange,
  onTicketClick,
  adminUsers,
  onAssigneeFilter,
  onDateRangeFilter,
  dateFrom = '',
  dateTo = '',
}: TicketsListProps) {
  const [searchInput, setSearchInput] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const complaintStatuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
  const suggestionStatuses: TicketStatus[] = ['SUBMITTED', 'REVIEWED', 'DISMISSED']

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onTabChange('COMPLAINT')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'COMPLAINT'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Complaints
        </button>
        <button
          onClick={() => onTabChange('SUGGESTION')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'SUGGESTION'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Suggestions
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by subject or ticket number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSearch(searchInput) } }}
          />
        </form>

        <select
          onChange={(e) => onStatusFilter(e.target.value as TicketStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {(activeTab === 'COMPLAINT' ? complaintStatuses : suggestionStatuses).map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>

        {activeTab === 'COMPLAINT' && (
          <>
            <select
              onChange={(e) => onPriorityFilter(e.target.value as TicketPriority | '')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              onChange={(e) => onCategoryFilter(e.target.value as TicketCategory | '')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="IT_ISSUE">IT Issue</option>
              <option value="FACILITY_ISSUE">Facility Issue</option>
              <option value="VISITOR_SYSTEM_BUG">Visitor System Bug</option>
              <option value="SERVICE_QUALITY">Service Quality</option>
              <option value="OTHER">Other</option>
            </select>

            {adminUsers && adminUsers.length > 0 && onAssigneeFilter && (
              <select
                onChange={(e) => onAssigneeFilter(e.target.value ? Number(e.target.value) as number : '')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Assignees</option>
                {adminUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </>
        )}

        {onDateRangeFilter && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateRangeFilter(e.target.value, dateTo)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="From date"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateRangeFilter(dateFrom, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="To date"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              {activeTab === 'COMPLAINT' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={activeTab === 'COMPLAINT' ? 8 : 5} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'COMPLAINT' ? 8 : 5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{ticket.ticketNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">{ticket.subject}</td>
                  {activeTab === 'COMPLAINT' && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-600">{getCategoryLabel(ticket.category)}</td>
                      <td className="px-4 py-3">
                        {ticket.priority && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityBadgeColor(ticket.priority)}`}>
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ticket.assignedTo?.name || <span className="text-gray-400">Unassigned</span>}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ticket.createdBy.name}
                    <span className={`ml-1.5 text-[10px] font-medium px-1 py-0.5 rounded ${
                      ticket.createdBy.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      ticket.createdBy.role === 'HOST' ? 'bg-green-100 text-green-700' :
                      ticket.createdBy.role === 'RECEPTION' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {ticket.createdBy.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1.5 text-sm border rounded-md ${
                    pageNum === pagination.page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
