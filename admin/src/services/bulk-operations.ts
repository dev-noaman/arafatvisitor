import { api } from './api'

/**
 * Bulk approve visitors
 */
export const bulkApproveVisitors = async (visitorIds: string[]): Promise<void> => {
  if (!visitorIds || visitorIds.length === 0) {
    throw new Error('No visitors selected')
  }

  try {
    await api.post<{ success: boolean; message: string }>('/admin/api/visitors/bulk/approve', {
      visitIds: visitorIds,
    })
  } catch (error) {
    throw new Error(`Failed to approve visitors: ${(error as any).message}`)
  }
}

/**
 * Bulk reject visitors
 */
export const bulkRejectVisitors = async (
  visitorIds: string[],
  reason?: string
): Promise<void> => {
  if (!visitorIds || visitorIds.length === 0) {
    throw new Error('No visitors selected')
  }

  try {
    await api.post<{ success: boolean; message: string }>('/admin/api/visitors/bulk/reject', {
      visitIds: visitorIds,
      reason,
    })
  } catch (error) {
    throw new Error(`Failed to reject visitors: ${(error as any).message}`)
  }
}

/**
 * Bulk delete hosts
 */
export const bulkDeleteHosts = async (hostIds: string[]): Promise<void> => {
  if (!hostIds || hostIds.length === 0) {
    throw new Error('No hosts selected')
  }

  try {
    await api.post<{ success: boolean; message: string }>('/admin/api/hosts/bulk/delete', {
      hostIds,
    })
  } catch (error) {
    throw new Error(`Failed to delete hosts: ${(error as any).message}`)
  }
}

/**
 * Bulk checkout visitors
 */
export const bulkCheckoutVisitors = async (visitorIds: string[]): Promise<void> => {
  if (!visitorIds || visitorIds.length === 0) {
    throw new Error('No visitors selected')
  }

  try {
    await api.post<{ success: boolean; message: string }>('/admin/api/visitors/bulk/checkout', {
      visitIds: visitorIds,
    })
  } catch (error) {
    throw new Error(`Failed to checkout visitors: ${(error as any).message}`)
  }
}

/**
 * Get bulk operation status
 */
export const getBulkOperationStatus = async (operationId: string): Promise<any> => {
  try {
    const response = await api.get<any>(`/admin/api/bulk-operations/${operationId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to get operation status: ${(error as any).message}`)
  }
}

/**
 * Cancel bulk operation
 */
export const cancelBulkOperation = async (operationId: string): Promise<void> => {
  try {
    await api.post<{ success: boolean; message: string }>(
      `/admin/api/bulk-operations/${operationId}/cancel`,
      {}
    )
  } catch (error) {
    throw new Error(`Failed to cancel operation: ${(error as any).message}`)
  }
}
