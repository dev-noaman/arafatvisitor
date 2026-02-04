import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { PendingApproval } from '@/services/dashboard'
import * as dashboardService from '@/services/dashboard'
import { formatDate } from '@/utils'

interface PendingApprovalsListProps {
  approvals: PendingApproval[]
  isLoading?: boolean
  onApprovalAction?: () => void
}

export function PendingApprovalsList({
  approvals,
  isLoading = false,
  onApprovalAction,
}: PendingApprovalsListProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleApprove = async (visitId: string) => {
    setActioningId(visitId)
    try {
      await dashboardService.approveVisit(visitId)
      showSuccess('Visit approved successfully')
      onApprovalAction?.()
    } catch (error: any) {
      showError(error.message || 'Failed to approve visit')
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (visitId: string) => {
    setActioningId(visitId)
    try {
      await dashboardService.rejectVisit(visitId)
      showSuccess('Visit rejected successfully')
      onApprovalAction?.()
    } catch (error: any) {
      showError(error.message || 'Failed to reject visit')
    } finally {
      setActioningId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
      </div>

      {approvals.length === 0 ? (
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-gray-600">No pending approvals</p>
        </div>
      ) : (
        <div className="divide-y">
          {approvals.map((approval) => (
            <div key={approval.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{approval.visitorName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    For: <span className="font-medium">{approval.hostName}</span> at{' '}
                    <span className="font-medium">{approval.hostCompany}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Phone: {approval.visitorPhone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Expected: {formatDate(approval.expectedDate, 'MMM DD, YYYY HH:mm')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    disabled={actioningId === approval.id}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {actioningId === approval.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    disabled={actioningId === approval.id}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    {actioningId === approval.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PendingApprovalsList
