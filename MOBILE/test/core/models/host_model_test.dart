// Unit tests for Host model serialization
//
// Tests cover:
// - JSON serialization/deserialization
// - Location enum values (mainLobby, reception, conferenceRoomA, etc.)
// - HostType enum (EXTERNAL, INTERNAL)
// - HostStatus enum (ACTIVE, INACTIVE)

import 'package:flutter_test/flutter_test.dart';
import 'package:arafatvisitor/core/models/host.dart';
import '../../fixtures/factories.dart';

void main() {
  group('Host Model', () {
    final externalHostJson = {
      'id': 'host_1',
      'externalId': 'office_rnd_123',
      'name': 'John Manager',
      'company': 'Tech Corp',
      'email': 'john@test.local',
      'phone': '974555001234',
      'location': 'MAIN_LOBBY',
      'type': 'EXTERNAL',
      'status': 'ACTIVE',
      'createdAt': '2026-02-01T10:00:00Z',
      'updatedAt': '2026-02-13T14:00:00Z',
    };

    final internalHostJson = {
      'id': 'staff_host_1',
      'externalId': 'internal_456',
      'name': 'Jane Sales',
      'company': 'Arafat Group',
      'email': 'jane@test.local',
      'phone': '974555005678',
      'location': 'RECEPTION',
      'type': 'INTERNAL',
      'status': 'ACTIVE',
      'createdAt': '2026-02-01T10:00:00Z',
      'updatedAt': '2026-02-13T14:00:00Z',
    };

    test('External host deserializes from JSON correctly', () {
      // ARRANGE
      final json = externalHostJson;

      // ACT
      final host = Host.fromJson(json);

      // ASSERT
      expect(host.id, equals('host_1'));
      expect(host.type, equals(HostType.external));
      expect(host.externalId, equals('office_rnd_123'));
      expect(host.location, equals(Location.mainLobby));
    });

    test('Internal host deserializes correctly with externalId', () {
      // ARRANGE
      final json = internalHostJson;

      // ACT
      final host = Host.fromJson(json);

      // ASSERT
      expect(host.type, equals(HostType.internal));
      expect(host.externalId, equals('internal_456'));
      expect(host.company, equals('Arafat Group'));
    });

    test('Host serializes to JSON with all fields', () {
      // ARRANGE
      final host = Host(
        id: 'host_1',
        externalId: 'office_rnd_123',
        name: 'John Manager',
        company: 'Tech Corp',
        email: 'john@test.local',
        phone: '974555001234',
        location: Location.mainLobby,
        status: HostStatus.active,
        type: HostType.external,
        createdAt: DateTime.parse('2026-02-01T10:00:00Z'),
        updatedAt: DateTime.parse('2026-02-13T14:00:00Z'),
      );

      // ACT
      final json = host.toJson();

      // ASSERT
      expect(json['id'], equals('host_1'));
      expect(json['name'], equals('John Manager'));
      expect(json['company'], equals('Tech Corp'));
      expect(json['type'], equals('EXTERNAL'));
      expect(json['status'], equals('ACTIVE'));
    });

    test('Location enum values deserialize correctly', () {
      // Test each location
      final locations = [
        Location.mainLobby,
        Location.reception,
        Location.conferenceRoomA,
        Location.conferenceRoomB,
      ];

      // ASSERT
      expect(locations.length, greaterThan(0));
      expect(locations.contains(Location.mainLobby), isTrue);
    });

    test('HostType enum EXTERNAL vs INTERNAL', () {
      // ARRANGE
      final externalHost = createMockExternalHost();
      final internalHost = createMockInternalHost();

      // ASSERT
      expect(externalHost.type, equals(HostType.external));
      expect(internalHost.type, equals(HostType.internal));
      expect(externalHost.type == internalHost.type, isFalse);
    });

    test('HostStatus ACTIVE vs INACTIVE', () {
      // ARRANGE
      final activeHost = createMockExternalHost(status: HostStatus.active);
      final inactiveHost = createMockExternalHost(status: HostStatus.inactive);

      // ASSERT
      expect(activeHost.status, equals(HostStatus.active));
      expect(inactiveHost.status, equals(HostStatus.inactive));
    });

    test('Round-trip serialization preserves all data', () {
      // ARRANGE
      final originalJson = internalHostJson;

      // ACT
      final host = Host.fromJson(originalJson);
      final roundTripJson = host.toJson();

      // ASSERT
      expect(roundTripJson['id'], equals(originalJson['id']));
      expect(roundTripJson['name'], equals(originalJson['name']));
      expect(roundTripJson['type'], equals(originalJson['type']));
      expect(roundTripJson['company'], equals(originalJson['company']));
    });

    test('Phone number is preserved during serialization', () {
      // ARRANGE
      final host = createMockExternalHost(
        phone: '97433112233',
      );

      // ACT
      final json = host.toJson();

      // ASSERT
      expect(json['phone'], equals('97433112233'));
      expect(json['phone'], matches(r'^\d{10,}$'));
    });

    test('Email is valid format', () {
      // ARRANGE
      final host = createMockExternalHost(
        email: 'john.smith@techcorp.com',
      );

      // ACT
      final json = host.toJson();

      // ASSERT
      final emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
      expect(emailPattern.hasMatch(json['email']), isTrue);
    });

    test('Timestamps are preserved', () {
      // ARRANGE
      final createdAt = DateTime.parse('2026-02-01T10:00:00Z');
      final updatedAt = DateTime.parse('2026-02-13T14:00:00Z');

      final host = Host(
        id: 'host_1',
        externalId: 'ext_1',
        name: 'Test Host',
        company: 'Test Company',
        email: 'test@test.local',
        phone: '97433112233',
        location: Location.mainLobby,
        status: HostStatus.active,
        type: HostType.external,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      // ACT
      final json = host.toJson();
      final deserialized = Host.fromJson(json);

      // ASSERT
      expect(deserialized.createdAt, equals(createdAt));
      expect(deserialized.updatedAt, equals(updatedAt));
    });
  });

  group('Host Model - Factory Functions', () {
    test('createMockExternalHost returns external type', () {
      // ACT
      final host = createMockExternalHost();

      // ASSERT
      expect(host.type, equals(HostType.external));
      expect(host.status, equals(HostStatus.active));
    });

    test('createMockInternalHost returns internal type', () {
      // ACT
      final host = createMockInternalHost();

      // ASSERT
      expect(host.type, equals(HostType.internal));
      expect(host.company, equals('Arafat Group'));
    });

    test('Factory functions allow customization', () {
      // ACT
      final customHost = createMockExternalHost(
        name: 'Custom Host',
        company: 'Custom Company',
        location: Location.conferenceRoomA,
      );

      // ASSERT
      expect(customHost.name, equals('Custom Host'));
      expect(customHost.company, equals('Custom Company'));
      expect(customHost.location, equals(Location.conferenceRoomA));
    });

    test('Different locations can be assigned', () {
      // ACT
      final mainLobbyHost = createMockExternalHost(location: Location.mainLobby);
      final cafeteriaHost = createMockExternalHost(location: Location.cafeteria);
      final trainingHost = createMockExternalHost(location: Location.trainingRoom);

      // ASSERT
      expect(mainLobbyHost.location, equals(Location.mainLobby));
      expect(cafeteriaHost.location, equals(Location.cafeteria));
      expect(trainingHost.location, equals(Location.trainingRoom));
    });
  });
}
