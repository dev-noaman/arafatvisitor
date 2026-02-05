import { api } from './api'
import type { Delivery, DeliveryFormData, PaginatedResponse, DeliveryStatus } from '@/types'

interface GetDeliveriesParams {
  page?: number
  limit?: number
  search?: string
  status?: DeliveryStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getDeliveries = async (params?: GetDeliveriesParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.status) queryString.append('status', params.status)
  if (params?.sortBy) queryString.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)

  const query = queryString.toString()
  const url = `/admin/api/deliveries${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<Delivery>>(url)
  return response
}

export const getDelivery = async (id: string) => {
  const response = await api.get<Delivery>(`/admin/api/deliveries/${id}`)
  return response
}

export const createDelivery = async (data: DeliveryFormData) => {
  const response = await api.post<Delivery>('/admin/api/deliveries', data)
  return response
}

export const updateDelivery = async (id: string, data: Partial<DeliveryFormData>) => {
  const response = await api.put<Delivery>(`/admin/api/deliveries/${id}`, data)
  return response
}

export const deleteDelivery = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/api/deliveries/${id}`
  )
  return response
}

export const markAsPickedUp = async (id: string) => {
  const response = await api.post<Delivery>(`/admin/api/deliveries/${id}/mark-picked-up`, {})
  return response
}

export const getStatusBadgeColor = (status: DeliveryStatus): string => {
  const colors: Record<DeliveryStatus, string> = {
    RECEIVED: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PICKED_UP: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status: DeliveryStatus): string => {
  const labels: Record<DeliveryStatus, string> = {
    RECEIVED: 'Awaiting Pickup',
    PENDING: 'Awaiting Pickup',
    PICKED_UP: 'Picked Up',
  }
  return labels[status] || status
}
