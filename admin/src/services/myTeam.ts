import { api } from './api'
import type { Host, PaginatedResponse } from '@/types'

interface TeamMemberFormData {
  name: string
  email: string
  phone?: string
}

interface GetMyTeamParams {
  page?: number
  limit?: number
  search?: string
  status?: number
}

export const getMyTeam = async (params?: GetMyTeamParams) => {
  const queryString = new URLSearchParams()
  if (params?.page) queryString.append('page', params.page.toString())
  if (params?.limit) queryString.append('limit', params.limit.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.status !== undefined) queryString.append('status', params.status.toString())

  const query = queryString.toString()
  const url = `/admin/api/my-team${query ? `?${query}` : ''}`
  const response = await api.get<PaginatedResponse<Host>>(url)
  return response
}

export const createTeamMember = async (data: TeamMemberFormData) => {
  const response = await api.post<Host>('/admin/api/my-team', data)
  return response
}

export const updateTeamMember = async (id: string, data: Partial<TeamMemberFormData>) => {
  const response = await api.patch<Host>(`/admin/api/my-team/${id}`, data)
  return response
}

export const toggleTeamMemberStatus = async (id: string, status: 0 | 1) => {
  const response = await api.patch<{ id: string; name: string; status: number; message: string }>(
    `/admin/api/my-team/${id}/status`,
    { status }
  )
  return response
}
