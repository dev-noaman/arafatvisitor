import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
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
  const { user } = useAuth()
  const canApproveReject = user?.role !== 'RECEPTION'
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
                {canApproveReject && (
                  <div className="flex gap-1 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={actioningId === approval.id}
                      className="inline-flex items-center p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:text-gray-400 transition"
                      title="Approve"
                    >
                      {actioningId === approval.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      disabled={actioningId === approval.id}
                      className="inline-flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:text-gray-400 transition"
                      title="Reject"
                    >
                      {actioningId === approval.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PendingApprovalsList
