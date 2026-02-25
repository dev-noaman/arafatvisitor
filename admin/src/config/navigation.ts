import { UserRole } from '@/types'

export interface NavItem {
  path: string
  label: string
  icon: string
  roles: UserRole[]
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: 'Grid',
    roles: ['ADMIN', 'HOST', 'RECEPTION', 'STAFF'],
  },
  {
    path: '/admin/my-team',
    label: 'My Team',
    icon: 'Users',
    roles: ['HOST'],
  },
  {
    path: '/admin/hosts',
    label: 'Hosts',
    icon: 'Users',
    roles: ['ADMIN', 'HOST', 'RECEPTION'],
  },
  {
    path: '/admin/visitors',
    label: 'Visitors',
    icon: 'UserCheck',
    roles: ['ADMIN', 'HOST', 'RECEPTION', 'STAFF'],
  },
  {
    path: '/admin/pre-register',
    label: 'Pre Register',
    icon: 'Calendar',
    roles: ['ADMIN', 'HOST', 'RECEPTION', 'STAFF'],
  },
  {
    path: '/admin/deliveries',
    label: 'Deliveries',
    icon: 'Package',
    roles: ['ADMIN', 'HOST', 'RECEPTION', 'STAFF'],
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: 'BarChart',
    roles: ['ADMIN', 'HOST'],
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: 'UserCog',
    roles: ['ADMIN'],
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'Settings',
    roles: ['ADMIN'],
  },
]

/**
 * Filter navigation items based on user role
 */
export function getVisibleNavItems(role: UserRole | undefined): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter(item => item.roles.includes(role))
}
