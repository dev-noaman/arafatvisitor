import { api } from './api'
import type { Host, HostFormData, PaginatedResponse } from '@/types'

interface GetStaffParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getStaffMembers = async (params?: GetStaffParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/staff${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<Host>>(url)
  return response
}

export const createStaffMember = async (data: HostFormData) => {
  const response = await api.post<Host>('/admin/api/staff', data)
  return response
}

export const updateStaffMember = async (id: string, data: Partial<HostFormData>) => {
  const response = await api.put<Host>(`/admin/api/staff/${id}`, data)
  return response
}

export const deleteStaffMember = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/staff/${id}`
  )
  return response
}

export const importStaff = async (body: { csvContent?: string; xlsxContent?: string }) => {
  const response = await api.post<{
    totalProcessed: number
    inserted: number
    skipped: number
    rejected: number
    rejectedRows: Array<{ rowNumber: number; reason: string }>
    usersCreated?: number
    usersSkipped?: number
  }>('/admin/api/staff/import', body)
  return response
}
