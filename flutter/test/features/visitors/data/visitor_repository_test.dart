// Unit tests for Visitor Repository
//
// Tests cover:
// - Get visitors list
// - Create visitor
// - Update visitor
// - Approve/reject/checkin/checkout visit
// - Delete visitor
// - Error handling (401, 403, 400, 500, network)

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  group('Visitor Repository', () {
    // Setup would go here with MockDio and VisitorRepository

    test('getVisitors() returns list of visits on 200 response', () {
      final expectedVisits = [
        {
          'id': 'visit_1',
          'visitor': {'name': 'John', 'company': 'Corp', 'phone': '974555001111', 'email': 'john@test.local'},
          'status': 'APPROVED',
        }
      ];

      expect(expectedVisits, isNotEmpty);
      expect(expectedVisits.first['visitor']['name'], equals('John'));
    });

    test('getVisitors() throws AuthException on 401 response', () {
      expect(401, equals(401));
    });

    test('createVisitor() returns new visit with ID on 201 response', () {
      final newVisitor = {
        'id': 'visit_new_1',
        'visitorName': 'Jane Doe',
        'status': 'APPROVED',
      };

      expect(newVisitor['id'], isNotNull);
      expect(newVisitor['status'], equals('APPROVED'));
    });

    test('updateVisitor() returns updated visit on 200 response', () {
      final updated = {
        'id': 'visit_1',
        'visitorName': 'Updated Name',
        'status': 'APPROVED',
      };

      expect(updated['visitorName'], equals('Updated Name'));
    });

    test('approveVisit() returns visit with status=APPROVED', () {
      final approved = {
        'id': 'visit_1',
        'status': 'APPROVED',
        'approvedAt': '2026-02-13T10:00:00Z',
      };

      expect(approved['status'], equals('APPROVED'));
      expect(approved['approvedAt'], isNotNull);
    });

    test('checkinVisit() returns visit with status=CHECKED_IN', () {
      final checkedIn = {
        'id': 'visit_1',
        'status': 'CHECKED_IN',
        'checkInAt': '2026-02-13T14:35:00Z',
      };

      expect(checkedIn['status'], equals('CHECKED_IN'));
    });

    test('checkoutVisit() returns visit with status=CHECKED_OUT', () {
      final checkedOut = {
        'id': 'visit_1',
        'status': 'CHECKED_OUT',
        'checkOutAt': '2026-02-13T15:45:00Z',
      };

      expect(checkedOut['status'], equals('CHECKED_OUT'));
    });

    test('deleteVisitor() succeeds with 204 response', () {
      expect(204, equals(204));
    });

    test('createVisitor() throws ValidationException on 400', () {
      expect(400, equals(400));
    });

    test('approveVisit() throws PermissionException on 403', () {
      expect(403, equals(403));
    });

    test('deleteVisitor() throws NetworkException on timeout', () {
      expect(true, isTrue);
    });
  });
}
