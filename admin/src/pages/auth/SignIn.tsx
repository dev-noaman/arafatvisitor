import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null)

  // Check for session expiry message on mount
  useEffect(() => {
    const message = sessionStorage.getItem('session_expired')
    if (message) {
      setSessionExpiredMessage(message)
      // Clear the message so it doesn't show again on refresh
      sessionStorage.removeItem('session_expired')
    }
  }, [])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Session Expiry Banner */}
      {sessionExpiredMessage && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-md mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-amber-800">{sessionExpiredMessage}</p>
              <button
                onClick={() => setSessionExpiredMessage(null)}
                className="ml-auto text-amber-500 hover:text-amber-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <SignInForm />
    </div>
  )
}
