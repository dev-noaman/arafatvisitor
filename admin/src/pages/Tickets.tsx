import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { TicketsList, TicketDetail, TicketModal } from '@/components/tickets'
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  addComment,
  uploadAttachment,
  reopenTicket,
} from '@/services/tickets'
import type {
  Ticket,
  TicketType,
  TicketStatus,
  TicketFormData,
} from '@/types'

export default function Tickets() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const isAdmin = user?.role === 'ADMIN'

  // Data
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  // Loading
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TicketType>('COMPLAINT')
  const [view, setView] = useState<'list' | 'detail'>('list')

  // Filters & Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')

  // Fetch tickets
  const fetchTickets = useCallback(async (
    page = 1,
    search = '',
    type: TicketType = activeTab,
    status: TicketStatus | '' = '',
    dateFrom = '',
    dateTo = '',
  ) => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page,
        limit: pagination.limit,
        type,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
      if (search) params.search = search
      if (status) params.status = status
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      const response = await getTickets(params as any)
      setTickets(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err: any) {
      error(err?.message || 'Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, pagination.limit, error])

  // Initial load
  useEffect(() => {
    fetchTickets(1, '', activeTab)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Tab change
  const handleTabChange = (tab: TicketType) => {
    setActiveTab(tab)
    setSearchQuery('')
    setStatusFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    fetchTickets(1, '', tab, '', '', '')
  }

  // Search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchTickets(1, search, activeTab, statusFilter, dateFromFilter, dateToFilter)
  }

  // Filters
  const handleStatusFilter = (status: TicketStatus | '') => {
    setStatusFilter(status)
    fetchTickets(1, searchQuery, activeTab, status, dateFromFilter, dateToFilter)
  }
  const handleDateRangeFilter = (dateFrom: string, dateTo: string) => {
    setDateFromFilter(dateFrom)
    setDateToFilter(dateTo)
    fetchTickets(1, searchQuery, activeTab, statusFilter, dateFrom, dateTo)
  }

  // Pagination
  const handlePageChange = (page: number) => {
    fetchTickets(page, searchQuery, activeTab, statusFilter, dateFromFilter, dateToFilter)
  }

  // View ticket detail
  const handleTicketClick = async (ticket: Ticket) => {
    try {
      const detail = await getTicket(ticket.id)
      setSelectedTicket(detail)
      setView('detail')
    } catch {
      error('Failed to load ticket details')
    }
  }

  // Create ticket
  const handleCreateTicket = async (data: TicketFormData, files: File[]) => {
    setIsSubmitting(true)
    try {
      const created = await createTicket(data)
      // Upload attachments
      for (const file of files) {
        try {
          await uploadAttachment(created.id, file)
        } catch {
          error(`Failed to upload ${file.name}`)
        }
      }
      success(`Ticket ${created.ticketNumber} created successfully`)
      setIsModalOpen(false)
      fetchTickets(1, searchQuery, activeTab, statusFilter, dateFromFilter, dateToFilter)
    } catch (err: any) {
      error(err?.message || 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update ticket (admin actions)
  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!selectedTicket) return
    try {
      const updated = await updateTicket(selectedTicket.id, data)
      setSelectedTicket(updated)
      success('Ticket updated successfully')
    } catch (err: any) {
      if (err?.statusCode === 409 || err?.message?.includes('modified')) {
        error('This ticket was modified by another user. Please refresh.')
        // Refetch
        const refreshed = await getTicket(selectedTicket.id)
        setSelectedTicket(refreshed)
      } else {
        error(err?.message || 'Failed to update ticket')
      }
    }
  }

  // Add comment
  const handleAddComment = async (message: string, isInternal: boolean) => {
    if (!selectedTicket) return
    try {
      await addComment(selectedTicket.id, { message, isInternal })
      // Refetch detail to show new comment
      const refreshed = await getTicket(selectedTicket.id)
      setSelectedTicket(refreshed)
    } catch {
      error('Failed to add comment')
    }
  }

  // Reopen
  const handleReopen = async (comment: string) => {
    if (!selectedTicket) return
    try {
      const updated = await reopenTicket(selectedTicket.id, comment)
      setSelectedTicket(updated)
      success('Ticket reopened successfully')
    } catch (err: any) {
      error(err?.message || 'Failed to reopen ticket')
    }
  }

  // Back to list
  const handleBackToList = () => {
    setView('list')
    setSelectedTicket(null)
    fetchTickets(pagination.page, searchQuery, activeTab, statusFilter, dateFromFilter, dateToFilter)
  }

  return (
    <div className="p-6">
      {/* Header */}
      {view === 'list' && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            New Ticket
          </button>
        </div>
      )}

      {/* Content */}
      {view === 'list' ? (
        <TicketsList
          tickets={tickets}
          isLoading={isLoading}
          pagination={pagination}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onPageChange={handlePageChange}
          onTicketClick={handleTicketClick}
          onDateRangeFilter={handleDateRangeFilter}
          dateFrom={dateFromFilter}
          dateTo={dateToFilter}
        />
      ) : selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          isAdmin={isAdmin}
          currentUserId={Number(user?.id) || 0}
          onUpdate={handleUpdate}
          onAddComment={handleAddComment}
          onReopen={handleReopen}
          onBack={handleBackToList}
        />
      ) : null}

      {/* Create Modal */}
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
        isLoading={isSubmitting}
      />
    </div>
  )
}
