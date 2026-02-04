import { useEffect } from 'react'
import type { Visit } from '@/types'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  visitor?: Visit
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function DeleteConfirmationDialog({
  isOpen,
  visitor,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteConfirmationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen || !visitor) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel}></div>

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
          {/* Icon */}
          <div className="flex justify-center py-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center px-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Visitor Record</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <span className="font-medium">{visitor.visitorName}</span>
              's record?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
