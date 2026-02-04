import React, { useState } from 'react'

interface BulkApproveModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading?: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function BulkApproveModal({
  isOpen,
  selectedCount,
  isLoading = false,
  onConfirm,
  onCancel,
}: BulkApproveModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
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
          Confirm Bulk Approval
        </h3>

        <p className="text-gray-600 mb-6">
          You are about to approve <span className="font-semibold">{selectedCount}</span> visitor
          {selectedCount !== 1 ? 's' : ''}. This action cannot be undone.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm text-blue-800">
            Each visitor will transition to APPROVED status and will be ready for check-in.
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isProcessing ? 'Approving...' : 'Approve All'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkApproveModal
