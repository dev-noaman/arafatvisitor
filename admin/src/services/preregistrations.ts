import { api } from './api'
import type { PreRegistration, PreRegistrationFormData, PaginatedResponse } from '@/types'

interface GetPreRegistrationsParams {
  page?: number
  limit?: number
  search?: string
  status?: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getPreRegistrations = async (params?: GetPreRegistrationsParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.status) queryString.append('status', params.status)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/pre-registrations${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<PreRegistration>>(url)
  return response
}

export const getPreRegistration = async (id: string) => {
  const response = await api.get<PreRegistration>(`/admin/api/pre-registrations/${id}`)
  return response
}

export const createPreRegistration = async (data: PreRegistrationFormData) => {
  const response = await api.post<PreRegistration>('/admin/api/pre-registrations', data)
  return response
}

export const updatePreRegistration = async (
  id: string,
  data: Partial<PreRegistrationFormData>
) => {
  const response = await api.put<PreRegistration>(`/admin/api/pre-registrations/${id}`, data)
  return response
}

export const deletePreRegistration = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/pre-registrations/${id}`
  )
  return response
}

export const approvePreRegistration = async (id: string) => {
  const response = await api.post<PreRegistration>(
    `/admin/api/pre-registrations/${id}/approve`,
    {}
  )
  return response
}

export const rejectPreRegistration = async (id: string, reason?: string) => {
  const response = await api.post<PreRegistration>(
    `/admin/api/pre-registrations/${id}/reject`,
    { reason }
  )
  return response
}

export const reApproveRejected = async (id: string) => {
  const response = await api.post<PreRegistration>(
    `/admin/api/pre-registrations/${id}/re-approve`,
    {}
  )
  return response
}

export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    APPROVED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-blue-100 text-blue-800',
    CHECKED_OUT: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PENDING_APPROVAL: 'Pending Approval',
    REJECTED: 'Rejected',
    APPROVED: 'Approved',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
  }
  return labels[status] || status
}
