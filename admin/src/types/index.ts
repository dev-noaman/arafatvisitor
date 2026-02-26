// User Roles
export type UserRole = 'ADMIN' | 'RECEPTION' | 'HOST' | 'STAFF';

// User Status
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// Visit Status
export type VisitStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'REJECTED';

// Delivery Status
export type DeliveryStatus = 'RECEIVED' | 'PENDING' | 'PICKED_UP';

// User Entity
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status?: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Host location (shared across components)
export type HostLocationType = 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' | null | undefined;

// Host Entity (contact person at a company or internal staff member)
export interface Host {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  location?: 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT';
  status?: number;
  type?: 'EXTERNAL' | 'STAFF';
  createdById?: number;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
}

// Visit Entity
export interface Visit {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  hostId: string;
  host?: Host;
  visitDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: VisitStatus;
  qrToken?: string;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pre-Registration Entity
export interface PreRegistration {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  hostId: string;
  host?: Host;
  expectedDate?: string;
  scheduledDate?: string; // alias for expectedDate
  status: VisitStatus;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Entity
export interface Delivery {
  id: string;
  recipient: string;
  hostId?: string;
  host?: Host;
  courier: string;
  location?: string;
  status: DeliveryStatus;
  notes?: string;
  receivedAt?: string;
  pickedUpAt?: string;
  createdAt: string;
  // Aliases for frontend compatibility
  recipientName?: string;
  deliveryCompany?: string;
  description?: string;
  receivedDate?: string;
}

// Settings Entity
export interface Settings {
  id: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpFrom?: string;
  whatsappApiKey?: string;
  whatsappPhoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Report Data Types
export interface VisitReport {
  date: string;
  totalVisits: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DeliveryReport {
  date: string;
  totalDeliveries: number;
  pickedUp: number;
  pending: number;
}

export interface HostReport {
  hostId: string;
  hostName: string;
  totalVisits: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface HostFormData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  location?: 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT';
}

export interface UserFormData {
  email: string;
  name?: string;
  role: UserRole;
  password?: string;
  hostId?: string;
}

export interface VisitFormData {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  hostId: string;
  visitDate: string;
  purpose?: string;
  notes?: string;
}

export interface PreRegistrationFormData {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  hostId: string;
  scheduledDate: string;
  purpose?: string;
  notes?: string;
}

export interface DeliveryFormData {
  deliveryType: string;
  hostId: string;
  courier: string;
}

export interface SmtpSettingsFormData {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
}

export interface WhatsAppSettingsFormData {
  whatsappApiKey?: string;
  whatsappPhoneNumber?: string;
}

export interface ProfileFormData {
  name?: string;
  phone?: string;
}

export interface PreferencesFormData {
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
}

// Modal Types
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// Toast Types
export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  children?: NavItem[];
}

// Chart Types
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============ TICKET TYPES ============

export type TicketType = 'SUGGESTION' | 'COMPLAINT';

export type TicketStatus =
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'DISMISSED'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketCategory =
  | 'IT_ISSUE'
  | 'FACILITY_ISSUE'
  | 'VISITOR_SYSTEM_BUG'
  | 'SERVICE_QUALITY'
  | 'OTHER';

export interface TicketUser {
  id: number;
  name: string;
  role?: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  type: TicketType;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority | null;
  category: TicketCategory | null;
  resolution: string | null;
  rejectionReason: string | null;
  createdBy: TicketUser;
  assignedTo: TicketUser | null;
  relatedVisit: { id: string; sessionId: string } | null;
  relatedDelivery: { id: string } | null;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
  _count?: { comments: number; attachments: number };
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface TicketComment {
  id: number;
  message: string;
  isInternal: boolean;
  user: TicketUser;
  createdAt: string;
}

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: { id: number; name: string };
  createdAt: string;
}

export interface TicketFormData {
  type: TicketType;
  subject: string;
  description: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  relatedVisitId?: string;
  relatedDeliveryId?: string;
}

export interface TicketStats {
  openComplaints: number;
  inProgressComplaints: number;
  urgentComplaints: number;
  unassignedComplaints: number;
  pendingSuggestions: number;
  resolvedThisWeek: number;
  averageResolutionHours: number;
}
