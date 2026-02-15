// Test factories - advanced fixture creation with customization

export 'models.dart';

import 'package:arafatvisitor/core/models/user.dart';
import 'package:arafatvisitor/core/models/host.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/core/models/delivery.dart';

// ============================================================================
// User Factory Functions
// ============================================================================

/// Create an admin user with optional customization
User createMockAdminUser({
  String id = 'user_admin_1',
  String email = 'admin@test.local',
  String name = 'Admin User',
  String? hostId,
  String? accessToken,
  String? refreshToken,
}) {
  return User(
    id: id,
    email: email,
    name: name,
    role: UserRole.admin,
    hostId: hostId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  );
}

/// Create a reception user with optional customization
User createMockReceptionUser({
  String id = 'user_reception_1',
  String email = 'reception@test.local',
  String name = 'Reception User',
  String? hostId,
  String? accessToken,
  String? refreshToken,
}) {
  return User(
    id: id,
    email: email,
    name: name,
    role: UserRole.reception,
    hostId: hostId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  );
}

/// Create a host user with optional customization
User createMockHostUser({
  String id = 'user_host_1',
  String email = 'host@test.local',
  String name = 'Host User',
  String hostId = 'host_ext_1',
  String? accessToken,
  String? refreshToken,
}) {
  return User(
    id: id,
    email: email,
    name: name,
    role: UserRole.host,
    hostId: hostId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  );
}

/// Create a staff user with optional customization
User createMockStaffUser({
  String id = 'user_staff_1',
  String email = 'staff@test.local',
  String name = 'Staff User',
  String hostId = 'host_staff_1',
  String? accessToken,
  String? refreshToken,
}) {
  return User(
    id: id,
    email: email,
    name: name,
    role: UserRole.staff,
    hostId: hostId,
    accessToken: accessToken,
    refreshToken: refreshToken,
  );
}

// ============================================================================
// Host Factory Functions
// ============================================================================

