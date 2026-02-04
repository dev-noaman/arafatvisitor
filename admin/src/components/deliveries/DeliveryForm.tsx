import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Delivery, DeliveryFormData } from '@/types'

const deliverySchema = z.object({
  recipientName: z.string().min(2, 'Recipient name must be at least 2 characters'),
  recipientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  recipientPhone: z.string().optional(),
  deliveryCompany: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => Promise<void>
  initialData?: Delivery
  isLoading?: boolean
}

export default function DeliveryForm({ onSubmit, initialData, isLoading }: DeliveryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: initialData || {
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      deliveryCompany: '',
      description: '',
      notes: '',
    },
  })

  const handleFormSubmit = async (data: DeliveryFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Recipient Name */}
      <div>
        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Name *
        </label>
        <input
          {...register('recipientName')}
          type="text"
          id="recipientName"
          placeholder="Enter recipient name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.recipientName && (
          <p className="text-sm text-red-600 mt-1">{errors.recipientName.message}</p>
        )}
      </div>

      {/* Recipient Email */}
      <div>
        <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          {...register('recipientEmail')}
          type="email"
          id="recipientEmail"
          placeholder="Enter email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.recipientEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.recipientEmail.message}</p>
        )}
      </div>

      {/* Recipient Phone */}
      <div>
        <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register('recipientPhone')}
          type="tel"
          id="recipientPhone"
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.recipientPhone && (
          <p className="text-sm text-red-600 mt-1">{errors.recipientPhone.message}</p>
        )}
      </div>

      {/* Delivery Company */}
      <div>
        <label htmlFor="deliveryCompany" className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Company
        </label>
        <input
          {...register('deliveryCompany')}
          type="text"
          id="deliveryCompany"
          placeholder="E.g., DHL, FedEx, Aramex, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.deliveryCompany && (
          <p className="text-sm text-red-600 mt-1">{errors.deliveryCompany.message}</p>
        )}
      </div>

      {/* Description/Package Contents */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Package Description
        </label>
        <input
          {...register('description')}
          type="text"
          id="description"
          placeholder="E.g., Office supplies, Electronics, Documents, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          placeholder="Any additional notes about the delivery"
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
        {isLoading ? 'Saving...' : initialData ? 'Update Delivery' : 'Record Delivery'}
      </button>
    </form>
  )
}
