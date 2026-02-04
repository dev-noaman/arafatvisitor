import { api } from './api'
import type { Visit, VisitFormData, PaginatedResponse, VisitStatus } from '@/types'

interface GetVisitorsParams {
  page?: number
  limit?: number
  search?: string
  status?: VisitStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getVisitors = async (params?: GetVisitorsParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.status) queryString.append('status', params.status)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/visitors${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<Visit>>(url)
  return response
}

export const getVisitor = async (id: string) => {
  const response = await api.get<Visit>(`/admin/api/visitors/${id}`)
  return response
}

export const createVisit = async (data: VisitFormData) => {
  const response = await api.post<Visit>('/admin/api/visitors', data)
  return response
}

export const updateVisit = async (id: string, data: Partial<VisitFormData>) => {
  const response = await api.put<Visit>(`/admin/api/visitors/${id}`, data)
  return response
}

export const deleteVisit = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/visitors/${id}`
  )
  return response
}

export const approveVisit = async (id: string) => {
  const response = await api.post<Visit>(`/admin/api/visitors/${id}/approve`, {})
  return response
}

export const rejectVisit = async (id: string, reason?: string) => {
  const response = await api.post<Visit>(`/admin/api/visitors/${id}/reject`, { reason })
  return response
}

export const checkoutVisit = async (id: string) => {
  const response = await api.post<Visit>(`/admin/api/visitors/${id}/checkout`, {})
  return response
}

export const getStatusBadgeColor = (status: VisitStatus): string => {
  const colors: Record<VisitStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-blue-100 text-blue-800',
    CHECKED_OUT: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status: VisitStatus): string => {
  const labels: Record<VisitStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}
