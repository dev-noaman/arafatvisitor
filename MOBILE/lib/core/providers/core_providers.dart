import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../api/api_client.dart';
import '../api/auth_interceptor.dart';
import '../storage/secure_storage.dart';

part 'core_providers.g.dart';

/// Provider for SecureStorageService
@Riverpod(keepAlive: true)
SecureStorageService secureStorage(SecureStorageRef ref) {
  return SecureStorageService();
}

/// Provider for AuthInterceptor
@Riverpod(keepAlive: true)
AuthInterceptor authInterceptor(AuthInterceptorRef ref) {
  final storage = ref.watch(secureStorageProvider);
  return AuthInterceptor(
    onTokenRefresh: () async {
      // This will be implemented by AuthRepository
      // The repository will handle token refresh and return the new token
      return null;
    },
    onUnauthorized: () {
      // Navigate to login screen
      // This will be handled by the AuthProvider
    },
  );
}

/// Provider for ApiClient
@Riverpod(keepAlive: true)
ApiClient apiClient(ApiClientRef ref) {
  final interceptor = ref.watch(authInterceptorProvider);
  return ApiClient(interceptor: interceptor);
}
