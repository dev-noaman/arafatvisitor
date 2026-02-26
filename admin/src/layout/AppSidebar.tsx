import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSidebar } from '@/context/SidebarContext'
import { getVisibleNavItems } from '@/config/navigation'
import { api } from '@/services/api'
import {
  GridIcon,
  GroupIcon,
  UserCircleIcon,
  CalendarIcon,
  TruckDeliveryIcon,
  PieChartIcon,
  BoltIcon,
  UserIcon,
} from '@/icons'

// Inline Ticket icon for Tickets nav item
const TicketIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
  </svg>
)

// Inline Briefcase icon for Staff nav item
const BriefcaseIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)

const ICON_MAP: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
  'Grid': GridIcon,
  'Users': GroupIcon,
  'UserCheck': UserCircleIcon,
  'Calendar': CalendarIcon,
  'Package': TruckDeliveryIcon,
  'BarChart': PieChartIcon,
  'Settings': BoltIcon,
  'UserCog': UserIcon,
  'Briefcase': BriefcaseIcon,
  'Ticket': TicketIcon,
}

export default function AppSidebar() {
  const { user } = useAuth()
  const { isOpen, toggle } = useSidebar()
  const location = useLocation()
  const visibleItems = getVisibleNavItems(user?.role)
  const [ticketBadge, setTicketBadge] = useState(0)

  const fetchBadgeCount = useCallback(async () => {
    try {
      const res = await api.get<{ count: number }>('/admin/api/tickets/badge-count')
      setTicketBadge(res.count)
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    fetchBadgeCount()
    const interval = setInterval(fetchBadgeCount, 60_000)
    return () => clearInterval(interval)
  }, [fetchBadgeCount])

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
          {visibleItems.map(item => {
            const Icon = ICON_MAP[item.icon]
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                {item.label}
                {item.label === 'Tickets' && ticketBadge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {ticketBadge > 99 ? '99+' : ticketBadge}
                  </span>
                )}
              </Link>
            )
          })}
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
          {visibleItems.map(item => {
            const Icon = ICON_MAP[item.icon]
            return (
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
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                {item.label}
                {item.label === 'Tickets' && ticketBadge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {ticketBadge > 99 ? '99+' : ticketBadge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
