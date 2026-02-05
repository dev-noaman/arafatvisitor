import { useCallback, useState, useEffect } from 'react'
import {
  PreRegistrationsList,
  PreRegistrationModal,
  DeleteConfirmationDialog,
} from '@/components/preregistrations'
import ErrorState from '@/components/common/ErrorState'
import { getPreRegistrations, createPreRegistration, updatePreRegistration, deletePreRegistration, approvePreRegistration, rejectPreRegistration, reApproveRejected } from '@/services/preregistrations'
import { getHosts } from '@/services/hosts'
import { useToast } from '@/hooks'
import type {
  PreRegistration,
  PreRegistrationFormData,
  Host,
} from '@/types'

export default function PreRegister() {
  const { success, error } = useToast()
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingHosts, setIsLoadingHosts] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPreReg, setSelectedPreReg] = useState<PreRegistration | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [preRegToDelete, setPreRegToDelete] = useState<PreRegistration | undefined>()
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
  const [statusFilter, setStatusFilter] = useState<
    'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | ''
  >('')

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
  
  // Fetch pre-registrations
  const fetchPreRegistrations = useCallback(async (
    page = 1,
    search = '',
    status: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | '' = ''
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

      const response = await getPreRegistrations(params)
      setPreRegistrations(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load pre-registrations. Please check your connection and try again.')
      error('Failed to load pre-registrations')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchHosts()
    fetchPreRegistrations(1, '', '')
  }, [fetchHosts, fetchPreRegistrations])

  // Handle search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchPreRegistrations(1, search, statusFilter)
  }

  // Handle status filter
  const handleStatusFilter = (status: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | '') => {
    setStatusFilter(status)
    fetchPreRegistrations(1, searchQuery, status)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchPreRegistrations(page, searchQuery, statusFilter)
  }

  // Handle create/edit submit
  const handleFormSubmit = async (data: PreRegistrationFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedPreReg) {
        await updatePreRegistration(selectedPreReg.id, data)
        success('Pre-registration updated successfully')
      } else {
        await createPreRegistration(data)
        success('Pre-registration created successfully')
      }
      setIsModalOpen(false)
      setSelectedPreReg(undefined)
      await fetchPreRegistrations(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error(selectedPreReg ? 'Failed to update pre-registration' : 'Failed to create pre-registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle approve
  const handleApprove = async (preReg: PreRegistration) => {
    setIsActioning(true)
    try {
      await approvePreRegistration(preReg.id)
      success('Pre-registration approved successfully')
      await fetchPreRegistrations(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to approve pre-registration')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle reject
  const handleReject = async (preReg: PreRegistration) => {
    setIsActioning(true)
    try {
      await rejectPreRegistration(preReg.id)
      success('Pre-registration rejected')
      await fetchPreRegistrations(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to reject pre-registration')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle re-approve
  const handleReApprove = async (preReg: PreRegistration) => {
    setIsActioning(true)
    try {
      await reApproveRejected(preReg.id)
      success('Pre-registration re-approved successfully')
      await fetchPreRegistrations(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to re-approve pre-registration')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!preRegToDelete) return
    setIsDeleting(true)
    try {
      await deletePreRegistration(preRegToDelete.id)
      success('Pre-registration deleted successfully')
      setIsDeleteDialogOpen(false)
      setPreRegToDelete(undefined)
      await fetchPreRegistrations(pagination.page, searchQuery, statusFilter)
    } catch (err) {
      error('Failed to delete pre-registration')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit
  const handleEdit = (preReg: PreRegistration) => {
    setSelectedPreReg(preReg)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (preReg: PreRegistration) => {
    setPreRegToDelete(preReg)
    setIsDeleteDialogOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPreReg(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Registrations Management</h1>
          <p className="text-gray-600 mt-1">Manage pre-registered visitor records and approvals</p>
        </div>
        <button
          onClick={() => {
            setSelectedPreReg(undefined)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Pre-Registration
          </span>
        </button>
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load pre-registrations"
          message={loadError}
          onRetry={() => fetchPreRegistrations(pagination.page, searchQuery, statusFilter)}
        />
      )}

      {/* Pre-Registrations List */}
      {!loadError && (
        <PreRegistrationsList
          preRegistrations={preRegistrations}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onApprove={handleApprove}
          onReject={handleReject}
          onReApprove={handleReApprove}
        />
      )}

      {/* Pre-Registration Modal */}
      <PreRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        preRegistrationData={selectedPreReg}
        hosts={hosts}
        isLoading={isSubmitting}
        isLoadingHosts={isLoadingHosts}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        preRegistration={preRegToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setPreRegToDelete(undefined)
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}
