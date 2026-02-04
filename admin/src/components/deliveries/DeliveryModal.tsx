import { useEffect } from 'react'
import DeliveryForm from './DeliveryForm'
import type { Delivery, DeliveryFormData } from '@/types'

interface DeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DeliveryFormData) => Promise<void>
  deliveryData?: Delivery
  isLoading?: boolean
}

export default function DeliveryModal({
  isOpen,
  onClose,
  onSubmit,
  deliveryData,
  isLoading,
}: DeliveryModalProps) {
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {deliveryData ? 'Edit Delivery' : 'Record New Delivery'}
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
            <DeliveryForm
              onSubmit={onSubmit}
              initialData={deliveryData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  )
}
