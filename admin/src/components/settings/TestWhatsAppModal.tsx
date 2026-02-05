import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const testWhatsAppSchema = z.object({
  recipientPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

interface TestWhatsAppData {
  recipientPhone: string
}

interface TestWhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TestWhatsAppData) => Promise<void>
  isLoading?: boolean
}

export default function TestWhatsAppModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: TestWhatsAppModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TestWhatsAppData>({
    resolver: zodResolver(testWhatsAppSchema),
    defaultValues: {
      recipientPhone: '',
    },
  })

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

  const handleFormSubmit = async (data: TestWhatsAppData) => {
    await onSubmit(data)
    reset()
  }

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
            <h2 className="text-xl font-semibold text-gray-900">Test WhatsApp Settings</h2>
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
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="recipientPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Phone Number
              </label>
              <input
                {...register('recipientPhone')}
                type="tel"
                id="recipientPhone"
                placeholder="+974 50707317"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +974)
              </p>
              {errors.recipientPhone && (
                <p className="text-sm text-red-600 mt-1">{errors.recipientPhone.message}</p>
              )}
            </div>

            <p className="text-sm text-gray-600">
              A test message will be sent via WhatsApp to verify your settings are working correctly.
            </p>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isLoading ? 'Sending...' : 'Send Test Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
