import { get, post } from './api'
import { Visit, Delivery } from '@/types'

/**
 * Dashboard KPI metrics
 */
export interface DashboardKpis {
  totalHosts: number
  visitsToday: number
  deliveriesToday: number
}

/**
 * Pending approval item
 */
export interface PendingApproval {
  id: string
  visitorName: string
  visitorPhone: string
  hostName: string
  hostCompany: string
  expectedDate: string
}

/**
 * Received delivery item
 */
export interface ReceivedDelivery {
  id: string
  courier: string
  recipient: string
  hostName: string
  hostCompany: string
  receivedAt: string
}

/**
 * Current visitor item
 */
export interface CurrentVisitor {
  id: string
  sessionId: string
  visitorName: string
  visitorCompany?: string
  visitorPhone: string
  visitorEmail?: string
  hostName: string
  hostCompany: string
  purpose: string
  checkInAt: string
  qrToken?: string
  qrDataUrl?: string
}

/**
 * Chart data
 */
export interface ChartData {
  visitsPerDay: Array<{ date: string; count: number }>
  statusDistribution: Array<{ status: string; count: number }>
  deliveriesPerDay: Array<{ date: string; count: number }>
}

/**
 * Get dashboard KPI metrics
 */
export async function getKpis(): Promise<DashboardKpis> {
  const response = await get<DashboardKpis>('/admin/api/dashboard/kpis')
  return (response as any).data || response
}

/**
 * Get pending approvals
 */
export async function getPendingApprovals(): Promise<PendingApproval[]> {
  const response = await get<PendingApproval[]>('/admin/api/dashboard/pending-approvals')
  return (response as any).data || response
}

/**
 * Get received deliveries
 */
export async function getReceivedDeliveries(): Promise<ReceivedDelivery[]> {
  const response = await get<ReceivedDelivery[]>('/admin/api/dashboard/received-deliveries')
  return (response as any).data || response
}

/**
 * Get current visitors
 */
export async function getCurrentVisitors(): Promise<CurrentVisitor[]> {
  const response = await get<CurrentVisitor[]>('/admin/api/dashboard/current-visitors')
  return (response as any).data || response
}

/**
 * Get chart data
 */
export async function getChartData(): Promise<ChartData> {
  const response = await get<ChartData>('/admin/api/dashboard/charts')
  return (response as any).data || response
}

/**
 * Approve a visit
 */
export async function approveVisit(visitId: string): Promise<{ success: boolean; message: string }> {
  const response = await post(`/admin/api/dashboard/approve/${visitId}`, {})
  return (response as any).data || response
}

/**
 * Reject a visit
 */
export async function rejectVisit(visitId: string): Promise<{ success: boolean; message: string }> {
  const response = await post(`/admin/api/dashboard/reject/${visitId}`, {})
  return (response as any).data || response
}

/**
 * Checkout a visitor
 */
export async function checkoutVisitor(sessionId: string): Promise<{ success: boolean; message: string }> {
  const response = await post(`/admin/api/dashboard/checkout/${sessionId}`, {})
  return (response as any).data || response
}

/**
 * Get QR code for a visit
 */
export async function getQrCode(visitId: string): Promise<{ qrDataUrl: string; token: string }> {
  const response = await get(`/admin/api/qr/${visitId}`)
  return (response as any).data || response
}

/**
 * Send QR code via email or WhatsApp
 */
export async function sendQr(
  visitId: string,
  method: 'email' | 'whatsapp'
): Promise<{ success: boolean; message: string }> {
  const response = await post('/admin/api/send-qr', { visitId, method })
  return (response as any).data || response
}
