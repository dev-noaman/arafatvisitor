/**
 * Domain types for the Arafat Visitor Management System
 * Matches the backend API response structures
 */

// User roles
export type UserRole = 'ADMIN' | 'RECEPTION' | 'HOST' | 'STAFF';

// User status
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Visit status
export type VisitStatus =
  | 'PENDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'REJECTED'
  | 'CANCELLED';

// Delivery status
export type DeliveryStatus = 'RECEIVED' | 'PICKED_UP';

// Host type
export type HostType = 'EXTERNAL' | 'STAFF';

// Export API types
export * from './api';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  hostId?: string;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Visit entity
 */
export interface Visit {
  id: string;
  sessionId: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  hostId: string;
  // Admin list endpoint returns nested host relation; mapped endpoints return flat hostName
  host?: { id?: string | number; name: string; company?: string; email?: string; phone?: string; };
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
  status: VisitStatus;
  expectedDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  purpose?: string;
  location?: string;
  notes?: string;
  badgeId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Host entity
 */
export interface Host {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type: HostType;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pre-registration entity
 */
export interface PreRegistration {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorCompany: string;
  hostId: string;
  // Admin list endpoint returns nested host relation; mapped endpoints return flat hostName
  host?: { id?: string | number; name: string; company?: string; email?: string; phone?: string; };
  hostName?: string;
  hostEmail?: string;
  // Backend Prisma field is "expectedDate"; some API responses may use "expectedArrivalDate"
  expectedDate?: string;
  expectedArrivalDate?: string;
  purpose?: string;
  location?: string;
  notes?: string;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Delivery entity
 */
export interface Delivery {
  id: string;
  recipient: string;
  recipientId?: string;
  deliveryType: string;
  courier?: string;
  location?: string;
  status: DeliveryStatus;
  receivedAt: string;
  pickedUpAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * QR Token entity
 */
export interface QRToken {
  sessionId: string;
  token?: string;
  expiresAt: string;
}

/**
 * Auth token response
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Dashboard KPIs
 */
export interface DashboardKPIs {
  totalHosts: number;
  visitsToday: number;
  deliveriesToday: number;
}

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

/**
 * Lookup purpose
 */
export interface LookupPurpose {
  id: string;
  name: string;
  description?: string;
}

/**
 * Lookup delivery type
 */
export interface LookupDeliveryType {
  id: string;
  name: string;
  description?: string;
}

/**
 * Lookup courier
 */
export interface LookupCourier {
  id: string;
  name: string;
  contact?: string;
}

/**
 * Lookup location
 */
export interface LookupLocation {
  id: string;
  name: string;
  description?: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
