import { api } from './api'
import type {
  Ticket,
  TicketComment,
  TicketAttachment,
  TicketFormData,
  TicketStats,
  TicketStatus,
  TicketType,
  PaginatedResponse,
} from '@/types'

const BASE = '/admin/api/tickets'

// ========== API Calls ==========

interface GetTicketsParams {
  page?: number
  limit?: number
  search?: string
  type?: TicketType
  status?: TicketStatus
  assignedToId?: number
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const getTickets = async (params?: GetTicketsParams) => {
  const qs = new URLSearchParams()
  if (params?.page) qs.append('page', params.page.toString())
  if (params?.limit) qs.append('limit', params.limit.toString())
  if (params?.search) qs.append('search', params.search)
  if (params?.type) qs.append('type', params.type)
  if (params?.status) qs.append('status', params.status)
  if (params?.assignedToId) qs.append('assignedToId', params.assignedToId.toString())
  if (params?.dateFrom) qs.append('dateFrom', params.dateFrom)
  if (params?.dateTo) qs.append('dateTo', params.dateTo)
  if (params?.sortBy) qs.append('sortBy', params.sortBy)
  if (params?.sortOrder) qs.append('sortOrder', params.sortOrder)

  const query = qs.toString()
  return api.get<PaginatedResponse<Ticket>>(`${BASE}${query ? `?${query}` : ''}`)
}

export const getTicket = async (id: number) => {
  return api.get<Ticket>(`${BASE}/${id}`)
}

export const createTicket = async (data: TicketFormData) => {
  return api.post<Ticket>(BASE, data)
}

export const updateTicket = async (id: number, data: Record<string, unknown>) => {
  return api.patch<Ticket>(`${BASE}/${id}`, data)
}

export const addComment = async (id: number, data: { message: string; isInternal?: boolean }) => {
  return api.post<TicketComment>(`${BASE}/${id}/comments`, data)
}

export const uploadAttachment = async (id: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.upload<TicketAttachment>(`${BASE}/${id}/attachments`, formData)
}

export const downloadAttachment = (ticketId: number, attachId: number) => {
  const token = localStorage.getItem('auth_token')
  const url = `${BASE}/${ticketId}/attachments/${attachId}`
  // Open in new tab with auth — use fetch + blob
  return fetch(url, {
    credentials: 'include',
    headers: token && token !== 'authenticated' ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => {
    if (!res.ok) throw new Error('Download failed')
    return res.blob()
  })
}

export const reopenTicket = async (id: number, comment: string) => {
  return api.post<Ticket>(`${BASE}/${id}/reopen`, { comment })
}

export const getTicketStats = async () => {
  return api.get<TicketStats>(`${BASE}/stats`)
}

// ========== Display Helpers ==========

export const getStatusBadgeColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    REVIEWED: 'bg-green-100 text-green-800',
    DISMISSED: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-600',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusLabel = (status: TicketStatus): string => {
  const labels: Record<TicketStatus, string> = {
    SUBMITTED: 'Submitted',
    REVIEWED: 'Reviewed',
    DISMISSED: 'Dismissed',
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

export const getTypeBadgeColor = (type: TicketType): string => {
  return type === 'SUGGESTION'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-orange-100 text-orange-800'
}

export const getTypeLabel = (type: TicketType): string => {
  return type === 'SUGGESTION' ? 'Suggestion' : 'Complaint'
}
