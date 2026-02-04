import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordChangeFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>
  isLoading?: boolean
}

export default function PasswordChangeForm({ onSubmit, isLoading }: PasswordChangeFormProps) {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleFormSubmit = async (data: ChangePasswordData) => {
    await onSubmit(data)
    reset()
  }

  const renderPasswordField = (
    fieldName: 'oldPassword' | 'newPassword' | 'confirmPassword',
    label: string,
    show: boolean,
    setShow: (value: boolean) => void
  ) => (
    <div>
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2">
        {label} *
      </label>
      <div className="relative">
        <input
          {...register(fieldName)}
          type={show ? 'text' : 'password'}
          id={fieldName}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition"
          tabIndex={-1}
        >
          {show ? (
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
      {errors[fieldName] && <p className="text-sm text-red-600 mt-1">{errors[fieldName]?.message}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Security Note:</span> Passwords must be at least 8 characters long. New and
          confirm password fields must match.
        </p>
      </div>

      {/* Current Password */}
      {renderPasswordField('oldPassword', 'Current Password', showOldPassword, setShowOldPassword)}

      {/* New Password */}
      {renderPasswordField('newPassword', 'New Password', showNewPassword, setShowNewPassword)}

      {/* Confirm Password */}
      {renderPasswordField('confirmPassword', 'Confirm New Password', showConfirmPassword, setShowConfirmPassword)}

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </form>
  )
}
