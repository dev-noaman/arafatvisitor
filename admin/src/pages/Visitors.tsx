import { useCallback, useState, useEffect } from 'react'
import { VisitorsList, VisitModal, DeleteConfirmationDialog } from '@/components/visitors'
import ErrorState from '@/components/common/ErrorState'
import { getVisitors, createVisit, updateVisit, deleteVisit, approveVisit, rejectVisit, checkoutVisit } from '@/services/visitors'
import { getHosts } from '@/services/hosts'
import { useToast } from '@/hooks'
import type { Visit, VisitFormData, Host, VisitStatus } from '@/types'

export default function Visitors() {
  const { success, error } = useToast()
  const [visitors, setVisitors] = useState<Visit[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingHosts, setIsLoadingHosts] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<Visit | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [visitorToDelete, setVisitorToDelete] = useState<Visit | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, setIsActioning] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<VisitStatus | ''>('')

  // Fetch hosts for dropdown
  const fetchHosts = useCallback(async () => {
    setIsLoadingHosts(true)
    try {
      const response = await getHosts({ limit: 100 })
      setHosts(response.data || [])
    } catch (err) {
      error('Failed to load hosts')
    } finally {
      setIsLoadingHosts(false)
    }
  }, [error])

  // Fetch visitors
  const fetchVisitors = useCallback(async (page = 1, search = '', status: VisitStatus | '' = '') => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      }
      if (search) params.search = search
      if (status) params.status = status

      const response = await getVisitors(params)
      setVisitors(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load visitors. Please check your connection and try again.')
      error('Failed to load visitors')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchHosts()
    fetchVisitors(1, '', '')
  }, [fetchHosts, fetchVisitors])

  // Handle search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchVisitors(1, search, statusFilter)
  }

  // Handle status filter
  const handleStatusFilter = (status: VisitStatus | '') => {
    setStatusFilter(status)
    fetchVisitors(1, searchQuery, status)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchVisitors(page, searchQuery, statusFilter)
  }

  // Handle create/edit submit
  const handleFormSubmit = async (data: VisitFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedVisitor) {
        await updateVisit(selectedVisitor.id, data)
        success('Visitor updated successfully')
      } else {
        await createVisit(data)
        success('Visitor registered successfully')
      }
      setIsModalOpen(false)
      setSelectedVisitor(undefined)
      await fetchVisitors(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error(selectedVisitor ? 'Failed to update visitor' : 'Failed to register visitor')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle approve
  const handleApprove = async (visitor: Visit) => {
    setIsActioning(true)
    try {
      await approveVisit(visitor.id)
      success('Visitor approved successfully')
      await fetchVisitors(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to approve visitor')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle reject
  const handleReject = async (visitor: Visit) => {
    setIsActioning(true)
    try {
      await rejectVisit(visitor.id)
      success('Visitor rejected')
      await fetchVisitors(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to reject visitor')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle checkout
  const handleCheckout = async (visitor: Visit) => {
    setIsActioning(true)
    try {
      await checkoutVisit(visitor.id)
      success('Visitor checked out successfully')
      await fetchVisitors(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to checkout visitor')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!visitorToDelete) return
    setIsDeleting(true)
    try {
      await deleteVisit(visitorToDelete.id)
      success('Visitor record deleted successfully')
      setIsDeleteDialogOpen(false)
      setVisitorToDelete(undefined)
      await fetchVisitors(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to delete visitor')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit
  const handleEdit = (visitor: Visit) => {
    setSelectedVisitor(visitor)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (visitor: Visit) => {
    setVisitorToDelete(visitor)
    setIsDeleteDialogOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVisitor(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors Management</h1>
          <p className="text-gray-600 mt-1">Register and manage visitor check-ins</p>
        </div>
        <button
          onClick={() => {
            setSelectedVisitor(undefined)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Visitor
          </span>
        </button>
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load visitors"
          message={loadError}
          onRetry={() => fetchVisitors(pagination.page, searchQuery, statusFilter)}
        />
      )}

      {/* Visitors List */}
      {!loadError && (
        <VisitorsList
          visitors={visitors}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onApprove={handleApprove}
          onReject={handleReject}
          onCheckout={handleCheckout}
        />
      )}

      {/* Visit Modal */}
      <VisitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        visitData={selectedVisitor}
        hosts={hosts}
        isLoading={isSubmitting}
        isLoadingHosts={isLoadingHosts}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        visitor={visitorToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setVisitorToDelete(undefined)
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}
