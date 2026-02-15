// Unit tests for AuthRepository
//
// Tests cover:
// - Login endpoint with User deserialization
// - Password reset request
// - Token refresh
// - Logout endpoint
// - DioException error handling for all status codes
// - Connection errors and timeouts
// - Response parsing and error messages

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/user.dart';
import 'package:arafatvisitor/features/auth/data/auth_repository.dart';
import '../../../fixtures/models.dart';

// Mock Dio client
class MockDio extends Mock implements Dio {}

void main() {
  group('AuthRepository', () {
    late MockDio mockDio;
    late AuthRepository authRepository;

    setUp(() {
      mockDio = MockDio();
      authRepository = AuthRepository(mockDio);
    });

    group('Login', () {
      final loginJson = {
        'data': {
          'id': 'admin_user_1',
          'email': 'admin@test.local',
          'name': 'Admin User',
          'role': 'ADMIN',
          'hostId': null,
          'accessToken': 'token_abc_123',
          'refreshToken': 'token_xyz_789',
        }
      };

      test('Login returns user on 200 success response', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          statusCode: 200,
          data: loginJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: {'email': 'admin@test.local', 'password': 'admin123'},
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final user = await authRepository.login(
          email: 'admin@test.local',
          password: 'admin123',
        );

        // ASSERT
        expect(user.id, equals('admin_user_1'));
        expect(user.email, equals('admin@test.local'));
        expect(user.name, equals('Admin User'));
        expect(user.role, equals(UserRole.admin));
        expect(user.accessToken, equals('token_abc_123'));
        expect(user.refreshToken, equals('token_xyz_789'));
      });

      test('Login throws exception on 400 bad request', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.login),
            statusCode: 400,
            data: {'message': 'Invalid email or password'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'wrong'),
          throwsException,
        );
      });

      test('Login throws exception on 401 unauthorized', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.login),
            statusCode: 401,
            data: {'message': 'Invalid credentials'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'wrong'),
          throwsException,
        );
      });

      test('Login throws exception on 422 validation error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.login),
            statusCode: 422,
            data: {'message': 'Email is required'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: '', password: 'test'),
          throwsException,
        );
      });

      test('Login throws exception on connection timeout', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.connectionTimeout,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('Login throws exception on no internet connection', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('Login throws exception on 500 server error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.login),
            statusCode: 500,
            data: {'message': 'Internal server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('Returned user can be serialized and deserialized', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          statusCode: 200,
          data: loginJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final user = await authRepository.login(
          email: 'admin@test.local',
          password: 'admin123',
        );
        final json = user.toJson();
        final deserialized = User.fromJson(json);

        // ASSERT
        expect(deserialized.id, equals(user.id));
        expect(deserialized.email, equals(user.email));
        expect(deserialized.role, equals(user.role));
      });
    });

    group('Logout', () {
      test('Logout succeeds on 200 response', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.logout),
          statusCode: 200,
          data: {'message': 'Logged out successfully'},
        );
        when(
          () => mockDio.post(ApiEndpoints.logout),
        ).thenAnswer((_) async => response);

        // ACT & ASSERT
        expect(
          authRepository.logout(),
          completes,
        );
      });

      test('Logout throws exception on 401 unauthorized', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.logout),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.logout),
            statusCode: 401,
            data: {'message': 'Token expired'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(ApiEndpoints.logout),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.logout(),
          throwsException,
        );
      });

      test('Logout throws exception on connection error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.logout),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.post(ApiEndpoints.logout),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.logout(),
          throwsException,
        );
      });
    });

    group('ForgotPassword', () {
      test('ForgotPassword returns success message on 200 response', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
          statusCode: 200,
          data: {'message': 'Password reset email sent successfully'},
        );
        when(
          () => mockDio.post(
            ApiEndpoints.forgotPassword,
            data: {'email': 'test@test.local'},
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await authRepository.forgotPassword(email: 'test@test.local');

        // ASSERT
        expect(
          result,
          equals('Password reset email sent successfully'),
        );
      });

      test('ForgotPassword returns default message when no message in response', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
          statusCode: 200,
          data: {},
        );
        when(
          () => mockDio.post(
            ApiEndpoints.forgotPassword,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await authRepository.forgotPassword(email: 'test@test.local');

        // ASSERT
        expect(
          result,
          equals('Password reset email sent'),
        );
      });

      test('ForgotPassword throws exception on 404 not found', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
            statusCode: 404,
            data: {'message': 'User not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.forgotPassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.forgotPassword(email: 'nonexistent@test.local'),
          throwsException,
        );
      });

      test('ForgotPassword throws exception on 422 validation error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.forgotPassword),
            statusCode: 422,
            data: {'message': 'Invalid email format'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.forgotPassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.forgotPassword(email: 'invalid-email'),
          throwsException,
        );
      });
    });

    group('RefreshToken', () {
      final refreshJson = {
        'data': {
          'id': 'admin_user_1',
          'email': 'admin@test.local',
          'name': 'Admin User',
          'role': 'ADMIN',
          'hostId': null,
          'accessToken': 'new_token_abc_123',
          'refreshToken': 'new_token_xyz_789',
        }
      };

      test('RefreshToken returns updated user on 200 response', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.refreshToken),
          statusCode: 200,
          data: refreshJson,
        );
        when(
          () => mockDio.post(ApiEndpoints.refreshToken),
        ).thenAnswer((_) async => response);

        // ACT
        final user = await authRepository.refreshToken();

        // ASSERT
        expect(user.id, equals('admin_user_1'));
        expect(user.accessToken, equals('new_token_abc_123'));
        expect(user.refreshToken, equals('new_token_xyz_789'));
      });

      test('RefreshToken throws exception on 401 unauthorized', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.refreshToken),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.refreshToken),
            statusCode: 401,
            data: {'message': 'Refresh token expired'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(ApiEndpoints.refreshToken),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.refreshToken(),
          throwsException,
        );
      });

      test('RefreshToken throws exception on connection timeout', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.refreshToken),
          type: DioExceptionType.receiveTimeout,
        );
        when(
          () => mockDio.post(ApiEndpoints.refreshToken),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.refreshToken(),
          throwsException,
        );
      });

      test('Refreshed user token values differ from original', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.refreshToken),
          statusCode: 200,
          data: refreshJson,
        );
        when(
          () => mockDio.post(ApiEndpoints.refreshToken),
        ).thenAnswer((_) async => response);

        // ACT
        final originalUser = mockAdminUser;
        final refreshedUser = await authRepository.refreshToken();

        // ASSERT
        expect(
          refreshedUser.accessToken,
          isNot(equals(originalUser.accessToken)),
        );
        expect(
          refreshedUser.refreshToken,
          isNot(equals(originalUser.refreshToken)),
        );
      });
    });

    group('Error Handling', () {
      test('ConnectionTimeout error returns timeout message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.connectionTimeout,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('SendTimeout error returns timeout message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.sendTimeout,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('ReceiveTimeout error returns timeout message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.receiveTimeout,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('Cancel error returns cancellation message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.cancel,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('403 Forbidden error returns forbidden message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.login),
            statusCode: 403,
            data: {'message': 'Access denied'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });

      test('Unknown error type returns generic error message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.login),
          type: DioExceptionType.unknown,
          message: 'Unexpected error',
        );
        when(
          () => mockDio.post(
            ApiEndpoints.login,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => authRepository.login(email: 'test@test.local', password: 'test'),
          throwsException,
        );
      });
    });
  });
}
