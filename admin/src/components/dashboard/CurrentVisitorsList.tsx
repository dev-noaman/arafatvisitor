import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { CurrentVisitor } from '@/services/dashboard'
import * as dashboardService from '@/services/dashboard'
import { formatDate, formatRelativeTime } from '@/utils'

interface CurrentVisitorsListProps {
  visitors: CurrentVisitor[]
  isLoading?: boolean
  onCheckoutAction?: () => void
}

export function CurrentVisitorsList({
  visitors,
  isLoading = false,
  onCheckoutAction,
}: CurrentVisitorsListProps) {
  const { success: showSuccess, error: showError } = useToast()
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null)

  const handleCheckout = async (sessionId: string) => {
    setCheckoutSessionId(sessionId)
    try {
      await dashboardService.checkoutVisitor(sessionId)
      showSuccess('Visitor checked out successfully')
      onCheckoutAction?.()
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to checkout visitor')
    } finally {
      setCheckoutSessionId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Current Visitors</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Current Visitors</h3>
      </div>

      {visitors.length === 0 ? (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="mt-4 text-gray-600">No visitors currently checked in</p>
        </div>
      ) : (
        <div className="divide-y">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{visitor.visitorName}</p>
                    {visitor.visitorCompany && (
                      <span className="text-sm text-gray-600">
                        ({visitor.visitorCompany})
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Checked In
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Visiting: <span className="font-medium">{visitor.hostName}</span> at{' '}
                    <span className="font-medium">{visitor.hostCompany}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Purpose: {visitor.purpose}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {visitor.visitorPhone}
                    {visitor.visitorEmail && ` • Email: ${visitor.visitorEmail}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Checked in: {formatRelativeTime(visitor.checkInAt)} (
                    {formatDate(visitor.checkInAt, 'HH:mm')})
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex gap-2">
                  {visitor.qrDataUrl && (
                    <button
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      title="View QR Code"
                    >
                      QR
                    </button>
                  )}
                  <button
                    onClick={() => handleCheckout(visitor.sessionId)}
                    disabled={checkoutSessionId === visitor.sessionId}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    {checkoutSessionId === visitor.sessionId
                      ? 'Processing...'
                      : 'Checkout'}
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

export default CurrentVisitorsList
