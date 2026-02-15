// Unit tests for Dashboard KPI and Lookup models
//
// Tests cover:
// - Dashboard KPI aggregation (DashboardKpis)
// - Dashboard list items (PendingApproval, CurrentVisitor, ReceivedDelivery)
// - PaginatedResponse<T> generic serialization
// - Lookup models (LookupPurpose, LookupDeliveryType, LookupCourier, LookupLocation)

import 'package:flutter_test/flutter_test.dart';
import 'package:arafatvisitor/core/models/dashboard.dart';
import 'package:arafatvisitor/core/models/lookup.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import '../../fixtures/models.dart';

void main() {
  group('DashboardKpis Model', () {
    final dashboardJson = {
      'totalHosts': 45,
      'visitsToday': 8,
      'deliveriesToday': 5,
    };

    test('Dashboard KPI deserializes correctly', () {
      // ARRANGE
      final json = dashboardJson;

      // ACT
      final kpis = DashboardKpis.fromJson(json);

      // ASSERT
      expect(kpis.totalHosts, equals(45));
      expect(kpis.visitsToday, equals(8));
      expect(kpis.deliveriesToday, equals(5));
    });

    test('All KPI counts are non-negative integers', () {
      // ARRANGE
      final kpis = mockDashboardKpis;

      // ASSERT
      expect(kpis.totalHosts >= 0, isTrue);
      expect(kpis.visitsToday >= 0, isTrue);
      expect(kpis.deliveriesToday >= 0, isTrue);
    });

    test('Round-trip serialization preserves KPI data', () {
      // ARRANGE
      final originalJson = dashboardJson;

      // ACT
      final kpis = DashboardKpis.fromJson(originalJson);
      final roundTripJson = kpis.toJson();

      // ASSERT
      expect(roundTripJson['totalHosts'], equals(originalJson['totalHosts']));
      expect(roundTripJson['visitsToday'], equals(originalJson['visitsToday']));
      expect(roundTripJson['deliveriesToday'], equals(originalJson['deliveriesToday']));
    });
  });

  group('PendingApproval Model', () {
    final pendingApprovalJson = {
      'id': 'visit_4',
      'visitorName': 'Noor Abdullah',
      'visitorPhone': '97477778888',
      'hostName': 'John Smith',
      'hostCompany': 'Tech Corp',
      'expectedDate': '2026-02-14T09:00:00Z',
    };

    test('PendingApproval deserializes correctly', () {
      // ARRANGE
      final json = pendingApprovalJson;

      // ACT
      final approval = PendingApproval.fromJson(json);

      // ASSERT
      expect(approval.id, equals('visit_4'));
      expect(approval.visitorName, equals('Noor Abdullah'));
      expect(approval.visitorPhone, equals('97477778888'));
    });

    test('Host information is populated', () {
      // ARRANGE
      final approval = mockPendingApproval;

      // ASSERT
      expect(approval.hostName, equals('John Smith'));
      expect(approval.hostCompany, equals('Tech Corp'));
    });
  });

  group('CurrentVisitor Model', () {
    final currentVisitorJson = {
      'id': 'visit_2',
      'visitorName': 'Fatima Mohamed',
      'visitorCompany': 'Import Ltd',
      'hostName': 'Sarah Johnson',
      'hostCompany': 'Arafat Group',
      'checkInAt': '2026-02-13T10:15:00Z',
      'sessionId': 'session_visit_2',
    };

    test('CurrentVisitor deserializes correctly', () {
      // ARRANGE
      final json = currentVisitorJson;

      // ACT
      final visitor = CurrentVisitor.fromJson(json);

      // ASSERT
      expect(visitor.id, equals('visit_2'));
      expect(visitor.visitorName, equals('Fatima Mohamed'));
      expect(visitor.visitorCompany, equals('Import Ltd'));
    });

    test('Check-in timestamp is preserved', () {
      // ARRANGE
      final visitor = mockCurrentVisitor;

      // ASSERT
      expect(visitor.checkInAt, isNotNull);
      expect(visitor.checkInAt.toString(), contains('10:15'));
    });
  });

  group('ReceivedDelivery Model', () {
    final receivedDeliveryJson = {
      'id': 'delivery_1',
      'deliveryType': 'Document',
      'recipient': 'John Smith',
      'hostName': 'John Smith',
      'hostCompany': 'Tech Corp',
      'receivedAt': '2026-02-13T09:00:00Z',
    };

    test('ReceivedDelivery deserializes correctly', () {
      // ARRANGE
      final json = receivedDeliveryJson;

      // ACT
      final delivery = ReceivedDelivery.fromJson(json);

      // ASSERT
      expect(delivery.id, equals('delivery_1'));
      expect(delivery.deliveryType, equals('Document'));
      expect(delivery.recipient, equals('John Smith'));
    });

    test('Received timestamp is preserved', () {
      // ARRANGE
      final delivery = mockReceivedDelivery;

      // ASSERT
      expect(delivery.receivedAt, isNotNull);
      expect(delivery.receivedAt.toString(), contains('09:00'));
    });
  });

  group('Lookup Models', () {
    test('LookupPurpose deserializes correctly', () {
      // ARRANGE
      final json = {'id': '1', 'name': 'Meeting'};

      // ACT
      final purpose = LookupPurpose.fromJson(json);

      // ASSERT
      expect(purpose.id, equals('1'));
      expect(purpose.name, equals('Meeting'));
    });

    test('LookupDeliveryType deserializes correctly', () {
      // ARRANGE
      final json = {'id': '1', 'name': 'Document'};

      // ACT
      final deliveryType = LookupDeliveryType.fromJson(json);

      // ASSERT
      expect(deliveryType.id, equals('1'));
      expect(deliveryType.name, equals('Document'));
    });

    test('LookupCourier deserializes with category', () {
      // ARRANGE
      final json = {'id': '1', 'name': 'DHL', 'category': 'PARCEL'};

      // ACT
      final courier = LookupCourier.fromJson(json);

      // ASSERT
      expect(courier.id, equals('1'));
      expect(courier.name, equals('DHL'));
      expect(courier.category, equals('PARCEL'));
    });

    test('Lookup lists from fixtures are valid', () {
      // ASSERT
      expect(mockPurposeLookups, isNotEmpty);
      expect(mockDeliveryTypeLookups, isNotEmpty);
      expect(mockCourierLookups, isNotEmpty);
      expect(mockLocationLookups, isNotEmpty);
    });
  });

  group('PaginatedResponse Generic', () {
    test('PaginatedResponse<Visit> deserializes correctly', () {
      // ASSERT
      expect(mockVisitsPaginatedResponse.data, isNotEmpty);
      expect(mockVisitsPaginatedResponse.total, equals(25));
      expect(mockVisitsPaginatedResponse.page, equals(1));
      expect(mockVisitsPaginatedResponse.totalPages, equals(3));
    });

    test('PaginatedResponse<Host> deserializes correctly', () {
      // ASSERT
      expect(mockHostsPaginatedResponse.data, isNotEmpty);
      expect(mockHostsPaginatedResponse.total, equals(15));
      expect(mockHostsPaginatedResponse.totalPages, equals(2));
    });

    test('PaginatedResponse<Delivery> deserializes correctly', () {
      // ASSERT
      expect(mockDeliveriesPaginatedResponse.data, isNotEmpty);
      expect(mockDeliveriesPaginatedResponse.total, equals(12));
    });

    test('Page number must be >= 1', () {
      // ASSERT
      expect(mockVisitsPaginatedResponse.page >= 1, isTrue);
      expect(mockHostsPaginatedResponse.page >= 1, isTrue);
    });

    test('Limit must be > 0', () {
      // ASSERT
      expect(mockVisitsPaginatedResponse.limit > 0, isTrue);
      expect(mockDeliveriesPaginatedResponse.limit > 0, isTrue);
    });

    test('TotalPages is calculated correctly', () {
      // ARRANGE
      final response = mockVisitsPaginatedResponse;

      // ACT
      final expectedPages = (response.total / response.limit).ceil();

      // ASSERT
      expect(response.totalPages, equals(expectedPages));
    });
  });
}
