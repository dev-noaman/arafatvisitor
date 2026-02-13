// Test utilities and common setup for all unit tests

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

/// Base test setup - call this in main() for each test group
void setUpAllTests() {
  TestWidgetsFlutterBinding.ensureInitialized();
}

/// Common mock response for testing
Map<String, dynamic> createMockJsonResponse(Map<String, dynamic> data) {
  return data;
}

/// Common error response for testing
Map<String, dynamic> createMockErrorResponse({
  int statusCode = 500,
  String message = 'Internal Server Error',
}) {
  return {
    'statusCode': statusCode,
    'message': message,
  };
}

/// Helper to verify mock was called with specific arguments
void verifyMockCall(Function mock, {int times = 1}) {
  verify(mock).called(times);
}

/// Helper to assert async value
extension AsyncValueMatcher<T> on Object {
  bool get isAsyncLoading => toString().contains('AsyncLoading');
  bool get isAsyncData => toString().contains('AsyncData');
  bool get isAsyncError => toString().contains('AsyncError');
}

/// Common test data constants
class TestConstants {
  static const String testEmail = 'test@test.local';
  static const String testPassword = 'test_password_123';
  static const String testPhone = '974555001234';
  static const String testName = 'Test User';
  static const String testCompany = 'Test Company';
  static const String testSessionId = 'test_session_123';
  static const String testVisitId = 'test_visit_123';
}
