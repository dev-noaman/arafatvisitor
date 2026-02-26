import { useEffect } from 'react'
import TicketForm from './TicketForm'
import type { TicketFormData } from '@/types'

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TicketFormData, files: File[]) => Promise<void>
  isLoading?: boolean
}

export default function TicketModal({ isOpen, onClose, onSubmit, isLoading }: TicketModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">New Ticket</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <TicketForm onSubmit={onSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  )
}
