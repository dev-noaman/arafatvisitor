import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/core_providers.dart';

part 'auth_repository.g.dart';

/// Repository for authentication operations
@riverpod
AuthRepository authRepository(Ref ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(apiClient);
}

class AuthRepository {

  AuthRepository(this._apiClient);
  final Dio _apiClient;

  /// Login with email and password
  /// Returns the authenticated user with tokens
  Future<User> login({required String email, required String password}) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200 && response.data != null) {
        final user = User.fromJson(response.data['data']);
        return user;
      } else {
        throw Exception(
          'Login failed: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Logout the current user
  /// Clears tokens from storage
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } on DioException catch (e) {
      // Even if logout API fails, we should clear local tokens
      throw _handleDioError(e);
    }
  }

  /// Request password reset email
  /// Returns success message
  Future<String> forgotPassword({required String email}) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.forgotPassword,
        data: {'email': email},
      );

      if (response.statusCode == 200 && response.data != null) {
        return response.data['message'] ?? 'Password reset email sent';
      } else {
        throw Exception(
          'Failed to send reset email: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Refresh the access token using the refresh token
  /// Returns the new user data with updated tokens
  Future<User> refreshToken() async {
    try {
      final response = await _apiClient.post(ApiEndpoints.refreshToken);

      if (response.statusCode == 200 && response.data != null) {
        final user = User.fromJson(response.data['data']);
        return user;
      } else {
        throw Exception(
          'Token refresh failed: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Handle Dio exceptions and convert to user-friendly messages
  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception(
          'Connection timeout. Please check your internet connection.',
        );

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? 'An error occurred';

        switch (statusCode) {
          case 400:
            return Exception('Bad request: $message');
          case 401:
            return Exception('Unauthorized: $message');
          case 403:
            return Exception('Forbidden: $message');
          case 404:
            return Exception('Not found: $message');
          case 422:
            return Exception('Validation error: $message');
          case 500:
            return Exception('Server error. Please try again later.');
          default:
            return Exception(
              'Request failed with status $statusCode: $message',
            );
        }

      case DioExceptionType.cancel:
        return Exception('Request was cancelled.');

      case DioExceptionType.connectionError:
        return Exception('No internet connection. Please check your network.');

      case DioExceptionType.unknown:
        return Exception('An unexpected error occurred: ${error.message}');

      default:
        return Exception('An error occurred: ${error.message}');
    }
  }
}
