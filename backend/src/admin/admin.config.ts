// Main AdminJS Configuration
// Modular setup with custom dashboard, role-based access, and custom components

import type { AdminJSOptions } from 'adminjs';

// Component paths for bundling (relative to this file)
export const componentPaths = {
  Dashboard: './components/Dashboard',
  VisitorCards: './components/VisitorCards',
  ReportsPanel: './components/ReportsPanel',
  SettingsPanel: './components/SettingsPanel',
  SendQrModal: './components/SendQrModal',
  ChangePasswordModal: './components/ChangePasswordModal',
  UserPasswordField: './components/UserPasswordField',
  EditProfilePanel: './components/EditProfilePanel',
  BulkImportHosts: './components/BulkImportHosts',
};

// AdminJS branding configuration
export const brandingConfig = {
  companyName: 'Our Admin Panel',
  logo: false as const,
  favicon: '/favicon.ico',
  withMadeWithLove: false,
};

// Custom CSS for dark mode and sidebar
export const customStyles = `
  /* Dark mode support */
  :root {
    --adminjs-primary: #3b82f6;
    --adminjs-primary-dark: #2563eb;
  }
  
  .dark {
    --adminjs-bg: #1f2937;
    --adminjs-text: #f9fafb;
    --adminjs-border: #374151;
  }
  
  /* Sidebar always visible by default */
  [data-css="sidebar"] {
    transform: translateX(0) !important;
    transition: transform 0.3s ease;
  }
  
  [data-css="sidebar"].collapsed {
    transform: translateX(-100%) !important;
  }
`;

// Role-based navigation visibility
export const getNavigationForRole = (role: string) => {
  const baseNav = [
    { name: 'Dashboard Stats', icon: 'Dashboard' },
    { name: 'Hosts', icon: 'User' },
    { name: 'Deliveries', icon: 'Package' },
    { name: 'Visitors', icon: 'UserCheck' },
    { name: 'Pre Register', icon: 'Calendar' },
  ];

  if (role === 'ADMIN') {
    return [
      ...baseNav,
      { name: 'Reports', icon: 'FileText' },
      { name: 'Settings', icon: 'Settings' },
    ];
  }

  if (role === 'HOST') {
    return [
      ...baseNav,
      { name: 'Reports', icon: 'FileText' },
    ];
  }

  // RECEPTION - limited navigation
  return [
    { name: 'Dashboard', icon: 'Dashboard' },
    { name: 'Deliveries', icon: 'Package' },
    { name: 'Visitors', icon: 'UserCheck' },
    { name: 'Pre Register', icon: 'Calendar' },
  ];
};

