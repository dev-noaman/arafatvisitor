import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSidebar } from '@/context/SidebarContext'
import { getVisibleNavItems } from '@/config/navigation'

export default function AppSidebar() {
  const { user } = useAuth()
  const { isOpen, toggle } = useSidebar()
  const location = useLocation()
  const visibleItems = getVisibleNavItems(user?.role)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-white flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Arafat VMS</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {visibleItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={toggle}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Arafat VMS</h1>
            <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
          </div>
          <button
            onClick={toggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Close menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="overflow-y-auto px-4 py-4 space-y-1">
          {visibleItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggle}
              className={`flex items-center px-4 py-2.5 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
