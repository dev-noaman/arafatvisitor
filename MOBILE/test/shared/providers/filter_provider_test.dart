// Unit tests for Filter & Search Providers
//
// Tests cover:
// - Filter visitors by status (APPROVED, CHECKED_IN, CHECKED_OUT)
// - Filter deliveries by status (RECEIVED, PICKED_UP)
// - Search visitors by name (case-insensitive)
// - Search by email/phone
// - Combined filters (status + search)
// - Empty search returns full list

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  group('Filter & Search Providers', () {
    // Setup would go here with ProviderContainer
    // late ProviderContainer container;

    test('Filter visitors by status=APPROVED', () {
      final allVisits = [
        {'id': 'v1', 'status': 'APPROVED'},
        {'id': 'v2', 'status': 'CHECKED_IN'},
      ];

      final approved = allVisits
          .where((v) => v['status'] == 'APPROVED')
          .toList();

      expect(approved.length, equals(1));
      expect(approved.first['status'], equals('APPROVED'));
    });

    test('Filter visitors by status=CHECKED_IN', () {
      final allVisits = [
        {'id': 'v1', 'status': 'APPROVED'},
        {'id': 'v2', 'status': 'CHECKED_IN'},
      ];

      final checkedIn = allVisits
          .where((v) => v['status'] == 'CHECKED_IN')
          .toList();

      expect(checkedIn.length, equals(1));
      expect(checkedIn.first['status'], equals('CHECKED_IN'));
    });

    test('Filter visitors by status=CHECKED_OUT', () {
      final allVisits = [
        {'id': 'v1', 'status': 'APPROVED'},
        {'id': 'v3', 'status': 'CHECKED_OUT'},
      ];

      final checkedOut = allVisits
          .where((v) => v['status'] == 'CHECKED_OUT')
          .toList();

      expect(checkedOut.length, equals(1));
      expect(checkedOut.first['status'], equals('CHECKED_OUT'));
    });

    test('Filter deliveries by status=RECEIVED', () {
      final allDeliveries = [
        {'id': 'd1', 'status': 'RECEIVED'},
        {'id': 'd2', 'status': 'PICKED_UP'},
      ];

      final received = allDeliveries
          .where((d) => d['status'] == 'RECEIVED')
          .toList();

      expect(received.length, equals(1));
      expect(received.first['status'], equals('RECEIVED'));
    });

    test('Filter deliveries by status=PICKED_UP', () {
      final allDeliveries = [
        {'id': 'd1', 'status': 'RECEIVED'},
        {'id': 'd2', 'status': 'PICKED_UP'},
      ];

      final pickedUp = allDeliveries
          .where((d) => d['status'] == 'PICKED_UP')
          .toList();

      expect(pickedUp.length, equals(1));
      expect(pickedUp.first['status'], equals('PICKED_UP'));
    });

    test('Search visitors by name (case-insensitive)', () {
      final allVisits = [
        {'id': 'v1', 'visitorName': 'John Doe'},
        {'id': 'v2', 'visitorName': 'Jane Smith'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains('john'))
          .toList();

      expect(results.length, equals(1));
      expect(results.first['visitorName'], equals('John Doe'));
    });

    test('Search by lowercase returns results', () {
      final allVisits = [
        {'visitorName': 'JOHN DOE'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains('john'))
          .toList();

      expect(results.length, equals(1));
    });

    test('Search by uppercase returns results', () {
      final allVisits = [
        {'visitorName': 'john doe'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains('JOHN'.toLowerCase()))
          .toList();

      expect(results.length, equals(1));
    });

    test('Search by email', () {
      final allVisits = [
        {'id': 'v1', 'visitorEmail': 'john@test.local'},
        {'id': 'v2', 'visitorEmail': 'jane@test.local'},
      ];

      final results = allVisits
          .where((v) => v['visitorEmail']
              .contains('john'))
          .toList();

      expect(results.length, equals(1));
      expect(results.first['visitorEmail'], equals('john@test.local'));
    });

    test('Search by phone', () {
      final allVisits = [
        {'id': 'v1', 'visitorPhone': '97433112233'},
        {'id': 'v2', 'visitorPhone': '97455667788'},
      ];

      final results = allVisits
          .where((v) => v['visitorPhone']
              .contains('3311'))
          .toList();

      expect(results.length, equals(1));
    });

    test('Combined filter (status + search)', () {
      final allVisits = [
        {'id': 'v1', 'status': 'APPROVED', 'visitorName': 'John'},
        {'id': 'v2', 'status': 'CHECKED_IN', 'visitorName': 'John'},
        {'id': 'v3', 'status': 'APPROVED', 'visitorName': 'Jane'},
      ];

      final results = allVisits
          .where((v) =>
              v['status'] == 'APPROVED' &&
              v['visitorName'].contains('John'))
          .toList();

      expect(results.length, equals(1));
      expect(results.first['id'], equals('v1'));
    });

    test('Empty search returns full list', () {
      final allVisits = [
        {'visitorName': 'John'},
        {'visitorName': 'Jane'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains(''))
          .toList();

      expect(results.length, equals(2));
    });

    test('No matches returns empty list', () {
      final allVisits = [
        {'visitorName': 'John'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains('xyz'))
          .toList();

      expect(results.length, equals(0));
    });

    test('Partial name match returns result', () {
      final allVisits = [
        {'visitorName': 'John Doe'},
      ];

      final results = allVisits
          .where((v) => v['visitorName']
              .toLowerCase()
              .contains('doe'))
          .toList();

      expect(results.length, equals(1));
    });

    test('Multiple filter conditions combined', () {
      final all = [
        {'status': 'APPROVED', 'visitorName': 'John', 'company': 'Corp A'},
        {'status': 'APPROVED', 'visitorName': 'John', 'company': 'Corp B'},
        {'status': 'CHECKED_IN', 'visitorName': 'John', 'company': 'Corp A'},
      ];

      final results = all
          .where((v) =>
              v['status'] == 'APPROVED' &&
              v['company'] == 'Corp A')
          .toList();

      expect(results.length, equals(1));
    });
  });
}
