import { api } from './api'
import type { VisitReport, DeliveryReport, HostReport } from '@/types'

interface DateRangeParams {
  startDate: string
  endDate: string
}

interface ReportsData {
  summary: {
    totalVisits: number
    approvedVisits: number
    checkedInVisits: number
    totalDeliveries: number
    deliveriesPickedUp: number
    activeHosts: number
  }
  visitReports: VisitReport[]
  deliveryReports: DeliveryReport[]
  hostReports: HostReport[]
}

export const getReports = async (params: DateRangeParams): Promise<ReportsData> => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  })

  const response = await api.get<ReportsData>(
    `/admin/api/reports?${queryString.toString()}`
  )
  return response
}

export const getVisitReports = async (params: DateRangeParams) => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  })

  const response = await api.get<VisitReport[]>(
    `/admin/api/reports/visits?${queryString.toString()}`
  )
  return response
}

export const getDeliveryReports = async (params: DateRangeParams) => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  })

  const response = await api.get<DeliveryReport[]>(
    `/admin/api/reports/deliveries?${queryString.toString()}`
  )
  return response
}

export const getHostReports = async (params: DateRangeParams) => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  })

  const response = await api.get<HostReport[]>(
    `/admin/api/reports/hosts?${queryString.toString()}`
  )
  return response
}

export const exportVisitReport = async (params: DateRangeParams, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format,
  })

  const token = localStorage.getItem('auth_token')
  const response = await fetch(`/admin/api/reports/visits/export?${queryString.toString()}`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error('Failed to export report')
  }

  return response.blob()
}

export const exportDeliveryReport = async (params: DateRangeParams, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
  const queryString = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    format,
  })

  const token = localStorage.getItem('auth_token')
  const response = await fetch(`/admin/api/reports/deliveries/export?${queryString.toString()}`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    throw new Error('Failed to export report')
  }

  return response.blob()
}

export const downloadReport = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
