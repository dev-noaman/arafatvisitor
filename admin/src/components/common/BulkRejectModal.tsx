import { useState } from 'react'

interface BulkRejectModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading?: boolean
  onConfirm: (reason?: string) => Promise<void>
  onCancel: () => void
}

export function BulkRejectModal({
  isOpen,
  selectedCount,
  isLoading = false,
  onConfirm,
  onCancel,
}: BulkRejectModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [reason, setReason] = useState('')

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm(reason || undefined)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Confirm Bulk Rejection
        </h3>

        <p className="text-gray-600 mb-4">
          You are about to reject <span className="font-semibold">{selectedCount}</span> visitor
          {selectedCount !== 1 ? 's' : ''}. This action cannot be undone.
        </p>

        {/* Reason field */}
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason (optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            disabled={isProcessing || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 resize-none"
            rows={3}
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-sm text-red-800">
            Each visitor will transition to REJECTED status and can be re-approved if needed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isProcessing ? 'Rejecting...' : 'Reject All'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkRejectModal
