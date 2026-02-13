import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/user.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/providers/core_providers.dart';
import '../data/auth_repository.dart';

part 'auth_provider.g.dart';

/// Authentication state
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {

  const AuthState({required this.status, this.user, this.errorMessage});
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  AuthState copyWith({AuthStatus? status, User? user, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

/// Authentication provider
@riverpod
class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    return const AuthState(status: AuthStatus.initial);
  }

  /// Login with email and password
  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      final secureStorage = ref.read(secureStorageProvider);

      final user = await authRepository.login(email: email, password: password);

      // Store tokens and user data
      if (user.accessToken != null) {
        await secureStorage.setAccessToken(user.accessToken!);
      }
      if (user.refreshToken != null) {
        await secureStorage.setRefreshToken(user.refreshToken!);
      }
      await secureStorage.saveUser(user);

      return AuthState(status: AuthStatus.authenticated, user: user);
    });
  }

  /// Logout the current user
  Future<void> logout() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      final secureStorage = ref.read(secureStorageProvider);

      await authRepository.logout();

      // Clear tokens and user data
      await secureStorage.clearAll();

      return const AuthState(status: AuthStatus.unauthenticated);
    });
  }

  /// Request password reset email
  Future<void> forgotPassword({required String email}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);

      await authRepository.forgotPassword(email: email);

      return const AuthState(status: AuthStatus.initial);
    });
  }

  /// Refresh the access token
  Future<void> refreshToken() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      final secureStorage = ref.read(secureStorageProvider);

      final user = await authRepository.refreshToken();

      // Update tokens
      if (user.accessToken != null) {
        await secureStorage.setAccessToken(user.accessToken!);
      }
      if (user.refreshToken != null) {
        await secureStorage.setRefreshToken(user.refreshToken!);
      }
      await secureStorage.saveUser(user);

      return AuthState(status: AuthStatus.authenticated, user: user);
    });
  }

  /// Check if user is authenticated
  Future<void> checkAuthStatus() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final secureStorage = ref.read(secureStorageProvider);

      final token = await secureStorage.getAccessToken();
      final user = await secureStorage.getUser();

      if (token != null && user != null) {
        return AuthState(status: AuthStatus.authenticated, user: user);
      } else {
        return const AuthState(status: AuthStatus.unauthenticated);
      }
    });
  }
}

/// AuthState provider
@riverpod
AuthState authState(Ref ref) {
  return ref.watch(authProvider).value ??
      const AuthState(status: AuthStatus.initial);
}

/// User provider (convenience)
@riverpod
User? currentUser(Ref ref) {
  return ref.watch(authStateProvider).user;
}

/// Is authenticated provider (convenience)
@riverpod
bool isAuthenticated(Ref ref) {
  return ref.watch(authStateProvider).status == AuthStatus.authenticated;
}
