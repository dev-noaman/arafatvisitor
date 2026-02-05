import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { RoleGuard } from '@/components/common/RoleGuard'

// Layout
import AppLayout from '@/layout/AppLayout'

// Pages - Auth
import SignIn from '@/pages/auth/SignIn'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

// Pages - Main
import Dashboard from '@/pages/Dashboard'
import Hosts from '@/pages/Hosts'
import Visitors from '@/pages/Visitors'
import PreRegister from '@/pages/PreRegister'
import Deliveries from '@/pages/Deliveries'
import Users from '@/pages/Users'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/admin/login" element={<SignIn />} />
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
                  <Route index element={<Dashboard />} />
                  <Route path="hosts" element={<Hosts />} />
                  <Route path="visitors" element={<Visitors />} />
                  <Route path="pre-register" element={<PreRegister />} />
                  <Route path="deliveries" element={<Deliveries />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />

                  {/* Admin-only routes */}
                  <Route
                    path="users"
                    element={
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <Users />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <Settings />
                      </RoleGuard>
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
  )
}
