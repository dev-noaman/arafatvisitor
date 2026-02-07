import { useCallback, useState, useEffect } from 'react'
import { HostsList, HostModal, DeleteConfirmationDialog, BulkImportModal } from '@/components/hosts'
import ErrorState from '@/components/common/ErrorState'
import { getHosts, createHost, updateHost, deleteHost } from '@/services/hosts'
import { useToast } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import type { Host, HostFormData } from '@/types'

export default function Hosts() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const { success, error } = useToast()
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHost, setSelectedHost] = useState<Host | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [hostToDelete, setHostToDelete] = useState<Host | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch hosts
  const fetchHosts = useCallback(async (page = 1, search = '') => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await getHosts({
        page,
        limit: pagination.limit,
        search,
        type: 'EXTERNAL',
      })
      setHosts(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load hosts. Please check your connection and try again.')
      error('Failed to load hosts')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchHosts(1, '')
  }, [fetchHosts])

  // Handle search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchHosts(1, search)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchHosts(page, searchQuery)
  }

  // Handle create/edit submit
  const handleFormSubmit = async (data: HostFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedHost) {
        await updateHost(selectedHost.id, data)
        success('Host updated successfully')
      } else {
        await createHost(data)
        success('Host created successfully')
      }
      setIsModalOpen(false)
      setSelectedHost(undefined)
      await fetchHosts(pagination.page, searchQuery)
    } catch (err) {
      error(selectedHost ? 'Failed to update host' : 'Failed to create host')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!hostToDelete) return
    setIsDeleting(true)
    try {
      await deleteHost(hostToDelete.id)
      success('Host deleted successfully')
      setIsDeleteDialogOpen(false)
      setHostToDelete(undefined)
      await fetchHosts(pagination.page, searchQuery)
    } catch (err) {
      error('Failed to delete host')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit
  const handleEdit = (host: Host) => {
    setSelectedHost(host)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (host: Host) => {
    setHostToDelete(host)
    setIsDeleteDialogOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedHost(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hosts Management</h1>
          <p className="text-gray-600 mt-1">Manage companies and host contacts</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Bulk Import
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedHost(undefined)
                setIsModalOpen(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Host
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load hosts"
          message={loadError}
          onRetry={() => fetchHosts(pagination.page, searchQuery)}
        />
      )}

      {/* Hosts List */}
      {!loadError && (
        <HostsList
          hosts={hosts}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Host Modal */}
      <HostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        hostData={selectedHost}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        host={hostToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setHostToDelete(undefined)
        }}
        isLoading={isDeleting}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          success('Hosts imported successfully')
          fetchHosts(1, searchQuery)
        }}
      />
    </div>
  )
}
