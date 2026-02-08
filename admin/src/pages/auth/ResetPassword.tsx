import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import logo from '@/assets/logo.svg?url'

export default function ResetPassword() {
  return (
    <div className="relative min-h-screen bg-white">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex flex-col flex-1 p-6 lg:p-0">
          <ResetPasswordForm />
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
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Reset your password</h3>
              <p className="text-blue-100">
                Choose a strong new password to keep your account secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
