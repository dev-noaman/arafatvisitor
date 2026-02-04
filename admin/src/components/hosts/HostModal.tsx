import { useEffect } from 'react'
import HostForm from './HostForm'
import type { Host, HostFormData } from '@/types'

interface HostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: HostFormData) => Promise<void>
  hostData?: Host
  isLoading?: boolean
}

export default function HostModal({
  isOpen,
  onClose,
  onSubmit,
  hostData,
  isLoading,
}: HostModalProps) {
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {hostData ? 'Edit Host' : 'Create New Host'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <HostForm onSubmit={onSubmit} initialData={hostData} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  )
}
