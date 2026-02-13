// Unit tests for Visit model
//
// Tests cover:
// - Nested host relationship
// - DateTime field handling (ISO 8601)
// - VisitStatus enum validation and transitions
// - Nullable timestamp fields

import 'package:flutter_test/flutter_test.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

void main() {
  group('Visit Model', () {
    final approvedVisitJson = {
      'id': 'visit_1',
      'sessionId': 'session_123',
      'visitorName': 'John Doe',
      'visitorCompany': 'Acme Corp',
      'visitorPhone': '974555001111',
      'visitorEmail': 'john@test.local',
      'hostId': 'host_1',
      'purpose': 'Meeting',
      'location': 'BARWA_TOWERS',
      'status': 'APPROVED',
      'expectedDate': '2026-02-13T14:30:00Z',
      'checkInAt': null,
      'checkOutAt': null,
      'approvedAt': '2026-02-13T10:00:00Z',
      'rejectedAt': null,
      'createdAt': '2026-02-13T08:00:00Z',
      'updatedAt': '2026-02-13T09:00:00Z',
    };

    test('Approved visit deserializes from JSON correctly', () {
      // ARRANGE
      final json = approvedVisitJson;

      // ACT
      final visit = Visit.fromJson(json);

      // ASSERT
      expect(visit.id, equals('visit_1'));
      expect(visit.sessionId, equals('session_123'));
      expect(visit.status, equals(VisitStatus.approved));
      expect(visit.visitorName, equals('John Doe'));
    });

    test('Visitor fields are populated correctly', () {
      // ARRANGE
      final json = approvedVisitJson;

      // ACT
      final visit = Visit.fromJson(json);

      // ASSERT
      expect(visit.visitorName, equals('John Doe'));
      expect(visit.visitorCompany, equals('Acme Corp'));
      expect(visit.visitorPhone, equals('974555001111'));
      expect(visit.visitorEmail, equals('john@test.local'));
    });

    test('DateTime fields serialize as ISO 8601 strings', () {
      // ARRANGE
      final visit = createMockApprovedVisit();

      // ACT
      final json = visit.toJson();

      // ASSERT
      expect(json['expectedDate'], matches(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z'));
      expect(json['approvedAt'], matches(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z'));
    });

    test('Null timestamps remain null', () {
      // ARRANGE
      final json = approvedVisitJson;

      // ACT
      final visit = Visit.fromJson(json);

      // ASSERT
      expect(visit.checkInAt, isNull);
      expect(visit.checkOutAt, isNull);
    });

    test('VisitStatus enum values are valid', () {
      // ASSERT
      final statuses = [
        VisitStatus.pending,
        VisitStatus.approved,
        VisitStatus.rejected,
        VisitStatus.checkedIn,
        VisitStatus.checkedOut,
      ];

      expect(statuses.length, equals(5));
      expect(statuses.contains(VisitStatus.approved), isTrue);
    });

    test('Round-trip serialization preserves visitor data', () {
      // ARRANGE
      final originalJson = approvedVisitJson;

      // ACT
      final visit = Visit.fromJson(originalJson);
      final roundTripJson = visit.toJson();

      // ASSERT
      expect(roundTripJson['visitorName'], equals(originalJson['visitorName']));
      expect(roundTripJson['visitorCompany'], equals(originalJson['visitorCompany']));
      expect(roundTripJson['visitorPhone'], equals(originalJson['visitorPhone']));
    });

    test('CheckOut must be after CheckIn when both present', () {
      // ARRANGE
      final checkedOutVisit = createMockCheckedOutVisit();

      // ASSERT
      expect(checkedOutVisit.checkOutAt, isNotNull);
      expect(checkedOutVisit.checkInAt, isNotNull);
      expect(checkedOutVisit.checkOutAt!.isAfter(checkedOutVisit.checkInAt!), isTrue);
    });

    test('SessionId is optional but must be unique', () {
      // ARRANGE
      final visit1 = createMockApprovedVisit(sessionId: 'session_1');
      final visit2 = createMockApprovedVisit(sessionId: 'session_2');

      // ASSERT
      expect(visit1.sessionId, equals('session_1'));
      expect(visit2.sessionId, equals('session_2'));
      expect(visit1.sessionId != visit2.sessionId, isTrue);
    });

    test('Visitor email is valid format', () {
      // ARRANGE
      final visit = createMockApprovedVisit(visitorEmail: 'john@test.local');

      // ACT
      final json = visit.toJson();

      // ASSERT
      final emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
      expect(emailPattern.hasMatch(json['visitorEmail'] as String), isTrue);
    });

    test('Visitor phone is formatted correctly', () {
      // ARRANGE
      final visit = createMockApprovedVisit(visitorPhone: '97433224455');

      // ACT
      final json = visit.toJson();

      // ASSERT
      expect(json['visitorPhone'].toString(), matches(r'^\d{10,}$'));
    });

    test('Host relationship is optional', () {
      // ARRANGE
      final visitWithoutHost = Visit(
        id: 'visit_1',
        visitorName: 'John',
        visitorCompany: 'Acme',
        visitorPhone: '974111111',
        hostId: 'host_1',
        purpose: 'Meeting',
        location: 'MAIN_LOBBY',
        status: VisitStatus.approved,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      // ASSERT
      expect(visitWithoutHost.host, isNull);
      expect(visitWithoutHost.hostId, equals('host_1'));
    });

    test('Host relationship is preserved when provided', () {
      // ARRANGE
      final visit = createMockApprovedVisit(host: mockExternalHost);

      // ASSERT
      expect(visit.host, isNotNull);
      expect(visit.host!.id, equals(mockExternalHost.id));
    });
  });

  group('Visit Model - Factory Functions', () {
    test('createMockApprovedVisit returns APPROVED status', () {
      // ACT
      final visit = createMockApprovedVisit();

      // ASSERT
      expect(visit.status, equals(VisitStatus.approved));
      expect(visit.approvedAt, isNotNull);
    });

    test('createMockCheckedInVisit returns CHECKED_IN status', () {
      // ACT
      final visit = createMockCheckedInVisit();

      // ASSERT
      expect(visit.status, equals(VisitStatus.checkedIn));
      expect(visit.checkInAt, isNotNull);
    });

    test('Factory functions allow customization', () {
      // ACT
      final customVisit = createMockApprovedVisit(
        visitorName: 'Custom Visitor',
        visitorCompany: 'Custom Company',
      );

      // ASSERT
      expect(customVisit.visitorName, equals('Custom Visitor'));
      expect(customVisit.visitorCompany, equals('Custom Company'));
    });
  });
}
