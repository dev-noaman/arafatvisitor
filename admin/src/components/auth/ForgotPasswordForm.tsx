import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/useToast'
import * as authService from '@/services/auth'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const { success: showSuccess, error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSubmitted(true)
      showSuccess('Password reset link sent to your email')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send reset link. Please try again.'
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 py-12">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>
          <a
            href="/admin/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 py-12">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Your Password?</h1>
          <p className="text-gray-600 text-sm">
            Enter the email address linked to your account, and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="Enter your Email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Remember your password?{' '}
            <a href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
