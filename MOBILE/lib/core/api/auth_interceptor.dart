import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Auth interceptor that adds access token to requests
/// and handles token refresh on 401 errors
class AuthInterceptor extends QueuedInterceptorsWrapper {
  AuthInterceptor({required this.onTokenRefresh, required this.onUnauthorized});

  /// Callback to refresh the access token
  final Future<String?> Function() onTokenRefresh;

  /// Callback when user is unauthorized (refresh failed)
  final VoidCallback onUnauthorized;

  bool _isRefreshing = false;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Add access token to request headers
    final token = await _getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 Unauthorized errors
    if (err.response?.statusCode == 401) {
      if (_isRefreshing) {
        // If already refreshing, wait for the refresh to complete
        return handler.next(err);
      }

      _isRefreshing = true;

      try {
        // Attempt to refresh the token
        final newToken = await onTokenRefresh();

        if (newToken != null && newToken.isNotEmpty) {
          // Retry the original request with the new token
          final options = err.requestOptions;
          options.headers['Authorization'] = 'Bearer $newToken';

          // Create a new request with the updated options
          final response = await Dio().fetch(options);
          _isRefreshing = false;
          return handler.resolve(response);
        } else {
          // Token refresh failed, user needs to re-login
          _isRefreshing = false;
          onUnauthorized();
          return handler.next(err);
        }
      } catch (e) {
        // Token refresh failed
        _isRefreshing = false;
        onUnauthorized();
        return handler.next(err);
      }
    }

    // For other errors, pass them through
    handler.next(err);
  }

  /// Get the current access token from storage
  /// This will be provided by the SecureStorageService
  Future<String?> _getAccessToken() async {
    // This will be implemented by the provider that creates this interceptor
    return null;
  }
}
