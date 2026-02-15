import 'package:arafatvisitor/core/models/user.dart';
import 'package:arafatvisitor/core/models/host.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/core/models/delivery.dart';
import 'package:arafatvisitor/core/models/dashboard.dart';
import 'package:arafatvisitor/core/models/lookup.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';

// Test fixture data - reusable mock instances for all tests

// ============================================================================
// User Test Data
// ============================================================================

final mockAdminUser = User(
  id: 'user_admin_1',
  email: 'admin@test.local',
  name: 'Admin User',
  role: UserRole.admin,
  hostId: null,
  accessToken: 'access_token_admin',
  refreshToken: 'refresh_token_admin',
);

final mockReceptionUser = User(
  id: 'user_reception_1',
  email: 'reception@test.local',
  name: 'Reception User',
  role: UserRole.reception,
  hostId: null,
  accessToken: 'access_token_reception',
  refreshToken: 'refresh_token_reception',
);

final mockHostUser = User(
  id: 'user_host_1',
  email: 'host@test.local',
  name: 'Host User',
  role: UserRole.host,
  hostId: 'host_ext_1',
  accessToken: 'access_token_host',
  refreshToken: 'refresh_token_host',
);

final mockStaffUser = User(
  id: 'user_staff_1',
  email: 'staff@test.local',
  name: 'Staff User',
  role: UserRole.staff,
  hostId: 'host_staff_1',
  accessToken: 'access_token_staff',
  refreshToken: 'refresh_token_staff',
);

// ============================================================================
// Host Test Data
// ============================================================================

final mockExternalHost = Host(
  id: 'host_ext_1',
  externalId: 'external_123',
  name: 'John Smith',
  company: 'Tech Corp',
  email: 'john.smith@techcorp.com',
  phone: '97433112233',
  location: Location.mainLobby,
  status: HostStatus.active,
  type: HostType.external,
  createdAt: DateTime.parse('2026-02-01T10:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T14:00:00Z'),
);

final mockInternalHost = Host(
  id: 'host_staff_1',
  externalId: 'internal_456',
  name: 'Sarah Johnson',
  company: 'Arafat Group',
  email: 'sarah@arafatgroup.com',
  phone: '97455667788',
  location: Location.reception,
  status: HostStatus.active,
  type: HostType.internal,
  createdAt: DateTime.parse('2026-02-01T10:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T14:00:00Z'),
);

final mockInactiveHost = Host(
  id: 'host_ext_2',
  externalId: 'external_789',
  name: 'Inactive Host',
  company: 'Inactive Corp',
  email: 'inactive@corp.com',
  phone: '97499998888',
  location: Location.conferenceRoomA,
  status: HostStatus.inactive,
  type: HostType.external,
  createdAt: DateTime.parse('2026-01-01T10:00:00Z'),
  updatedAt: DateTime.parse('2026-01-15T14:00:00Z'),
);

// ============================================================================
// Visit Test Data
// ============================================================================

final mockApprovedVisit = Visit(
  id: 'visit_1',
  sessionId: 'session_visit_1',
  visitorName: 'Ahmed Ali',
  visitorCompany: 'Export Co',
  visitorPhone: '97433224455',
  visitorEmail: 'ahmed@exportco.com',
  hostId: 'host_ext_1',
  host: mockExternalHost,
  purpose: 'Meeting',
  location: 'MAIN_LOBBY',
  status: VisitStatus.approved,
  expectedDate: DateTime.parse('2026-02-13T14:00:00Z'),
  approvedAt: DateTime.parse('2026-02-13T09:00:00Z'),
  createdAt: DateTime.parse('2026-02-13T08:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T09:00:00Z'),
);

final mockCheckedInVisit = Visit(
  id: 'visit_2',
  sessionId: 'session_visit_2',
  visitorName: 'Fatima Mohamed',
  visitorCompany: 'Import Ltd',
  visitorPhone: '97455661122',
  visitorEmail: 'fatima@importltd.com',
  hostId: 'host_staff_1',
  host: mockInternalHost,
  purpose: 'Delivery',
  location: 'RECEPTION',
  status: VisitStatus.checkedIn,
  expectedDate: DateTime.parse('2026-02-13T10:00:00Z'),
  approvedAt: DateTime.parse('2026-02-13T09:30:00Z'),
  checkInAt: DateTime.parse('2026-02-13T10:15:00Z'),
  createdAt: DateTime.parse('2026-02-13T08:30:00Z'),
  updatedAt: DateTime.parse('2026-02-13T10:15:00Z'),
);

