import React from 'react';
import { Icon } from '@adminjs/design-system';
import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useCurrentAdmin } from 'adminjs';

type Page = { name: string; icon?: string };
type Props = {
  resources: any[];
  OriginalComponent?: React.ComponentType<any>;
};

// Inline styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '16px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#64748b',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s ease',
  },
  menuItemSelected: {
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeft: '3px solid #3b82f6',
  },
  separator: {
    border: '0',
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '12px 16px',
  },
  icon: {
    width: '18px',
    height: '18px',
    flexShrink: 0,
  },
  label: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

/**
 * Flat sidebar menu without navigation groups
 * Role-based visibility:
 * - ADMIN: sees all items
 * - HOST: hides Users, Audit Log, Settings
 * - RECEPTION: hides Users, Audit Log, Settings
 */
const SidebarResourceSection: React.FC<Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pages: Page[] = useSelector((state: any) => state.pages) || [];
  const rootPath = useSelector((state: any) => state.paths?.rootPath) || '/admin';
  const [currentAdmin] = useCurrentAdmin();
  const userRole = (currentAdmin as any)?.role || 'RECEPTION';

  const isSelected = (path: string) => {
    if (path === rootPath) {
      return location.pathname === rootPath || location.pathname === `${rootPath}/`;
    }
    return location.pathname.startsWith(path);
  };

  const handleClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  // Get page icons
  const getPageIcon = (name: string) => {
    const page = pages.find((p) => p.name === name);
    return page?.icon || 'File';
  };

  // Menu items configuration
  const topMenuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'Home', href: rootPath },
    { id: 'Hosts', label: 'Hosts', icon: 'Briefcase', href: `${rootPath}/resources/Hosts` },
    { id: 'Deliveries', label: 'Deliveries', icon: 'Package', href: `${rootPath}/resources/Deliveries` },
    { id: 'Visitors', label: 'Visitors', icon: 'UserCheck', href: `${rootPath}/resources/Visitors` },
    { id: 'PreRegister', label: 'Pre Register', icon: 'Calendar', href: `${rootPath}/resources/PreRegister` },
  ];

  // Admin-only items (hidden from HOST and RECEPTION)
  // Reports is visible to all roles (HOST sees only their company, RECEPTION sees all)
  const adminOnlyItems = ['Users', 'AuditLog', 'Settings'];

  const allBottomMenuItems = [
    { id: 'Users', label: 'Users', icon: 'Users', href: `${rootPath}/resources/Users` },
    { id: 'AuditLog', label: 'Audit Log', icon: 'FileText', href: `${rootPath}/resources/AuditLog` },
    { id: 'Reports', label: 'Reports', icon: getPageIcon('Reports') || 'BarChart2', href: `${rootPath}/pages/Reports` },
    { id: 'Settings', label: 'Settings', icon: getPageIcon('Settings') || 'Settings', href: `${rootPath}/pages/Settings` },
  ];

  // Filter bottom menu items based on role
  const bottomMenuItems = userRole === 'ADMIN'
    ? allBottomMenuItems
    : allBottomMenuItems.filter(item => !adminOnlyItems.includes(item.id));

  const getMenuItemStyle = (selected: boolean) => ({
    ...styles.menuItem,
    ...(selected ? styles.menuItemSelected : {}),
  });

  return (
    <div style={styles.container}>
      {topMenuItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          style={getMenuItemStyle(isSelected(item.href))}
          onClick={handleClick(item.href)}
        >
          <Icon icon={item.icon} />
          <span style={styles.label}>{item.label}</span>
        </a>
      ))}

      <hr style={styles.separator} />

      {bottomMenuItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          style={getMenuItemStyle(isSelected(item.href))}
          onClick={handleClick(item.href)}
        >
          <Icon icon={item.icon} />
          <span style={styles.label}>{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default SidebarResourceSection;
