import { useCallback, useState, useEffect } from 'react'
import { HostsList, HostModal, DeleteConfirmationDialog, BulkImportModal } from '@/components/hosts'
import ErrorState from '@/components/common/ErrorState'
import { getStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember } from '@/services/staff'
import { useToast } from '@/hooks'
import type { Host, HostFormData } from '@/types'

export default function Staff() {
  const { success, error } = useToast()
  const [staff, setStaff] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Host | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<Host | undefined>()
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

  const fetchStaff = useCallback(async (page = 1, search = '') => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await getStaffMembers({
        page,
        limit: pagination.limit,
        search,
      })
      setStaff(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load staff members. Please check your connection and try again.')
      error('Failed to load staff')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchStaff(1, '')
  }, [fetchStaff])

  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchStaff(1, search)
  }

  const handlePageChange = (page: number) => {
    fetchStaff(page, searchQuery)
  }

  const handleFormSubmit = async (data: HostFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedStaff) {
        await updateStaffMember(selectedStaff.id, data)
        success('Staff member updated successfully')
      } else {
        await createStaffMember(data)
        success('Staff member created successfully')
      }
      setIsModalOpen(false)
      setSelectedStaff(undefined)
      await fetchStaff(pagination.page, searchQuery)
    } catch (err) {
      error(selectedStaff ? 'Failed to update staff member' : 'Failed to create staff member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!staffToDelete) return
    setIsDeleting(true)
    try {
      await deleteStaffMember(staffToDelete.id)
      success('Staff member deleted successfully')
      setIsDeleteDialogOpen(false)
      setStaffToDelete(undefined)
      await fetchStaff(pagination.page, searchQuery)
    } catch (err) {
      error('Failed to delete staff member')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (member: Host) => {
    setSelectedStaff(member)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (member: Host) => {
    setStaffToDelete(member)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStaff(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage internal staff members</p>
        </div>
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
              setSelectedStaff(undefined)
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Staff
            </span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load staff"
          message={loadError}
          onRetry={() => fetchStaff(pagination.page, searchQuery)}
        />
      )}

      {/* Staff List */}
      {!loadError && (
        <HostsList
          hosts={staff}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          entityLabel="staff"
          hideCompany
        />
      )}

      {/* Staff Modal */}
      <HostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        hostData={selectedStaff}
        isLoading={isSubmitting}
        entityLabel="Staff"
        hideCompany
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        host={staffToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setStaffToDelete(undefined)
        }}
        isLoading={isDeleting}
        entityLabel="Staff"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          success('Staff imported successfully')
          fetchStaff(1, searchQuery)
        }}
        importEndpoint="/admin/api/staff/import"
        title="Bulk Import Staff"
      />
    </div>
  )
}
