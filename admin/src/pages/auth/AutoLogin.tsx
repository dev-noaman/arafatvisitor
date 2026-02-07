import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useAuthContext } from '@/context/AuthContext'

export default function AutoLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { autoLogin } = useAuthContext()
  const [error, setError] = useState<string | null>(null)
  const hasAttempted = useRef(false)

  useEffect(() => {
    // Prevent double-execution in React StrictMode or re-renders
    if (hasAttempted.current) return
    hasAttempted.current = true

    const token = searchParams.get('token')

    if (!token) {
      setError('No token provided')
      return
    }

    const performAutoLogin = async () => {
      try {
        // Exchange the short-lived kiosk token for a proper 24h admin session
        const res = await fetch('/admin/api/token-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.user && data.token) {
            // Store the new 24h token + user in context & localStorage
            await autoLogin(data.token)
            navigate('/admin', { replace: true })
            return
          }
        }

        // Fallback: decode original token client-side
        await autoLogin(token)
        navigate('/admin', { replace: true })
      } catch {
        // Fallback: try client-side JWT decode
        try {
          await autoLogin(token)
          navigate('/admin', { replace: true })
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Auto-login failed')
        }
      }
    }

    performAutoLogin()
  }, [searchParams, autoLogin, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Auto-Login Failed
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => navigate('/admin/login', { replace: true })}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Signing you in...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
