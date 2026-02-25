import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleGuard } from '@/components/common/RoleGuard'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// Layout
import AppLayout from '@/layout/AppLayout'

import { Suspense, lazy } from 'react'

// Pages - Auth (not lazy loaded - needed immediately)
import SignIn from '@/pages/auth/SignIn'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import AutoLogin from '@/pages/auth/AutoLogin'

// Pages - Main (lazy loaded for code splitting)
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Hosts = lazy(() => import('@/pages/Hosts'))
const Staff = lazy(() => import('@/pages/Staff'))
const Visitors = lazy(() => import('@/pages/Visitors'))
const PreRegister = lazy(() => import('@/pages/PreRegister'))
const Deliveries = lazy(() => import('@/pages/Deliveries'))
const Users = lazy(() => import('@/pages/Users'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))
const Profile = lazy(() => import('@/pages/Profile'))
const MyTeam = lazy(() => import('@/components/my-team/MyTeam'))

// Loading skeleton for lazy-loaded components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <SidebarProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/admin/login" element={<SignIn />} />
                <Route path="/admin/auto-login" element={<AutoLogin />} />
                <Route path="/admin/quick-login" element={<AutoLogin />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />

                {/* Protected routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                  <Route path="hosts" element={<Suspense fallback={<PageLoader />}><Hosts /></Suspense>} />
                  <Route
                    path="my-team"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <RoleGuard allowedRoles={['HOST', 'RECEPTION', 'ADMIN']}>
                          <MyTeam />
                        </RoleGuard>
                      </Suspense>
                    }
                  />
                  <Route
                    path="staff"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <RoleGuard allowedRoles={['ADMIN']}>
                          <Staff />
                        </RoleGuard>
                      </Suspense>
                    }
                  />
                  <Route path="visitors" element={<Suspense fallback={<PageLoader />}><Visitors /></Suspense>} />
                  <Route path="pre-register" element={<Suspense fallback={<PageLoader />}><PreRegister /></Suspense>} />
                  <Route path="deliveries" element={<Suspense fallback={<PageLoader />}><Deliveries /></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
                  <Route path="profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />

                  {/* Admin-only routes */}
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <RoleGuard allowedRoles={['ADMIN']}>
                          <Users />
                        </RoleGuard>
                      </Suspense>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <RoleGuard allowedRoles={['ADMIN']}>
                          <Settings />
                        </RoleGuard>
                      </Suspense>
                    }
                  />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
              <Toaster position="top-right" richColors />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
    </ErrorBoundary>
  )
}
