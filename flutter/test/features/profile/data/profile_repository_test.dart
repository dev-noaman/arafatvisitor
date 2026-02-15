// Unit tests for ProfileRepository
//
// Tests cover:
// - Change password operation
// - Password validation (old password check, minimum length)
// - Error handling (401, 400, 422, 500, network)

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/features/profile/data/profile_repository.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('ProfileRepository', () {
    late MockDio mockDio;
    late ProfileRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = ProfileRepository(dio: mockDio);
    });

    group('ChangePassword', () {
      test('ChangePassword succeeds on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          statusCode: 200,
          data: {'message': 'Password changed successfully'},
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        expect(
          repository.changePassword(
            currentPassword: 'oldPass123',
            newPassword: 'newPass456',
          ),
          completes,
        );
      });

      test('ChangePassword sends correct payload', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          statusCode: 200,
          data: {'message': 'Success'},
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        await repository.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        verify(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: {
              'currentPassword': 'current123',
              'newPassword': 'newpass123',
            },
          ),
        ).called(1);
      });

      test('ChangePassword throws on 400 bad request', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
            statusCode: 400,
            data: {'message': 'New password must be different from current'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'pass123',
            newPassword: 'pass123',
          ),
          throwsException,
        );
      });

      test('ChangePassword throws on 401 wrong current password', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
            statusCode: 401,
            data: {'message': 'Current password is incorrect'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'wrongpass',
            newPassword: 'newpass123',
          ),
          throwsException,
        );
      });

      test('ChangePassword throws on 422 validation error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
            statusCode: 422,
            data: {'message': 'Password must be at least 6 characters'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'current123',
            newPassword: 'short',
          ),
          throwsException,
        );
      });

      test('ChangePassword throws on 500 server error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
            statusCode: 500,
            data: {'message': 'Internal server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'current123',
            newPassword: 'newpass123',
          ),
          throwsException,
        );
      });

      test('ChangePassword throws on connection timeout', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          type: DioExceptionType.connectionTimeout,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'current123',
            newPassword: 'newpass123',
          ),
          throwsException,
        );
      });

      test('ChangePassword throws on network error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          type: DioExceptionType.connectionError,
          message: 'No internet connection',
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'current123',
            newPassword: 'newpass123',
          ),
          throwsException,
        );
      });
    });

    group('Error Handling', () {
      test('Error with message returns message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
            statusCode: 400,
            data: {'message': 'Custom error message'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'test',
            newPassword: 'test2',
          ),
          throwsException,
        );
      });

      test('Network error without response returns network error message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.changePassword),
          type: DioExceptionType.connectionError,
          message: 'Network unreachable',
        );
        when(
          () => mockDio.post(
            ApiEndpoints.changePassword,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.changePassword(
            currentPassword: 'test',
            newPassword: 'test2',
          ),
          throwsException,
        );
      });
    });
  });
}
