import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Host, HostFormData } from '@/types'

const hostSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  location: z.enum(['BARWA_TOWERS', 'MARINA_50', 'ELEMENT_MARIOTT']).optional(),
})

interface HostFormProps {
  onSubmit: (data: HostFormData) => Promise<void>
  initialData?: Host
  isLoading?: boolean
}

export default function HostForm({ onSubmit, initialData, isLoading }: HostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HostFormData>({
    resolver: zodResolver(hostSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      company: '',
      location: undefined,
    },
  })

  const handleFormSubmit = async (data: HostFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Host Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          placeholder="Enter host name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      {/* Company Field */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company *
        </label>
        <input
          {...register('company')}
          type="text"
          id="company"
          placeholder="Enter company name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.company && <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="Enter email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
      </div>

      {/* Location Field */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <select
          {...register('location')}
          id="location"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Select location</option>
          <option value="BARWA_TOWERS">Barwa Towers</option>
          <option value="MARINA_50">Marina 50</option>
          <option value="ELEMENT_MARIOTT">Element Mariott</option>
        </select>
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Host' : 'Create Host'}
      </button>
    </form>
  )
}
