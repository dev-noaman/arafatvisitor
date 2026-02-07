import { useCallback, useState, useEffect } from 'react'
import { UsersList, UserModal, DeleteConfirmationDialog } from '@/components/users'
import { BulkImportModal } from '@/components/hosts'
import ErrorState from '@/components/common/ErrorState'
import { getUsers, createUser, updateUser, deleteUser, deactivateUser, activateUser } from '@/services/users'
import { getHosts } from '@/services/hosts'
import { useToast } from '@/hooks'
import type { User, UserFormData, UserRole, UserStatus, Host } from '@/types'

export default function Users() {
  const { success, error } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoadingHosts, setIsLoadingHosts] = useState(false)
  const [, setIsActioning] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  // Fetch hosts for HOST role user creation
  const fetchHosts = useCallback(async () => {
    setIsLoadingHosts(true)
    try {
      const response = await getHosts({ limit: 100 })
      setHosts(response.data || [])
    } catch (err) {
      // Non-critical - hosts dropdown just won't be populated
    } finally {
      setIsLoadingHosts(false)
    }
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async (
    page = 1,
    search = '',
    role: UserRole | '' = '',
    status: UserStatus | '' = ''
  ) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      }
      if (search) params.search = search
      if (role) params.role = role
      if (status) params.status = status

      const response = await getUsers(params)
      setUsers(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      setLoadError('Failed to load users. Please check your connection and try again.')
      error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, error])

  useEffect(() => {
    fetchHosts()
    fetchUsers(1, '', '', '')
  }, [fetchHosts, fetchUsers])

  // Handle search
  const handleSearch = (search: string) => {
    setSearchQuery(search)
    fetchUsers(1, search, roleFilter, statusFilter)
  }

  // Handle role filter
  const handleRoleFilter = (role: UserRole | '') => {
    setRoleFilter(role)
    fetchUsers(1, searchQuery, role, statusFilter)
  }

  // Handle status filter
  const handleStatusFilter = (status: UserStatus | '') => {
    setStatusFilter(status)
    fetchUsers(1, searchQuery, roleFilter, status)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page, searchQuery, roleFilter, statusFilter)
  }

  // Handle create/edit submit
  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data)
        success('User updated successfully')
      } else {
        await createUser(data)
        success('User created successfully')
      }
      setIsModalOpen(false)
      setSelectedUser(undefined)
      await fetchUsers(pagination.page, searchQuery, roleFilter, statusFilter)
    } catch (err) {
      error(selectedUser ? 'Failed to update user' : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    setIsActioning(true)
    try {
      if (user.status === 'ACTIVE') {
        await deactivateUser(user.id)
        success('User deactivated successfully')
      } else {
        await activateUser(user.id)
        success('User activated successfully')
      }
      await fetchUsers(pagination.page, searchQuery, roleFilter, statusFilter)
    } catch (err) {
      error('Failed to update user status')
    } finally {
      setIsActioning(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      success('User deleted successfully')
      setIsDeleteDialogOpen(false)
      setUserToDelete(undefined)
      await fetchUsers(pagination.page, searchQuery, roleFilter, statusFilter)
    } catch (err) {
      error('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit
  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and access control</p>
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
              setSelectedUser(undefined)
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load users"
          message={loadError}
          onRetry={() => fetchUsers(pagination.page, searchQuery, roleFilter, statusFilter)}
        />
      )}

      {/* Users List */}
      {!loadError && (
        <UsersList
          users={users}
          isLoading={isLoading}
          pagination={pagination}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        userData={selectedUser}
        isLoading={isSubmitting}
        hosts={hosts}
        isLoadingHosts={isLoadingHosts}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        user={userToDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setUserToDelete(undefined)
        }}
        isLoading={isDeleting}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          success('Users imported successfully')
          fetchUsers(1, searchQuery, roleFilter, statusFilter)
        }}
        importEndpoint="/admin/api/users/import"
        title="Bulk Import Users"
        entityLabel="user"
        expectedColumns={
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Expected Columns:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name</span> - User name (required)</p>
              <p><span className="font-medium">Email</span> - Email address (required)</p>
              <p><span className="font-medium">Phone</span> - Phone number (optional)</p>
              <p><span className="font-medium">Role</span> - ADMIN, RECEPTION, STAFF, or HOST (required)</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Passwords are auto-generated. A welcome email with password reset link will be sent to each user.
              Demo accounts (@arafatvisitor.cloud) and existing emails are automatically skipped.
              STAFF/HOST users get a linked host record auto-created.
            </p>
          </div>
        }
      />
    </div>
  )
}
