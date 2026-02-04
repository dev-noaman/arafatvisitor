import { api } from './api'
import type { Host, HostFormData, PaginatedResponse } from '@/types'

interface GetHostsParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getHosts = async (params?: GetHostsParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/hosts${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<Host>>(url)
  return response
}

export const getHost = async (id: string) => {
  const response = await api.get<Host>(`/admin/api/hosts/${id}`)
  return response
}

export const createHost = async (data: HostFormData) => {
  const response = await api.post<Host>('/admin/api/hosts', data)
  return response
}

export const updateHost = async (id: string, data: Partial<HostFormData>) => {
  const response = await api.put<Host>(`/admin/api/hosts/${id}`, data)
  return response
}

export const deleteHost = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/hosts/${id}`
  )
  return response
}
