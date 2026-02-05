import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Settings } from '@/types'
import { WhatsAppSettingsFormData } from '@/services/settings'

const whatsappSchema = z.object({
  whatsappApiKey: z.string().optional(),
  whatsappPhoneNumber: z.string().optional(),
})

interface WhatsAppSettingsFormProps {
  initialData?: Settings
  onSubmit: (data: WhatsAppSettingsFormData) => Promise<void>
  onTest?: () => void
  isLoading?: boolean
  isTesting?: boolean
}

export default function WhatsAppSettingsForm({
  initialData,
  onSubmit,
  onTest,
  isLoading,
  isTesting,
}: WhatsAppSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhatsAppSettingsFormData>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      whatsappApiKey: initialData?.whatsappApiKey || '',
      whatsappPhoneNumber: initialData?.whatsappPhoneNumber || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* API Key */}
      <div>
        <label htmlFor="whatsappApiKey" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp API Key
        </label>
        <input
          {...register('whatsappApiKey')}
          type="password"
          id="whatsappApiKey"
          placeholder="Enter your WhatsApp API key"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Get your API key from your WhatsApp Business provider (e.g., wbiztool)
        </p>
        {errors.whatsappApiKey && (
          <p className="text-sm text-red-600 mt-1">{errors.whatsappApiKey.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="whatsappPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Phone Number
        </label>
        <input
          {...register('whatsappPhoneNumber')}
          type="tel"
          id="whatsappPhoneNumber"
          placeholder="+974 50707317"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Include country code (e.g., +974 for Qatar)
        </p>
        {errors.whatsappPhoneNumber && (
          <p className="text-sm text-red-600 mt-1">{errors.whatsappPhoneNumber.message}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium">WhatsApp Integration</p>
            <p className="mt-1">
              Messages will be sent via your configured WhatsApp Business account. Ensure the API key is valid and the phone number is registered.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || isTesting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
        {onTest && (
          <button
            type="button"
            onClick={onTest}
            disabled={isLoading || isTesting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isTesting ? 'Testing...' : 'Test WhatsApp'}
          </button>
        )}
      </div>
    </form>
  )
}
