import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { CurrentVisitor } from '@/services/dashboard'
import * as dashboardService from '@/services/dashboard'
import { formatDate, formatRelativeTime } from '@/utils'
import { QrModal } from './QrModal'

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
  const [selectedVisitor, setSelectedVisitor] = useState<CurrentVisitor | null>(null)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

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

  const handleOpenQrModal = (visitor: CurrentVisitor) => {
    setSelectedVisitor(visitor)
    setIsQrModalOpen(true)
  }

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false)
    setSelectedVisitor(null)
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
    <>
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
                  <div className="ml-4 flex-shrink-0 flex gap-1.5">
                    <button
                      onClick={() => handleOpenQrModal(visitor)}
                      className="inline-flex items-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                      title="QR Code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    </button>
                    <button
                      onClick={() => handleCheckout(visitor.sessionId)}
                      disabled={checkoutSessionId === visitor.sessionId}
                      className="inline-flex items-center p-2 rounded-lg text-orange-600 hover:bg-orange-50 disabled:text-gray-400 transition"
                      title="Checkout"
                    >
                      {checkoutSessionId === visitor.sessionId ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QrModal
        visitor={selectedVisitor}
        isOpen={isQrModalOpen}
        onClose={handleCloseQrModal}
      />
    </>
  )
}

export default CurrentVisitorsList
