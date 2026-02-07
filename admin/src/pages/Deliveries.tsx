import { useCallback, useState, useEffect } from 'react'
import { DeliveriesList, DeliveryModal, DeleteConfirmationDialog } from '@/components/deliveries'
import ErrorState from '@/components/common/ErrorState'
import { getDeliveries, createDelivery, updateDelivery, deleteDelivery, markAsPickedUp } from '@/services/deliveries'
import { useToast, useAuth } from '@/hooks'
import type { Delivery, DeliveryFormData, DeliveryStatus } from '@/types'

export default function Deliveries() {
  const { success, error } = useToast()
  const { user } = useAuth()
  const canCreateEdit = user?.role === 'ADMIN' || user?.role === 'RECEPTION'
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | undefined>()
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
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('')

  // Fetch deliveries
  const fetchDeliveries = useCallback(async (
    page = 1,
    search = '',
    status: DeliveryStatus | '' = ''
  ) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      }
      if (search) params.search = search
      if (status) params.status = status

      const response = await getDeliveries(params)
      setDeliveries(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load deliveries. Please check your connection and try again.')
      error('Failed to load deliveries')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchDeliveries(1, '', '')
  }, [fetchDeliveries])

  // Handle search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchDeliveries(1, search, statusFilter)
  }

  // Handle status filter
  const handleStatusFilter = (status: DeliveryStatus | '') => {
    setStatusFilter(status)
    fetchDeliveries(1, searchQuery, status)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchDeliveries(page, searchQuery, statusFilter)
  }

  // Handle create/edit submit
  const handleFormSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedDelivery) {
        await updateDelivery(selectedDelivery.id, data)
        success('Delivery updated successfully')
      } else {
        await createDelivery(data)
        success('Delivery recorded successfully')
      }
      setIsModalOpen(false)
      setSelectedDelivery(undefined)
      await fetchDeliveries(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error(selectedDelivery ? 'Failed to update delivery' : 'Failed to record delivery')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle mark picked up
  const handleMarkPickedUp = async (delivery: Delivery) => {
    setIsActioning(true)
    try {
      await markAsPickedUp(delivery.id)
      success('Delivery marked as picked up')
      await fetchDeliveries(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to mark delivery as picked up')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deliveryToDelete) return
    setIsDeleting(true)
    try {
      await deleteDelivery(deliveryToDelete.id)
      success('Delivery deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeliveryToDelete(undefined)
      await fetchDeliveries(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to delete delivery')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit
  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (delivery: Delivery) => {
    setDeliveryToDelete(delivery)
    setIsDeleteDialogOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDelivery(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries Management</h1>
          <p className="text-gray-600 mt-1">Track and manage package deliveries</p>
        </div>
        {canCreateEdit && (
          <button
            onClick={() => {
              setSelectedDelivery(undefined)
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record Delivery
            </span>
          </button>
        )}
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load deliveries"
          message={loadError}
          onRetry={() => fetchDeliveries(pagination.page, searchQuery, statusFilter)}
        />
      )}

      {/* Deliveries List */}
      {!loadError && (
        <DeliveriesList
          deliveries={deliveries}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onMarkPickedUp={handleMarkPickedUp}
        />
      )}

      {/* Delivery Modal */}
      <DeliveryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        delivery={deliveryToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setDeliveryToDelete(undefined)
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}
