import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PreRegistration, PreRegistrationFormData, Host } from '@/types'

const preRegistrationSchema = z.object({
  visitorName: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitorEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  visitorPhone: z.string().optional(),
  hostId: z.string().min(1, 'Please select a host'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

interface PreRegistrationFormProps {
  onSubmit: (data: PreRegistrationFormData) => Promise<void>
  initialData?: PreRegistration
  hosts: Host[]
  isLoading?: boolean
  isLoadingHosts?: boolean
}

export default function PreRegistrationForm({
  onSubmit,
  initialData,
  hosts,
  isLoading,
  isLoadingHosts,
}: PreRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PreRegistrationFormData>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: initialData || {
      visitorName: '',
      visitorEmail: '',
      visitorPhone: '',
      hostId: '',
      scheduledDate: '',
      purpose: '',
      notes: '',
    },
  })

  const handleFormSubmit = async (data: PreRegistrationFormData) => {
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
              {host.name} ({host.email})
            </option>
          ))}
        </select>
        {errors.hostId && <p className="text-sm text-red-600 mt-1">{errors.hostId.message}</p>}
      </div>

      {/* Scheduled Date */}
      <div>
        <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
          Scheduled Date *
        </label>
        <input
          {...register('scheduledDate')}
          type="datetime-local"
          id="scheduledDate"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.scheduledDate && (
          <p className="text-sm text-red-600 mt-1">{errors.scheduledDate.message}</p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Visit
        </label>
        <input
          {...register('purpose')}
          type="text"
          id="purpose"
          placeholder="E.g., Business Meeting, Training, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
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
        {isLoading ? 'Saving...' : initialData ? 'Update Registration' : 'Create Registration'}
      </button>
    </form>
  )
}