final mockCheckedOutVisit = Visit(
  id: 'visit_3',
  sessionId: 'session_visit_3',
  visitorName: 'Omar Hassan',
  visitorCompany: 'Services Inc',
  visitorPhone: '97433335566',
  visitorEmail: 'omar@servicesinc.com',
  hostId: 'host_ext_1',
  host: mockExternalHost,
  purpose: 'Training',
  location: 'TRAINING_ROOM',
  status: VisitStatus.checkedOut,
  expectedDate: DateTime.parse('2026-02-13T11:00:00Z'),
  approvedAt: DateTime.parse('2026-02-13T10:45:00Z'),
  checkInAt: DateTime.parse('2026-02-13T11:00:00Z'),
  checkOutAt: DateTime.parse('2026-02-13T11:45:00Z'),
  createdAt: DateTime.parse('2026-02-13T09:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T11:45:00Z'),
);

final mockPendingVisit = Visit(
  id: 'visit_4',
  sessionId: 'session_visit_4',
  visitorName: 'Noor Abdullah',
  visitorCompany: 'Tech Solutions',
  visitorPhone: '97477778888',
  visitorEmail: 'noor@techsolutions.com',
  hostId: 'host_ext_1',
  host: mockExternalHost,
  purpose: 'Interview',
  location: 'CONFERENCE_ROOM_A',
  status: VisitStatus.pending,
  expectedDate: DateTime.parse('2026-02-14T09:00:00Z'),
  createdAt: DateTime.parse('2026-02-13T15:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T15:00:00Z'),
);

final mockRejectedVisit = Visit(
  id: 'visit_5',
  sessionId: null,
  visitorName: 'Ali Khan',
  visitorCompany: 'Unknown Co',
  visitorPhone: '97499991111',
  visitorEmail: 'ali@unknownco.com',
  hostId: 'host_staff_1',
  host: mockInternalHost,
  purpose: 'Sales Pitch',
  location: 'MEETING_ROOM_1',
  status: VisitStatus.rejected,
  expectedDate: DateTime.parse('2026-02-13T16:00:00Z'),
  rejectedAt: DateTime.parse('2026-02-13T15:30:00Z'),
  createdAt: DateTime.parse('2026-02-13T14:00:00Z'),
  updatedAt: DateTime.parse('2026-02-13T15:30:00Z'),
);

// ============================================================================
// Delivery Test Data
// ============================================================================

final mockDocumentDelivery = Delivery(
  id: 'delivery_1',
  deliveryType: 'Document',
  recipient: 'John Smith',
  hostId: 'host_ext_1',
  host: mockExternalHost,
  courier: 'DHL',
  location: 'MAIN_LOBBY',
  status: DeliveryStatus.received,
  notes: 'Important documents',
  receivedAt: DateTime.parse('2026-02-13T09:00:00Z'),
  createdAt: DateTime.parse('2026-02-13T09:00:00Z'),
);

final mockFoodDelivery = Delivery(
  id: 'delivery_2',
  deliveryType: 'Food',
  recipient: 'Sarah Johnson',
  hostId: 'host_staff_1',
  host: mockInternalHost,
  courier: 'Snoonu',
  location: 'CAFETERIA',
  status: DeliveryStatus.received,
  notes: 'Lunch order',
  receivedAt: DateTime.parse('2026-02-13T12:00:00Z'),
  createdAt: DateTime.parse('2026-02-13T11:30:00Z'),
);

final mockPickedUpDelivery = Delivery(
  id: 'delivery_3',
  deliveryType: 'Gift',
  recipient: 'Ahmed Ali',
  hostId: 'host_ext_1',
  host: mockExternalHost,
  courier: 'Talabat',
  location: 'EXECUTIVE_SUITE',
  status: DeliveryStatus.pickedUp,
  notes: 'Birthday gift',
  receivedAt: DateTime.parse('2026-02-13T08:00:00Z'),
  pickedUpAt: DateTime.parse('2026-02-13T09:30:00Z'),
  createdAt: DateTime.parse('2026-02-13T08:00:00Z'),
);

