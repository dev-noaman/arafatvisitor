import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import type { TicketFormData, TicketType } from '@/types'
import { useAuth } from '@/hooks/useAuth'

const ticketSchema = z.object({
  type: z.enum(['SUGGESTION', 'COMPLAINT']),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

interface TicketFormProps {
  onSubmit: (data: TicketFormData, files: File[]) => Promise<void>
  isLoading?: boolean
}

export default function TicketForm({ onSubmit, isLoading }: TicketFormProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [files, setFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      type: undefined as unknown as TicketType,
      subject: '',
      description: '',
    },
  })

  const selectedType = watch('type')

  const handleTypeSelect = (type: TicketType) => {
    setValue('type', type)
    setStep('form')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return

    const newFiles = Array.from(selected)
    const validFiles: File[] = []

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`)
        continue
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        alert(`${file.name} is not a supported file type (JPEG, PNG, PDF only)`)
        continue
      }
      validFiles.push(file)
    }

    const combined = [...files, ...validFiles].slice(0, 3)
    setFiles(combined)
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: TicketFormData) => {
    await onSubmit(data, files)
    reset()
    setFiles([])
    setStep('type')
  }

  if (step === 'type') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">What type of ticket would you like to create?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeSelect('SUGGESTION')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Suggestion</div>
            <p className="text-xs text-gray-500 mt-1">Share an idea or feedback</p>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSelect('COMPLAINT')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Complaint</div>
            <p className="text-xs text-gray-500 mt-1">Report an issue that needs resolution</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => { setStep('type'); reset() }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Change type
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${selectedType === 'SUGGESTION' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
          {selectedType === 'SUGGESTION' ? 'Suggestion' : 'Complaint'}
        </span>
      </div>

      {/* Auto-fetched host context - tickets are visitor system related */}
      {(user?.role === 'HOST' || user?.role === 'STAFF') && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-sm">
          <p className="font-medium text-gray-900">Visitor system complaint</p>
          <p className="text-xs text-gray-500 mt-0.5">Your ticket will be automatically linked to your host/company</p>
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
        <input
          {...register('subject')}
          type="text"
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="Brief summary of your ticket"
        />
        {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          {...register('description')}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="Provide detailed information..."
        />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      {/* Attachments - available for both types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attachments ({files.length}/3)
        </label>
        {files.length < 3 && (
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,application/pdf"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        )}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded text-sm">
                <span className="truncate">{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 ml-2">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Max 3 files, 5MB each. JPEG, PNG, or PDF.</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
    </form>
  )
}
