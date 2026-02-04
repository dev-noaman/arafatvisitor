import { useState, useEffect } from 'react'
import { UsersList, UserModal, DeleteConfirmationDialog } from '@/components/users'
import { usersService } from '@/services/users'
import { useToast } from '@/hooks'
import type { User, UserFormData, UserRole, UserStatus, PaginatedResponse } from '@/types'

export default function Users() {
  const { success, error } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  // Fetch users
  const fetchUsers = async (
    page = 1,
    search = '',
    role: UserRole | '' = '',
    status: UserStatus | '' = ''
  ) => {
    setIsLoading(true)
    try {
      const params: any = {
        page,
        limit: pagination.limit,
      }
      if (search) params.search = search
      if (role) params.role = role
      if (status) params.status = status

      const response = await usersService.getUsers(params)
      setUsers(response.data || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      })
    } catch (err) {
      error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1, '', '', '')
  }, [])

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
        await usersService.updateUser(selectedUser.id, data)
        success('User updated successfully')
      } else {
        await usersService.createUser(data)
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
        await usersService.deactivateUser(user.id)
        success('User deactivated successfully')
      } else {
        await usersService.activateUser(user.id)
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
      await usersService.deleteUser(userToDelete.id)
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

      {/* Users List */}
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

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        userData={selectedUser}
        isLoading={isSubmitting}
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
    </div>
  )
}
