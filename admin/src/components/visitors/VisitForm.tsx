import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Visit, VisitFormData, Host } from '@/types'
import { getPurposeLookups, type LookupItem } from '@/services/lookups'

const visitSchema = z.object({
  visitorName: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitorEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  visitorPhone: z.string().optional(),
  hostId: z.string().min(1, 'Please select a host'),
  visitDate: z.string().min(1, 'Visit date is required'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

interface VisitFormProps {
  onSubmit: (data: VisitFormData) => Promise<void>
  initialData?: Visit
  hosts: Host[]
  isLoading?: boolean
  isLoadingHosts?: boolean
}

export default function VisitForm({
  onSubmit,
  initialData,
  hosts,
  isLoading,
  isLoadingHosts,
}: VisitFormProps) {
  const [purposes, setPurposes] = useState<LookupItem[]>([])
  const [isLoadingPurposes, setIsLoadingPurposes] = useState(false)

  useEffect(() => {
    setIsLoadingPurposes(true)
    getPurposeLookups()
      .then(setPurposes)
      .catch(() => setPurposes([]))
      .finally(() => setIsLoadingPurposes(false))
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialData || {
      visitorName: '',
      visitorEmail: '',
      visitorPhone: '',
      hostId: '',
      visitDate: '',
      purpose: '',
      notes: '',
    },
  })

  const handleFormSubmit = async (data: VisitFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Visitor Name */}
      <div>
        <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700 mb-1">
          Visitor Name *
        </label>
        <input
          {...register('visitorName')}
          type="text"
          id="visitorName"
          placeholder="Enter visitor name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorName && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorName.message}</p>
        )}
      </div>

      {/* Visitor Email */}
      <div>
        <label htmlFor="visitorEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          {...register('visitorEmail')}
          type="email"
          id="visitorEmail"
          placeholder="Enter email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorEmail.message}</p>
        )}
      </div>

      {/* Visitor Phone */}
      <div>
        <label htmlFor="visitorPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register('visitorPhone')}
          type="tel"
          id="visitorPhone"
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorPhone && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorPhone.message}</p>
        )}
      </div>

      {/* Host Selection */}
      <div>
        <label htmlFor="hostId" className="block text-sm font-medium text-gray-700 mb-1">
          Host *
        </label>
        <select
          {...register('hostId')}
          id="hostId"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isLoadingHosts}
        >
          <option value="">
            {isLoadingHosts ? 'Loading hosts...' : 'Select a host'}
          </option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.type === 'STAFF' ? '[Staff] ' : ''}{host.name} ({host.email})
            </option>
          ))}
        </select>
        {errors.hostId && <p className="text-sm text-red-600 mt-1">{errors.hostId.message}</p>}
      </div>

      {/* Visit Date */}
      <div>
        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
          Visit Date *
        </label>
        <input
          {...register('visitDate')}
          type="datetime-local"
          id="visitDate"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitDate && (
          <p className="text-sm text-red-600 mt-1">{errors.visitDate.message}</p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Visit
        </label>
        <select
          {...register('purpose')}
          id="purpose"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isLoadingPurposes}
        >
          <option value="">
            {isLoadingPurposes ? 'Loading purposes...' : 'Select purpose of visit'}
          </option>
          {purposes.map((purpose) => (
            <option key={purpose.id} value={purpose.label}>
              {purpose.label}
            </option>
          ))}
        </select>
        {errors.purpose && <p className="text-sm text-red-600 mt-1">{errors.purpose.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          placeholder="Any additional notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        ></textarea>
        {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Visit' : 'Create Visit'}
      </button>
    </form>
  )
}
