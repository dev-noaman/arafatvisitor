import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Settings } from '@/types'
import { SmtpSettingsFormData } from '@/services/settings'

const smtpSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFrom: z.string().email('Invalid email address').optional().or(z.literal('')),
})

interface SmtpSettingsFormProps {
  initialData?: Settings
  onSubmit: (data: SmtpSettingsFormData) => Promise<void>
  onTest?: () => void
  isLoading?: boolean
  isTesting?: boolean
}

export default function SmtpSettingsForm({
  initialData,
  onSubmit,
  onTest,
  isLoading,
  isTesting,
}: SmtpSettingsFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SmtpSettingsFormData>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      smtpHost: initialData?.smtpHost || '',
      smtpPort: initialData?.smtpPort || 587,
      smtpSecure: initialData?.smtpSecure || false,
      smtpUser: initialData?.smtpUser || '',
      smtpPassword: '',
      smtpFrom: initialData?.smtpFrom || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* SMTP Host */}
        <div>
          <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Host
          </label>
          <input
            {...register('smtpHost')}
            type="text"
            id="smtpHost"
            placeholder="smtp.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.smtpHost && (
            <p className="text-sm text-red-600 mt-1">{errors.smtpHost.message}</p>
          )}
        </div>

        {/* SMTP Port */}
        <div>
          <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <input
            {...register('smtpPort')}
            type="number"
            id="smtpPort"
            placeholder="587"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.smtpPort && (
            <p className="text-sm text-red-600 mt-1">{errors.smtpPort.message}</p>
          )}
        </div>
      </div>

      {/* SMTP User */}
      <div>
        <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-1">
          SMTP Username
        </label>
        <input
          {...register('smtpUser')}
          type="text"
          id="smtpUser"
          placeholder="your-email@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.smtpUser && (
          <p className="text-sm text-red-600 mt-1">{errors.smtpUser.message}</p>
        )}
      </div>

      {/* SMTP Password */}
      <div>
        <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
          SMTP Password
        </label>
        <div className="relative">
          <input
            {...register('smtpPassword')}
            type={showPassword ? 'text' : 'password'}
            id="smtpPassword"
            placeholder="Leave blank to keep existing"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803c1.079-1.35 2.587-2.417 4.236-2.957"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.879 7.519c1.171-1.025 2.56-1.52 4.121-1.52 3.773 0 6.867 3.06 6.867 6.84 0 1.329-.196 2.605-.57 3.824m2.568-9.64A9 9 0 0121 12a9 9 0 01-9 9m0 0a9 9 0 01-9-9 9 9 0 019-9"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.smtpPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.smtpPassword.message}</p>
        )}
      </div>

      {/* From Email */}
      <div>
        <label htmlFor="smtpFrom" className="block text-sm font-medium text-gray-700 mb-1">
          From Email Address
        </label>
        <input
          {...register('smtpFrom')}
          type="email"
          id="smtpFrom"
          placeholder="noreply@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.smtpFrom && (
          <p className="text-sm text-red-600 mt-1">{errors.smtpFrom.message}</p>
        )}
      </div>

      {/* Secure Connection */}
      <div className="flex items-center">
        <input
          {...register('smtpSecure')}
          type="checkbox"
          id="smtpSecure"
          className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded border-gray-300"
          disabled={isLoading}
        />
        <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-700">
          Use TLS/SSL (Secure Connection)
        </label>
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
            {isTesting ? 'Testing...' : 'Test Email'}
          </button>
        )}
      </div>
    </form>
  )
}
