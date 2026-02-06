import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { SignInForm } from '@/components/auth/SignInForm'
import logo from '@/assets/logo.svg?url'

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null)

  // Check for session expiry message on mount
  useEffect(() => {
    const message = sessionStorage.getItem('session_expired')
    if (message) {
      setSessionExpiredMessage(message)
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
    <div className="relative min-h-screen bg-white">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex flex-col flex-1 p-6 lg:p-0">
          {/* Session Expiry Banner */}
          {sessionExpiredMessage && (
            <div className="bg-amber-50 border-b border-amber-200 lg:absolute lg:top-0 lg:left-0 lg:right-1/2">
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

        {/* Right Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 items-center justify-center relative overflow-hidden">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md px-8 text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <img src={logo} className="w-12 h-12" alt="Logo" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Arafat VMS</h2>
              <p className="text-blue-200 text-lg">Visitor Management System</p>
            </div>

            {/* Tagline */}
            <p className="text-blue-100/80 text-base leading-relaxed mb-8">
              Streamline your visitor management with our comprehensive solution.
              Track visits, manage deliveries, and ensure security.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium">Visitor Tracking</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium">Delivery Management</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium">QR Check-in</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium">Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