/// Create an external host with optional customization
Host createMockExternalHost({
  String id = 'host_ext_1',
  String externalId = 'external_123',
  String name = 'John Smith',
  String company = 'Tech Corp',
  String email = 'john.smith@techcorp.com',
  String phone = '97433112233',
  Location location = Location.mainLobby,
  HostStatus status = HostStatus.active,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  return Host(
    id: id,
    externalId: externalId,
    name: name,
    company: company,
    email: email,
    phone: phone,
    location: location,
    status: status,
    type: HostType.external,
    createdAt: createdAt ?? DateTime.parse('2026-02-01T10:00:00Z'),
    updatedAt: updatedAt ?? DateTime.parse('2026-02-13T14:00:00Z'),
  );
}

/// Create an internal/staff host with optional customization
Host createMockInternalHost({
  String id = 'host_staff_1',
  String externalId = 'internal_456',
  String name = 'Sarah Johnson',
  String company = 'Arafat Group',
  String email = 'sarah@arafatgroup.com',
  String phone = '97455667788',
  Location location = Location.reception,
  HostStatus status = HostStatus.active,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  return Host(
    id: id,
    externalId: externalId,
    name: name,
    company: company,
    email: email,
    phone: phone,
    location: location,
    status: status,
    type: HostType.internal,
    createdAt: createdAt ?? DateTime.parse('2026-02-01T10:00:00Z'),
    updatedAt: updatedAt ?? DateTime.parse('2026-02-13T14:00:00Z'),
  );
}

// ============================================================================
// Visit Factory Functions
// ============================================================================

/// Create an approved visit with optional customization
Visit createMockApprovedVisit({
  String id = 'visit_1',
  String? sessionId,
  String visitorName = 'Ahmed Ali',
  String visitorCompany = 'Export Co',
  String visitorPhone = '97433224455',
  String? visitorEmail,
  String hostId = 'host_ext_1',
  Host? host,
  String purpose = 'Meeting',
  String location = 'MAIN_LOBBY',
  DateTime? expectedDate,
  DateTime? approvedAt,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  return Visit(
    id: id,
    sessionId: sessionId,
    visitorName: visitorName,
    visitorCompany: visitorCompany,
    visitorPhone: visitorPhone,
    visitorEmail: visitorEmail,
    hostId: hostId,
    host: host,
    purpose: purpose,
    location: location,
    status: VisitStatus.approved,
    expectedDate: expectedDate ?? DateTime.parse('2026-02-13T14:00:00Z'),
    approvedAt: approvedAt ?? DateTime.parse('2026-02-13T09:00:00Z'),
    createdAt: createdAt ?? DateTime.parse('2026-02-13T08:00:00Z'),
    updatedAt: updatedAt ?? DateTime.parse('2026-02-13T09:00:00Z'),
  );
}

/// Create a checked-in visit with optional customization
Visit createMockCheckedInVisit({
  String id = 'visit_2',
  String? sessionId,
  String visitorName = 'Fatima Mohamed',
  String visitorCompany = 'Import Ltd',
  String visitorPhone = '97455661122',
  String? visitorEmail,
  String hostId = 'host_staff_1',
  Host? host,
  String purpose = 'Delivery',
  String location = 'RECEPTION',
  DateTime? expectedDate,
  DateTime? approvedAt,
  DateTime? checkInAt,
  DateTime? createdAt,
  DateTime? updatedAt,
}) {
  return Visit(
    id: id,
    sessionId: sessionId,
    visitorName: visitorName,
    visitorCompany: visitorCompany,
    visitorPhone: visitorPhone,
    visitorEmail: visitorEmail,
    hostId: hostId,
    host: host,
    purpose: purpose,
    location: location,
    status: VisitStatus.checkedIn,
    expectedDate: expectedDate ?? DateTime.parse('2026-02-13T10:00:00Z'),
    approvedAt: approvedAt ?? DateTime.parse('2026-02-13T09:30:00Z'),
    checkInAt: checkInAt ?? DateTime.parse('2026-02-13T10:15:00Z'),
    createdAt: createdAt ?? DateTime.parse('2026-02-13T08:30:00Z'),
    updatedAt: updatedAt ?? DateTime.parse('2026-02-13T10:15:00Z'),
  );
}

// ============================================================================
// Delivery Factory Functions
// ============================================================================

/// Create a document delivery with optional customization
Delivery createMockDocumentDelivery({
  String id = 'delivery_1',
  String recipient = 'John Smith',
  String hostId = 'host_ext_1',
  Host? host,
  String courier = 'DHL',
  String location = 'MAIN_LOBBY',
  String? notes,
  DateTime? receivedAt,
  DateTime? createdAt,
}) {
  return Delivery(
    id: id,
    deliveryType: 'Document',
    recipient: recipient,
    hostId: hostId,
    host: host,
    courier: courier,
    location: location,
    status: DeliveryStatus.received,
    notes: notes,
    receivedAt: receivedAt ?? DateTime.parse('2026-02-13T09:00:00Z'),
    createdAt: createdAt ?? DateTime.parse('2026-02-13T09:00:00Z'),
  );
}

/// Create a food delivery with optional customization
Delivery createMockFoodDelivery({
  String id = 'delivery_2',
  String recipient = 'Sarah Johnson',
  String hostId = 'host_staff_1',
  Host? host,
  String courier = 'Snoonu',
  String location = 'CAFETERIA',
  String? notes,
  DateTime? receivedAt,
  DateTime? createdAt,
}) {
  return Delivery(
    id: id,
    deliveryType: 'Food',
    recipient: recipient,
    hostId: hostId,
    host: host,
    courier: courier,
    location: location,
    status: DeliveryStatus.received,
    notes: notes,
    receivedAt: receivedAt ?? DateTime.parse('2026-02-13T12:00:00Z'),
    createdAt: createdAt ?? DateTime.parse('2026-02-13T11:30:00Z'),
  );
}

/// Create a picked-up delivery with optional customization
Delivery createMockPickedUpDelivery({
  String id = 'delivery_3',
  String recipient = 'Ahmed Ali',
  String hostId = 'host_ext_1',
  Host? host,
  String courier = 'Talabat',
  String location = 'EXECUTIVE_SUITE',
  String? notes,
  DateTime? receivedAt,
  DateTime? pickedUpAt,
  DateTime? createdAt,
}) {
  return Delivery(
    id: id,
    deliveryType: 'Gift',
    recipient: recipient,
    hostId: hostId,
    host: host,
    courier: courier,
    location: location,
    status: DeliveryStatus.pickedUp,
    notes: notes,
    receivedAt: receivedAt ?? DateTime.parse('2026-02-13T08:00:00Z'),
    pickedUpAt: pickedUpAt ?? DateTime.parse('2026-02-13T09:30:00Z'),
    createdAt: createdAt ?? DateTime.parse('2026-02-13T08:00:00Z'),
  );
}

// ============================================================================
// Response Helpers
// ============================================================================

/// Helper to create auth response with tokens
Map<String, dynamic> createMockAuthResponse({
  String? userId,
  String? email,
  String? name,
  String? accessToken,
  String? refreshToken,
  String? role,
}) {
  return {
    'user': {
      'id': userId ?? 'user_1',
      'email': email ?? 'user@test.local',
      'name': name ?? 'Test User',
      'role': role ?? 'ADMIN',
      'status': 'ACTIVE',
    },
    'accessToken': accessToken ?? 'test_jwt_token_access_12345',
    'refreshToken': refreshToken ?? 'test_jwt_token_refresh_67890',
    'expiresIn': 900, // 15 minutes
  };
}

/// Helper to create validation error response
Map<String, dynamic> createValidationErrorResponse({
  String? field,
  String? message,
}) {
  return {
    'statusCode': 400,
    'message': 'Validation Error',
    'errors': {
      field ?? 'email': [message ?? 'Invalid format'],
    },
  };
}

/// Helper to create server error response
Map<String, dynamic> createServerErrorResponse({
  int statusCode = 500,
  String? message,
}) {
  return {
    'statusCode': statusCode,
    'message': message ?? 'Internal Server Error',
    'timestamp': '2026-02-13T14:30:00Z',
  };
}

/// Helper to create paginated response
Map<String, dynamic> createPaginatedResponse<T>({
  required List<T> items,
  required int total,
  int page = 1,
  int pageSize = 20,
}) {
  return {
    'items': items,
    'total': total,
    'page': page,
    'pageSize': pageSize,
    'hasMore': (page * pageSize) < total,
  };
}

/// Helper to create dashboard KPI response
Map<String, dynamic> createMockDashboardKpis({
  int totalHosts = 45,
  int totalVisitors = 128,
  int totalDeliveries = 32,
  int checkedInCount = 8,
  int pendingApprovalsCount = 3,
  int receivedDeliveriesCount = 5,
}) {
  return {
    'totalHosts': totalHosts,
    'totalVisitors': totalVisitors,
    'totalDeliveries': totalDeliveries,
    'checkedInCount': checkedInCount,
    'pendingApprovalsCount': pendingApprovalsCount,
    'receivedDeliveriesCount': receivedDeliveriesCount,
  };
}

/// Helper to create lookup response
List<Map<String, dynamic>> createMockLookups({
  String? category,
}) {
  const purposes = [
    {'id': 'purpose_1', 'name': 'Meeting', 'category': null},
    {'id': 'purpose_2', 'name': 'Interview', 'category': null},
    {'id': 'purpose_3', 'name': 'Delivery', 'category': null},
    {'id': 'purpose_4', 'name': 'Maintenance', 'category': null},
  ];

  const deliveryTypes = [
    {'id': 'type_1', 'name': 'Document', 'category': 'PARCEL'},
    {'id': 'type_2', 'name': 'Food', 'category': 'FOOD'},
    {'id': 'type_3', 'name': 'Gift', 'category': 'PARCEL'},
  ];

  const couriers = [
    {'id': 'courier_1', 'name': 'DHL', 'category': 'PARCEL'},
    {'id': 'courier_2', 'name': 'FedEx', 'category': 'PARCEL'},
    {'id': 'courier_3', 'name': 'Aramex', 'category': 'PARCEL'},
    {'id': 'courier_4', 'name': 'Snoonu', 'category': 'FOOD'},
    {'id': 'courier_5', 'name': 'Talabat', 'category': 'FOOD'},
    {'id': 'courier_6', 'name': 'Keeta', 'category': 'FOOD'},
  ];

  final List<Map<String, dynamic>> lookups = [];

  if (category == null || category == 'purpose') {
    lookups.addAll(purposes);
  }
  if (category == null || category == 'deliveryType') {
    lookups.addAll(deliveryTypes);
  }
  if (category == null || category == 'courier') {
    lookups.addAll(couriers);
  }

  return lookups;
}

/// Helper to create location lookup
List<Map<String, dynamic>> createMockLocations() {
  return [
    {'id': 'loc_1', 'name': 'Barwa Towers', 'value': 'BARWA_TOWERS'},
    {'id': 'loc_2', 'name': 'Marina 50', 'value': 'MARINA_50'},
    {'id': 'loc_3', 'name': 'Element Mariott', 'value': 'ELEMENT_MARIOTT'},
  ];
}

/// Helper to create pre-registration with user data
Map<String, dynamic> createMockPreRegistration({
  String? id,
  String? visitorName,
  String? visitorEmail,
  String? visitorPhone,
  String? hostId,
  String? status,
  String? scheduledDate,
}) {
  return {
    'id': id ?? 'pre_reg_1',
    'visitorName': visitorName ?? 'Pre-Register Visitor',
    'visitorEmail': visitorEmail ?? 'pre_reg@test.local',
    'visitorPhone': visitorPhone ?? '974555007777',
    'hostId': hostId ?? 'external_host_1',
    'purpose': 'Meeting',
    'location': 'BARWA_TOWERS',
    'status': status ?? 'PENDING_APPROVAL',
    'scheduledDate': scheduledDate ?? '2026-02-14T10:00:00Z',
    'createdAt': '2026-02-13T10:00:00Z',
    'approvedAt': null,
    'rejectedAt': null,
  };
}

/// Helper to create QR pass response
Map<String, dynamic> createMockQrPass({
  String? sessionId,
  String? visitorName,
  String? visitorCompany,
  String? hostName,
  String? hostCompany,
  String? purpose,
  String? location,
  String? status,
}) {
  return {
    'sessionId': sessionId ?? 'session_qr_123',
    'visitor': {
      'name': visitorName ?? 'John Doe',
      'company': visitorCompany ?? 'Acme Corp',
      'phone': '974555001111',
      'email': 'john@test.local',
    },
    'host': {
      'name': hostName ?? 'Jane Host',
      'company': hostCompany ?? 'Tech Corp',
      'phone': '974555001234',
    },
    'purpose': purpose ?? 'Meeting',
    'location': location ?? 'BARWA_TOWERS',
    'status': status ?? 'APPROVED',
    'expectedDate': '2026-02-13T14:30:00Z',
    'checkInAt': null,
    'checkOutAt': null,
  };
}

/// Helper to create form validation error
Map<String, dynamic> createFormValidationError({
  required String fieldName,
  required String errorMessage,
}) {
  return {
    'field': fieldName,
    'message': errorMessage,
  };
}

/// Helper to create notification event payload
Map<String, dynamic> createMockNotificationEvent({
  required String eventType,
  Map<String, dynamic>? data,
}) {
  return {
    'type': eventType,
    'data': data ?? {},
    'timestamp': '2026-02-13T14:30:00Z',
  };
}

/// Helper to create WebSocket message
Map<String, dynamic> createMockWebSocketMessage({
  required String eventName,
  Map<String, dynamic>? payload,
}) {
  return {
    'event': eventName,
    'payload': payload ?? {},
  };
}

/// Helper to create permission check result
Map<String, bool> createPermissionMatrix({
  required String userId,
  required String userRole,
  String? userCompanyId,
}) {
  final isAdmin = userRole == 'ADMIN';
  final isHost = userRole == 'HOST';
  final isStaff = userRole == 'STAFF';
  final isReception = userRole == 'RECEPTION';
  final isCompanyScoped = (isHost || isStaff);

  return {
    'canApproveVisit': isAdmin || isHost || isStaff,
    'canCreateVisitor': isAdmin || isReception || isHost || isStaff,
    'canDeleteVisitor': isAdmin,
    'canEditDelivery': isAdmin || isReception,
    'canPickUpDelivery': isAdmin || isReception || isHost || isStaff,
    'canDeleteDelivery': isAdmin,
    'isCompanyScoped': isCompanyScoped,
  };
}

/// Test data builder class for complex scenarios
class TestDataBuilder {
  final Map<String, dynamic> _data = {};

  /// Add user to test data
  TestDataBuilder withUser({
    String? id,
    String? email,
    String? role,
    String? status,
  }) {
    _data['user'] = {
      'id': id ?? 'user_1',
      'email': email ?? 'user@test.local',
      'name': 'Test User',
      'role': role ?? 'ADMIN',
      'status': status ?? 'ACTIVE',
      'hostId': null,
    };
    return this;
  }

  /// Add host to test data
  TestDataBuilder withHost({
    String? id,
    String? name,
    String? company,
    String? type,
  }) {
    _data['host'] = {
      'id': id ?? 'host_1',
      'name': name ?? 'Host Company',
      'company': company ?? 'Test Company',
      'email': 'host@test.local',
      'phone': '974555001234',
      'location': 'BARWA_TOWERS',
      'type': type ?? 'EXTERNAL',
      'status': 'ACTIVE',
    };
    return this;
  }

  /// Add visits to test data
  TestDataBuilder withVisits(int count, {String? status}) {
    _data['visits'] = createMockVisits(count, status: status);
    return this;
  }

  /// Add deliveries to test data
  TestDataBuilder withDeliveries(int count) {
    _data['deliveries'] = List.generate(
      count,
      (i) => {
        'id': 'delivery_$i',
        'deliveryType': i % 3 == 0 ? 'DOCUMENT' : i % 3 == 1 ? 'FOOD' : 'GIFT',
        'recipient': 'Recipient $i',
        'hostId': 'host_1',
        'courier': 'DHL',
        'location': 'BARWA_TOWERS',
        'status': i % 2 == 0 ? 'RECEIVED' : 'PICKED_UP',
        'receivedAt': '2026-02-13T09:00:00Z',
        'pickedUpAt': i % 2 == 0 ? null : '2026-02-13T10:00:00Z',
      },
    );
    return this;
  }

  /// Build the test data
  Map<String, dynamic> build() {
    return _data;
  }
}