// Export admin options builder function
export const buildAdminOptions = (
  getModel: (name: string) => any,
  prisma: any,
  Components: Record<string, string>,
): AdminJSOptions => ({
  rootPath: '/admin',
  loginPath: '/admin/login',
  logoutPath: '/admin/logout',
  branding: brandingConfig,
  dashboard: {
    component: Components.Dashboard,
  },
  pages: {
    Reports: {
      component: Components.ReportsPanel,
      icon: 'FileText',
    },
    Settings: {
      component: Components.SettingsPanel,
      icon: 'Settings',
    },
    EditProfile: {
      component: Components.EditProfilePanel,
      icon: 'User',
    },
  },
  resources: [
    // Hosts Resource
    {
      resource: { model: getModel('Host'), client: prisma },
      options: {
        id: 'Hosts',
        navigation: { name: 'Hosts', icon: 'User' },
        listProperties: ['name', 'company', 'email', 'phone', 'location'],
        filterProperties: ['company', 'location', 'status'],
        sort: { sortBy: 'company', direction: 'asc' as const },
        properties: {
          status: {
            availableValues: [
              { value: 1, label: 'Active' },
              { value: 0, label: 'InActive' },
            ],
          },
        },
        actions: {
          new: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          edit: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          delete: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          bulkImport: {
            actionType: 'bulk' as const,
            label: 'Bulk Import',
            icon: 'Upload',
            component: Components.BulkImportHosts,
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
            handler: async (request: any, response: any, context: any) => {
              // Handled by component
              return {};
            },
          },
          list: {
            before: async (request: any, context: any) => {
              const { currentAdmin } = context;
              if (currentAdmin?.role === 'HOST' && currentAdmin?.hostId) {
                // Host can only see hosts from same company
                const host = await prisma.host.findUnique({
                  where: { id: BigInt(currentAdmin.hostId) },
                });
                if (host) {
                  request.query = { ...request.query, 'filters.company': host.company };
                }
              }
              return request;
            },
          },
        },
      },
    },
    // Deliveries Resource
    {
      resource: { model: getModel('Delivery'), client: prisma },
      options: {
        id: 'Deliveries',
        navigation: { name: 'Deliveries', icon: 'Package' },
        listProperties: ['courier', 'recipient', 'host', 'location', 'status', 'receivedAt', 'pickedUpAt'],
        filterProperties: ['status', 'location', 'receivedAt'],
        actions: {
          // Reception can create, Host cannot
          new: {
            isAccessible: ({ currentAdmin }: any) => {
              const role = currentAdmin?.role;
              return role === 'ADMIN' || role === 'RECEPTION';
            },
          },
          edit: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          delete: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          // Mark Picked Up action - Host only
          markPickedUp: {
            actionType: 'record' as const,
            label: 'Mark Picked Up',
            icon: 'CheckCircle',
            guard: 'Are you sure you want to mark this delivery as picked up?',
            isVisible: true,
            isAccessible: ({ currentAdmin, record }: any) => {
              const role = currentAdmin?.role;
              const status = record?.params?.status;

              // Must be RECEIVED status (no skipping)
              if (status !== 'RECEIVED') return false;
              // Reception NEVER picks up
              if (role === 'RECEPTION') return false;
              // Admin can pick up any
              if (role === 'ADMIN') return true;
              // Host can pick up own company deliveries
              if (role === 'HOST') {
                return record?.params?.hostId?.toString() === currentAdmin?.hostId?.toString();
              }
              return false;
            },
            handler: async (request: any, response: any, context: any) => {
              const { record } = context;

              if (record.params.status !== 'RECEIVED') {
                return {
                  record: record.toJSON(),
                  notice: { type: 'error', message: 'Invalid state transition' },
                };
              }

              await record.update({
                status: 'PICKED_UP',
                pickedUpAt: new Date(),
              });

              return {
                record: record.toJSON(),
                notice: { type: 'success', message: 'Marked as picked up' },
              };
            },
          },
          list: {
            before: async (request: any, context: any) => {
              const { currentAdmin } = context;
              if (currentAdmin?.role === 'HOST' && currentAdmin?.hostId) {
                request.query = { ...request.query, 'filters.hostId': currentAdmin.hostId };
              }
              if (currentAdmin?.role === 'RECEPTION') {
                // Reception sees all at their location (no filter by hostId)
              }
              return request;
            },
          },
        },
      },
    },
    // Visitors Resource (Visit with CHECKED_IN, CHECKED_OUT)
    {
      resource: { model: getModel('Visit'), client: prisma },
      options: {
        id: 'Visitors',
        navigation: { name: 'Visitors', icon: 'UserCheck' },
        listProperties: ['visitorName', 'visitorPhone', 'host', 'purpose', 'status', 'checkInAt'],
        filterProperties: ['status', 'location', 'checkInAt'],
        // Custom list component for card view
        // component: Components.VisitorCards,
        actions: {
          new: {
            isAccessible: ({ currentAdmin }: any) => {
              const role = currentAdmin?.role;
              return role === 'ADMIN' || role === 'RECEPTION';
            },
          },
          edit: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          // Checkout action
          checkout: {
            actionType: 'record' as const,
            label: 'Check Out',
            icon: 'LogOut',
            guard: 'Check out this visitor?',
            isVisible: true,
            isAccessible: ({ record }: any) => record?.params?.status === 'CHECKED_IN',
            handler: async (request: any, response: any, context: any) => {
              const { record } = context;

              await record.update({
                status: 'CHECKED_OUT',
                checkOutAt: new Date(),
              });

              return {
                record: record.toJSON(),
                notice: { type: 'success', message: 'Visitor checked out' },
              };
            },
          },
          // Send QR action - all roles
          sendQr: {
            actionType: 'record' as const,
            label: 'Send QR',
            icon: 'Send',
            component: Components.SendQrModal,
            isVisible: true,
            isAccessible: ({ record }: any) => {
              // Show if visit has a QR token
              return !!record?.params?.id;
            },
            handler: async (request: any, response: any, context: any) => {
              // Handled by component
              return { record: context.record.toJSON() };
            },
          },
          list: {
            before: async (request: any, context: any) => {
              const { currentAdmin } = context;
              // Filter to show only CHECKED_IN and CHECKED_OUT
              request.query = {
                ...request.query,
                'filters.status': request.query?.['filters.status'] || ['CHECKED_IN', 'CHECKED_OUT'],
              };

              if (currentAdmin?.role === 'HOST' && currentAdmin?.hostId) {
                request.query['filters.hostId'] = currentAdmin.hostId;
              }
              return request;
            },
          },
        },
      },
    },
    // Pre Register Resource (Visit with PRE_REGISTERED, PENDING_APPROVAL, APPROVED, REJECTED)
    {
      resource: { model: getModel('Visit'), client: prisma },
      options: {
        id: 'PreRegister',
        navigation: { name: 'Pre Register', icon: 'Calendar' },
        listProperties: ['visitorName', 'visitorPhone', 'host', 'expectedDate', 'status', 'createdAt'],
        filterProperties: ['status', 'location', 'expectedDate'],
        actions: {
          new: {
            isAccessible: ({ currentAdmin }: any) => {
              const role = currentAdmin?.role;
              return role === 'ADMIN' || role === 'HOST' || role === 'RECEPTION';
            },
          },
          edit: {
            isAccessible: () => false, // No edit allowed
          },
          // Approve action
          approve: {
            actionType: 'record' as const,
            label: 'Approve',
            icon: 'Check',
            variant: 'success' as const,
            guard: 'Approve this pre-registration?',
            isVisible: true,
            isAccessible: ({ currentAdmin, record }: any) => {
              const status = record?.params?.status;
              if (status !== 'PENDING_APPROVAL') return false;

              const role = currentAdmin?.role;
              if (role === 'RECEPTION') return false; // Reception never approves
              if (role === 'ADMIN') return true;
              if (role === 'HOST') {
                return record?.params?.hostId?.toString() === currentAdmin?.hostId?.toString();
              }
              return false;
            },
            handler: async (request: any, response: any, context: any) => {
              const { record } = context;

              await record.update({
                status: 'APPROVED',
                approvedAt: new Date(),
              });

              // TODO: Generate QR token and send notification

              return {
                record: record.toJSON(),
                notice: { type: 'success', message: 'Pre-registration approved' },
              };
            },
          },
          // Reject action
          reject: {
            actionType: 'record' as const,
            label: 'Reject',
            icon: 'X',
            variant: 'danger' as const,
            guard: 'Reject this pre-registration?',
            isVisible: true,
            isAccessible: ({ currentAdmin, record }: any) => {
              const status = record?.params?.status;
              if (status !== 'PENDING_APPROVAL') return false;

              const role = currentAdmin?.role;
              if (role === 'RECEPTION') return false;
              if (role === 'ADMIN') return true;
              if (role === 'HOST') {
                return record?.params?.hostId?.toString() === currentAdmin?.hostId?.toString();
              }
              return false;
            },
            handler: async (request: any, response: any, context: any) => {
              const { record } = context;

              await record.update({
                status: 'REJECTED',
                rejectedAt: new Date(),
              });

              // TODO: Send rejection notification

              return {
                record: record.toJSON(),
                notice: { type: 'success', message: 'Pre-registration rejected' },
              };
            },
          },
          list: {
            before: async (request: any, context: any) => {
              const { currentAdmin } = context;
              // Filter to show only pre-registration statuses
              const preRegStatuses = ['PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
              request.query = {
                ...request.query,
                'filters.status': request.query?.['filters.status'] || preRegStatuses,
              };

              if (currentAdmin?.role === 'HOST' && currentAdmin?.hostId) {
                request.query['filters.hostId'] = currentAdmin.hostId;
              }
              return request;
            },
          },
        },
      },
    },
    // Users Resource (Admin only)
    {
      resource: { model: getModel('User'), client: prisma },
      options: {
        id: 'Users',
        navigation: { name: 'System', icon: 'Users' },
        listProperties: ['name', 'email', 'role', 'createdAt'],
        properties: {
          password: {
            isVisible: { list: false, show: false, edit: true, filter: false },
            components: {
              edit: Components.UserPasswordField,
            },
          },
          hostId: {
            isVisible: { list: false, show: false, edit: false, filter: false },
          },
          host: {
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          email: {
            isRequired: true,
          },
        },
        actions: {
          list: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          new: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
            before: async (request: any) => {
              if (request.method === 'post') {
                const { email } = request.payload;
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  throw new Error('Invalid email address format');
                }
              }
              return request;
            },
          },
          edit: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
            before: async (request: any) => {
              if (request.method === 'post') {
                const { email } = request.payload;
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  throw new Error('Invalid email address format');
                }
              }
              return request;
            },
          },
          delete: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
        },

      },
    },
    // Audit Log Resource (Admin only, read-only)
    {
      resource: { model: getModel('AuditLog'), client: prisma },
      options: {
        id: 'AuditLog',
        navigation: { name: 'System', icon: 'FileText' },
        actions: {
          list: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          show: {
            isAccessible: ({ currentAdmin }: any) => currentAdmin?.role === 'ADMIN',
          },
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
        },
      },
    },
  ],
  locale: {
    language: 'en',
    translations: {
      labels: {
        Hosts: 'Hosts',
        Deliveries: 'Deliveries',
        Visitors: 'Visitors',
        PreRegister: 'Pre Register',
        Users: 'Users',
        AuditLog: 'Audit Log',
        location: {
          BARWA_TOWERS: 'Barwa Towers',
          MARINA_50: 'Marina 50',
          ELEMENT_MARIOTT: 'Element Marriott',
        },
      },
      actions: {
        markPickedUp: 'Mark Picked Up',
        checkout: 'Check Out',
        sendQr: 'Send QR',
        approve: 'Approve',
        reject: 'Reject',
        bulkImport: 'Bulk Import',
      },
    },
  },
});
