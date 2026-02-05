import { Outlet } from 'react-router'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
          <p className="text-xs text-gray-600">
            © 2026 Arafat Visitor Management System. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
