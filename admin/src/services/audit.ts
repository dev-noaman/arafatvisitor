import { api } from './api'

export interface AuditLogEntry {
  id: string
  userId: string
  userName?: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  changes?: Record<string, { from: any; to: any }>
  details?: string
  ipAddress?: string
  timestamp: string
  createdAt: string
}

export interface ActivityLogFilter {
  page?: number
  limit?: number
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  userId?: string
}

/**
 * Get activity log with optional filters
 */
export const getActivityLog = async (filters?: ActivityLogFilter): Promise<any> => {
  try {
    const queryString = new URLSearchParams()
    if (filters?.page) queryString.append('page', filters.page.toString())
    if (filters?.limit) queryString.append('limit', filters.limit.toString())
    if (filters?.action) queryString.append('action', filters.action)
    if (filters?.entityType) queryString.append('entityType', filters.entityType)
    if (filters?.startDate) queryString.append('startDate', filters.startDate)
    if (filters?.endDate) queryString.append('endDate', filters.endDate)
    if (filters?.userId) queryString.append('userId', filters.userId)

    const query = queryString.toString()
    const url = `/admin/api/audit/activity${query ? `?${query}` : ''}`
    const response = await api.get<AuditLogEntry[]>(url)
    return response
  } catch (error) {
    throw new Error(`Failed to fetch activity log: ${(error as any).message}`)
  }
}

/**
 * Get audit trail for specific entity
 */
export const getAuditTrail = async (
  entityType: string,
  entityId: string,
  limit = 50
): Promise<AuditLogEntry[]> => {
  try {
    const response = await api.get<AuditLogEntry[]>(
      `/admin/api/audit/trail/${entityType}/${entityId}?limit=${limit}`
    )
    return response.data || []
  } catch (error) {
    throw new Error(`Failed to fetch audit trail: ${(error as any).message}`)
  }
}

/**
 * Get recent activities for dashboard
 */
export const getRecentActivities = async (limit = 10): Promise<AuditLogEntry[]> => {
  try {
    const response = await api.get<AuditLogEntry[]>(
      `/admin/api/audit/activity/recent?limit=${limit}`
    )
    return response.data || []
  } catch (error) {
    throw new Error(`Failed to fetch recent activities: ${(error as any).message}`)
  }
}

/**
 * Get activity statistics
 */
export const getActivityStats = async (
  days = 7
): Promise<{
  totalActions: number
  actionsByType: Record<string, number>
  actionsByEntity: Record<string, number>
}> => {
  try {
    const response = await api.get<any>(`/admin/api/audit/stats?days=${days}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch activity stats: ${(error as any).message}`)
  }
}

/**
 * Log activity (client-side tracking)
 */
export const logActivity = async (
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
): Promise<void> => {
  try {
    await api.post('/admin/api/audit/log', {
      action,
      entityType,
      entityId,
      details,
    })
  } catch (error) {
    console.warn('Failed to log activity:', error)
    // Don't throw - activity logging failures shouldn't affect user experience
  }
}

/**
 * Format audit log entry for display
 */
export const formatAuditEntry = (entry: AuditLogEntry): string => {
  const timestamp = new Date(entry.createdAt).toLocaleString()
  return `${entry.userName || 'Unknown'} ${entry.action} ${entry.entityType}${
    entry.entityName ? `: ${entry.entityName}` : ''
  } at ${timestamp}`
}

/**
 * Get action color for UI
 */
export const getActionColor = (
  action: string
): 'bg-blue-100 text-blue-800' | 'bg-green-100 text-green-800' | 'bg-red-100 text-red-800' | 'bg-yellow-100 text-yellow-800' | 'bg-gray-100 text-gray-800' => {
  const colorMap: Record<
    string,
    'bg-blue-100 text-blue-800' | 'bg-green-100 text-green-800' | 'bg-red-100 text-red-800' | 'bg-yellow-100 text-yellow-800' | 'bg-gray-100 text-gray-800'
  > = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    APPROVE: 'bg-green-100 text-green-800',
    REJECT: 'bg-red-100 text-red-800',
    CHECKOUT: 'bg-blue-100 text-blue-800',
    LOGIN: 'bg-yellow-100 text-yellow-800',
    EXPORT: 'bg-yellow-100 text-yellow-800',
    IMPORT: 'bg-yellow-100 text-yellow-800',
  }

  return colorMap[action] || 'bg-gray-100 text-gray-800'
}
