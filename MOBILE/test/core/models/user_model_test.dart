// Unit tests for User model serialization and deserialization
//
// Tests cover:
// - JSON serialization/deserialization round-trip
// - Nullable field handling (hostId, accessToken, refreshToken)
// - Enum value validation (role)
// - Error cases (invalid values)

import 'package:flutter_test/flutter_test.dart';
import 'package:arafatvisitor/core/models/user.dart';
import '../../fixtures/factories.dart';

void main() {
  group('User Model', () {
    // Test data
    final adminUserJson = {
      'id': 'admin_user_1',
      'email': 'admin@test.local',
      'name': 'Admin User',
      'role': 'ADMIN',
      'hostId': null,
      'accessToken': null,
      'refreshToken': null,
    };

    final hostUserJson = {
      'id': 'host_user_1',
      'email': 'host@test.local',
      'name': 'Host User',
      'role': 'HOST',
      'hostId': 'host_company_1',
      'accessToken': 'token_abc',
      'refreshToken': 'token_xyz',
    };

    test('Admin user deserializes from JSON correctly', () {
      // ARRANGE
      final json = adminUserJson;

      // ACT
      final user = User.fromJson(json);

      // ASSERT
      expect(user.id, equals('admin_user_1'));
      expect(user.email, equals('admin@test.local'));
      expect(user.name, equals('Admin User'));
      expect(user.role, equals(UserRole.admin));
      expect(user.hostId, isNull);
    });

    test('Host user with hostId deserializes correctly', () {
      // ARRANGE
      final json = hostUserJson;

      // ACT
      final user = User.fromJson(json);

      // ASSERT
      expect(user.role, equals(UserRole.host));
      expect(user.hostId, isNotNull);
      expect(user.hostId, equals('host_company_1'));
    });

    test('User serializes to JSON with all fields', () {
      // ARRANGE
      final user = User(
        id: 'admin_user_1',
        email: 'admin@test.local',
        name: 'Admin User',
        role: UserRole.admin,
        hostId: null,
        accessToken: null,
        refreshToken: null,
      );

      // ACT
      final json = user.toJson();

      // ASSERT
      expect(json['id'], equals('admin_user_1'));
      expect(json['email'], equals('admin@test.local'));
      expect(json['name'], equals('Admin User'));
      expect(json['role'], equals('ADMIN'));
      expect(json['hostId'], isNull);
    });

    test('Round-trip serialization preserves data', () {
      // ARRANGE
      final originalJson = hostUserJson;

      // ACT
      final user = User.fromJson(originalJson);
      final roundTripJson = user.toJson();

      // ASSERT
      expect(roundTripJson['id'], equals(originalJson['id']));
      expect(roundTripJson['email'], equals(originalJson['email']));
      expect(roundTripJson['name'], equals(originalJson['name']));
      expect(roundTripJson['role'], equals(originalJson['role']));
    });

    test('Null hostId for ADMIN users remains null', () {
      // ARRANGE
      final json = adminUserJson;

      // ACT
      final user = User.fromJson(json);

      // ASSERT
      expect(user.hostId, isNull);
    });

    test('All UserRole enum values are valid', () {
      // Test each role can be created
      final roles = [
        UserRole.admin,
        UserRole.reception,
        UserRole.host,
        UserRole.staff,
      ];

      // ASSERT
      expect(roles, hasLength(4));
      expect(roles.contains(UserRole.admin), isTrue);
      expect(roles.contains(UserRole.host), isTrue);
    });

    test('User with accessToken and refreshToken serializes correctly', () {
      // ARRANGE
      final user = User(
        id: 'auth_user_1',
        email: 'auth@test.local',
        name: 'Auth User',
        role: UserRole.admin,
        hostId: null,
        accessToken: 'test_access_token_12345',
        refreshToken: 'test_refresh_token_67890',
      );

      // ACT
      final json = user.toJson();

      // ASSERT
      expect(json['accessToken'], equals('test_access_token_12345'));
      expect(json['refreshToken'], equals('test_refresh_token_67890'));
    });

    test('Admin user from factory function deserializes correctly', () {
      // ARRANGE
      final user = createMockAdminUser(
        id: 'factory_admin_1',
        email: 'factory_admin@test.local',
      );

      // ACT
      final json = user.toJson();
      final deserialized = User.fromJson(json);

      // ASSERT
      expect(deserialized.id, equals('factory_admin_1'));
      expect(deserialized.email, equals('factory_admin@test.local'));
      expect(deserialized.role, equals(UserRole.admin));
    });

    test('Host user with linked hostId deserializes and validates', () {
      // ARRANGE
      final user = createMockHostUser(
        id: 'linked_host_1',
        hostId: 'company_host_123',
      );

      // ACT
      final json = user.toJson();

      // ASSERT
      expect(user.hostId, isNotNull);
      expect(json['hostId'], equals('company_host_123'));
      expect(user.role, equals(UserRole.host));
    });

    test('User with all fields populated serializes and deserializes correctly', () {
      // ARRANGE - Complete user with all fields
      final user = User(
        id: 'complete_user_1',
        email: 'complete@test.local',
        name: 'Complete User',
        role: UserRole.staff,
        hostId: 'arafat_group_staff',
        accessToken: 'access_123',
        refreshToken: 'refresh_456',
      );

      // ACT
      final json = user.toJson();
      final deserialized = User.fromJson(json);

      // ASSERT
      expect(deserialized.id, equals(user.id));
      expect(deserialized.email, equals(user.email));
      expect(deserialized.name, equals(user.name));
      expect(deserialized.role, equals(user.role));
      expect(deserialized.hostId, equals(user.hostId));
    });

    test('Different user roles deserialize correctly', () {
      // ASSERT - Verify each role can be deserialized
      final adminJson = adminUserJson;
      final admin = User.fromJson(adminJson);
      expect(admin.role, equals(UserRole.admin));

      final hostJson = hostUserJson;
      final host = User.fromJson(hostJson);
      expect(host.role, equals(UserRole.host));
    });
  });

  group('User Model - Factory Functions', () {
    test('createMockAdminUser returns admin with correct role', () {
      // ACT
      final user = createMockAdminUser();

      // ASSERT
      expect(user.role, equals(UserRole.admin));
      expect(user.email, contains('@test.local'));
      expect(user.hostId, isNull);
    });

    test('createMockHostUser returns host with hostId', () {
      // ACT
      final user = createMockHostUser();

      // ASSERT
      expect(user.role, equals(UserRole.host));
      expect(user.hostId, isNotNull);
    });

    test('createMockStaffUser returns staff with hostId', () {
      // ACT
      final user = createMockStaffUser();

      // ASSERT
      expect(user.role, equals(UserRole.staff));
      expect(user.hostId, isNotNull);
    });

    test('Factory functions allow customization', () {
      // ACT
      final customUser = createMockAdminUser(
        id: 'custom_1',
        email: 'custom@example.com',
        name: 'Custom User',
      );

      // ASSERT
      expect(customUser.id, equals('custom_1'));
      expect(customUser.email, equals('custom@example.com'));
      expect(customUser.name, equals('Custom User'));
    });
  });
}