final mockPendingDelivery = Delivery(
  id: 'delivery_4',
  deliveryType: 'Document',
  recipient: 'Pending Recipient',
  hostId: 'host_ext_2',
  host: null,
  courier: 'FedEx',
  location: 'RECEPTION',
  status: DeliveryStatus.pending,
  notes: null,
  createdAt: DateTime.parse('2026-02-13T14:00:00Z'),
);

// ============================================================================
// Dashboard Test Data
// ============================================================================

final mockDashboardKpis = DashboardKpis(
  totalHosts: 15,
  visitsToday: 8,
  deliveriesToday: 5,
);

final mockPendingApproval = PendingApproval(
  id: 'visit_4',
  visitorName: 'Noor Abdullah',
  visitorPhone: '97477778888',
  hostName: 'John Smith',
  hostCompany: 'Tech Corp',
  expectedDate: DateTime.parse('2026-02-14T09:00:00Z'),
);

final mockCurrentVisitor = CurrentVisitor(
  id: 'visit_2',
  visitorName: 'Fatima Mohamed',
  visitorCompany: 'Import Ltd',
  hostName: 'Sarah Johnson',
  hostCompany: 'Arafat Group',
  checkInAt: DateTime.parse('2026-02-13T10:15:00Z'),
  sessionId: 'session_visit_2',
);

final mockReceivedDelivery = ReceivedDelivery(
  id: 'delivery_1',
  deliveryType: 'Document',
  recipient: 'John Smith',
  hostName: 'John Smith',
  hostCompany: 'Tech Corp',
  receivedAt: DateTime.parse('2026-02-13T09:00:00Z'),
);

// ============================================================================
// Lookup Test Data
// ============================================================================

final mockPurposeLookups = [
  const LookupPurpose(id: '1', name: 'Meeting'),
  const LookupPurpose(id: '2', name: 'Interview'),
  const LookupPurpose(id: '3', name: 'Delivery'),
  const LookupPurpose(id: '4', name: 'Training'),
  const LookupPurpose(id: '5', name: 'Other'),
];

final mockDeliveryTypeLookups = [
  const LookupDeliveryType(id: '1', name: 'Document'),
  const LookupDeliveryType(id: '2', name: 'Food'),
  const LookupDeliveryType(id: '3', name: 'Gift'),
];

final mockCourierLookups = [
  const LookupCourier(id: '1', name: 'DHL', category: 'PARCEL'),
  const LookupCourier(id: '2', name: 'FedEx', category: 'PARCEL'),
  const LookupCourier(id: '3', name: 'Aramex', category: 'PARCEL'),
  const LookupCourier(id: '4', name: 'Snoonu', category: 'FOOD'),
  const LookupCourier(id: '5', name: 'Keeta', category: 'FOOD'),
  const LookupCourier(id: '6', name: 'Talabat', category: 'FOOD'),
];

final mockLocationLookups = [
  const LookupLocation(id: '1', name: 'Main Lobby'),
  const LookupLocation(id: '2', name: 'Reception'),
  const LookupLocation(id: '3', name: 'Conference Room A'),
  const LookupLocation(id: '4', name: 'Conference Room B'),
  const LookupLocation(id: '5', name: 'Meeting Room 1'),
  const LookupLocation(id: '6', name: 'Meeting Room 2'),
  const LookupLocation(id: '7', name: 'Executive Suite'),
  const LookupLocation(id: '8', name: 'Cafeteria'),
  const LookupLocation(id: '9', name: 'Training Room'),
];

// ============================================================================
// Paginated Response Test Data
// ============================================================================

final mockVisitsPaginatedResponse = PaginatedResponse<Visit>(
  data: [mockApprovedVisit, mockCheckedInVisit, mockCheckedOutVisit],
  total: 25,
  page: 1,
  limit: 10,
  totalPages: 3,
);

final mockHostsPaginatedResponse = PaginatedResponse<Host>(
  data: [mockExternalHost, mockInternalHost],
  total: 15,
  page: 1,
  limit: 10,
  totalPages: 2,
);

final mockDeliveriesPaginatedResponse = PaginatedResponse<Delivery>(
  data: [mockDocumentDelivery, mockFoodDelivery, mockPickedUpDelivery],
  total: 12,
  page: 1,
  limit: 10,
  totalPages: 2,
);
