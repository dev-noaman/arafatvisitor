/**
 * API request and response types
 * Matches backend API contracts
 */

import { User, Visit, Host, PreRegistration, Delivery, Notification, PaginatedResponse, DashboardKPIs } from './index';

// ========== Auth Endpoints ==========

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ========== Dashboard Endpoints ==========

export interface DashboardKPIsResponse {
  todaysVisitors: number;
  checkedIn: number;
  expected: number;
  pendingApprovals: number;
}

export interface PendingApprovalsParams {
  page?: number;
  limit?: number;
}

export interface CurrentVisitorsParams {
  limit?: number;
}

export interface ApproveVisitRequest {
  id: string;
}

export interface ApproveVisitResponse {
  success: boolean;
}

export interface RejectVisitRequest {
  id: string;
  reason?: string;
}

export interface RejectVisitResponse {
  success: boolean;
}

export interface CheckOutVisitorRequest {
  sessionId: string;
}

export interface CheckOutVisitorResponse {
  success: boolean;
}

// ========== Visitors Endpoints ==========

export interface GetVisitorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateVisitRequest {
  visitorName: string;
  visitorCompany?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  hostId: string;
  expectedDate: string;
  purpose?: string;
  location?: string;
  notes?: string;
}

export interface UpdateVisitRequest {
  visitorName?: string;
  visitorCompany?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  hostId?: string;
  expectedDate?: string;
  purpose?: string;
  location?: string;
  notes?: string;
}

export interface CheckInRequest {
  sessionId: string;
}

export interface CheckInResponse {
  success: boolean;
}

export interface CheckOutRequest {
  sessionId: string;
}

export interface CheckOutResponse {
  success: boolean;
}

export interface GetVisitBySessionIdResponse extends Visit {}

// ========== Pre-Registration Endpoints ==========

export interface GetPreRegistrationsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreatePreRegistrationRequest {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorCompany: string;
  hostId: string;
  expectedArrivalDate: string;
  purpose?: string;
  location?: string;
  notes?: string;
}

export interface UpdatePreRegistrationRequest {
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  hostId?: string;
  expectedArrivalDate?: string;
  purpose?: string;
  location?: string;
  notes?: string;
}

export interface ApprovePreRegistrationRequest {
  id: string;
}

export interface ApprovePreRegistrationResponse {
  success: boolean;
}

export interface RejectPreRegistrationRequest {
  id: string;
  reason?: string;
}

export interface RejectPreRegistrationResponse {
  success: boolean;
}

export interface ReApprovePreRegistrationRequest {
  id: string;
}

export interface ReApprovePreRegistrationResponse {
  success: boolean;
}

// ========== Hosts Endpoints ==========

export interface GetHostsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface CreateHostRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type: HostType;
  department?: string;
}

export interface UpdateHostRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: HostType;
  department?: string;
}

// ========== Deliveries Endpoints ==========

export interface GetDeliveriesParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateDeliveryRequest {
  recipient: string;
  recipientId?: string;
  deliveryType: string;
  courier?: string;
  location?: string;
  notes?: string;
}

export interface UpdateDeliveryRequest {
  recipient?: string;
  recipientId?: string;
  deliveryType?: string;
  courier?: string;
  location?: string;
  status?: DeliveryStatus;
  notes?: string;
}

export interface MarkPickedUpRequest {
  id: string;
}

export interface MarkPickedUpResponse {
  success: boolean;
}

// ========== Notifications Endpoints ==========

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export interface MarkAsReadRequest {
  id: string;
}

export interface MarkAsReadResponse {
  success: boolean;
}

export interface MarkAllAsReadResponse {
  success: boolean;
}

// ========== Lookups Endpoints ==========

export interface GetPurposesResponse {
  purposes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface GetDeliveryTypesResponse {
  types: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface GetCouriersResponse {
  couriers: Array<{
    id: string;
    name: string;
    contact?: string;
  }>;
}

export interface GetLocationsResponse {
  locations: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

// ========== Profile Endpoints ==========

export interface GetProfileResponse extends User {}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Type re-exports
export type HostType = 'EXTERNAL' | 'STAFF';
export type DeliveryStatus = 'RECEIVED' | 'PICKED_UP';
