import { api } from './api'
import type { User, UserFormData, PaginatedResponse, UserRole, UserStatus } from '@/types'

interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getUsers = async (params?: GetUsersParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.role) queryString.append('role', params.role)
  if (params?.status) queryString.append('status', params.status)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/users${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<User>>(url)
  return response
}

export const getUser = async (id: string) => {
  const response = await api.get<User>(`/admin/api/users/${id}`)
  return response
}

export const createUser = async (data: UserFormData) => {
  const response = await api.post<User>('/admin/api/users', data)
  return response
}

export const updateUser = async (id: string, data: Partial<UserFormData>) => {
  const response = await api.put<User>(`/admin/api/users/${id}`, data)
  return response
}

export const deleteUser = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/users/${id}`
  )
  return response
}

export const deactivateUser = async (id: string) => {
  const response = await api.post<User>(`/admin/api/users/${id}/deactivate`, {})
  return response
}

export const activateUser = async (id: string) => {
  const response = await api.post<User>(`/admin/api/users/${id}/activate`, {})
  return response
}

export const changeUserPassword = async (id: string, newPassword: string) => {
  const response = await api.post<{ success: boolean; message: string }>(
    `/admin/api/users/${id}/change-password`,
    { newPassword }
  )
  return response
}

export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    RECEPTION: 'bg-blue-100 text-blue-800',
    HOST: 'bg-green-100 text-green-800',
    STAFF: 'bg-purple-100 text-purple-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    RECEPTION: 'Reception',
    HOST: 'Host',
    STAFF: 'Staff',
  }
  return labels[role] || role
}

export const getStatusBadgeColor = (status?: UserStatus): string => {
  if (!status) return 'bg-green-100 text-green-800' // Default to active styling
  const colors: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status?: UserStatus): string => {
  if (!status) return 'Active' // Default to active
  const labels: Record<UserStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  }
  return labels[status] || status
}
