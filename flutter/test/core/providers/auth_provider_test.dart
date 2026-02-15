// Unit tests for Auth Provider
//
// Tests cover:
// - Login/logout state transitions
// - Token storage and retrieval
// - AuthStatus enum transitions (initial → loading → authenticated/unauthenticated)
// - AsyncValue state management (loading, data, error)
// - Repository integration
// - Secure storage integration

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/features/auth/providers/auth_provider.dart';
import 'package:arafatvisitor/features/auth/data/auth_repository.dart';
import 'package:arafatvisitor/core/storage/secure_storage.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class MockAuthRepository extends Mock implements AuthRepository {}
class MockSecureStorage extends Mock implements SecureStorage {}

void main() {
  group('AuthNotifier Provider', () {
    late MockAuthRepository mockAuthRepository;
    late MockSecureStorage mockSecureStorage;
    late ProviderContainer container;

    setUp(() {
      mockAuthRepository = MockAuthRepository();
      mockSecureStorage = MockSecureStorage();
      container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepository),
          secureStorageProvider.overrideWithValue(mockSecureStorage),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AuthStatus.initial', () {
        final authState = container.read(authStateProvider);
        expect(authState.status, equals(AuthStatus.initial));
        expect(authState.user, isNull);
        expect(authState.errorMessage, isNull);
      });

      test('isAuthenticated provider returns false initially', () {
        final isAuth = container.read(isAuthenticatedProvider);
        expect(isAuth, isFalse);
      });

      test('currentUser provider returns null initially', () {
        final user = container.read(currentUserProvider);
        expect(user, isNull);
      });
    });

    group('Login', () {
      test('Login success stores tokens and transitions to authenticated', () async {
        // ARRANGE
        final testUser = createMockAdminUser();
        when(() => mockAuthRepository.login(
          email: 'admin@test.local',
          password: 'admin123',
        )).thenAnswer((_) async => testUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.login(email: 'admin@test.local', password: 'admin123');

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.authenticated));
        expect(state.value?.user?.email, equals(testUser.email));

        verify(() => mockAuthRepository.login(
          email: 'admin@test.local',
          password: 'admin123',
        )).called(1);
        verify(() => mockSecureStorage.saveUser(any())).called(1);
      });

      test('Login with tokens saves access and refresh tokens', () async {
        // ARRANGE
        final testUser = mockAdminUser;
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => testUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.login(email: 'test@test.local', password: 'pass');

        // ASSERT
        verify(() => mockSecureStorage.setAccessToken(any())).called(1);
        verify(() => mockSecureStorage.setRefreshToken(any())).called(1);
      });

      test('Login failure returns AsyncError', () async {
        // ARRANGE
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenThrow(Exception('Invalid credentials'));

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.login(email: 'test@test.local', password: 'wrong');

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('Logout', () {
      test('Logout clears auth state and calls repository', () async {
        // ARRANGE - First login
        final testUser = createMockAdminUser();
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => testUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);
        await notifier.login(email: 'admin@test.local', password: 'admin123');

        // ARRANGE - Setup logout
        when(() => mockAuthRepository.logout())
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.clearAll())
            .thenAnswer((_) async => {});

        // ACT
        await notifier.logout();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.unauthenticated));
        expect(state.value?.user, isNull);

        verify(() => mockAuthRepository.logout()).called(1);
        verify(() => mockSecureStorage.clearAll()).called(1);
      });

      test('Logout failure is handled', () async {
        // ARRANGE
        when(() => mockAuthRepository.logout())
            .thenThrow(Exception('Logout failed'));
        when(() => mockSecureStorage.clearAll())
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.logout();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('ForgotPassword', () {
      test('ForgotPassword success returns to initial state', () async {
        // ARRANGE
        when(() => mockAuthRepository.forgotPassword(email: any(named: 'email')))
            .thenAnswer((_) async => 'Password reset email sent');

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.forgotPassword(email: 'test@test.local');

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.initial));

        verify(() => mockAuthRepository.forgotPassword(email: 'test@test.local'))
            .called(1);
      });

      test('ForgotPassword failure returns error state', () async {
        // ARRANGE
        when(() => mockAuthRepository.forgotPassword(email: any(named: 'email')))
            .thenThrow(Exception('User not found'));

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.forgotPassword(email: 'nonexistent@test.local');

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('RefreshToken', () {
      test('RefreshToken success updates user and tokens', () async {
        // ARRANGE
        final refreshedUser = createMockAdminUser();
        when(() => mockAuthRepository.refreshToken())
            .thenAnswer((_) async => refreshedUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.refreshToken();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.authenticated));
        expect(state.value?.user?.email, equals(refreshedUser.email));

        verify(() => mockAuthRepository.refreshToken()).called(1);
        verify(() => mockSecureStorage.setAccessToken(any())).called(1);
      });

      test('RefreshToken failure returns error', () async {
        // ARRANGE
        when(() => mockAuthRepository.refreshToken())
            .thenThrow(Exception('Token expired'));

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.refreshToken();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('CheckAuthStatus', () {
      test('CheckAuthStatus finds authenticated user', () async {
        // ARRANGE
        final testUser = createMockAdminUser();
        when(() => mockSecureStorage.getAccessToken())
            .thenAnswer((_) async => 'valid_token');
        when(() => mockSecureStorage.getUser())
            .thenAnswer((_) async => testUser);

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.checkAuthStatus();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.authenticated));
        expect(state.value?.user?.email, equals(testUser.email));
      });

      test('CheckAuthStatus returns unauthenticated when no token', () async {
        // ARRANGE
        when(() => mockSecureStorage.getAccessToken())
            .thenAnswer((_) async => null);
        when(() => mockSecureStorage.getUser())
            .thenAnswer((_) async => null);

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        await notifier.checkAuthStatus();

        // ASSERT
        final state = container.read(authNotifierProvider);
        expect(state.value?.status, equals(AuthStatus.unauthenticated));
        expect(state.value?.user, isNull);
      });
    });

    group('Convenience Providers', () {
      test('currentUser returns authenticated user', () async {
        // ARRANGE
        final testUser = createMockAdminUser();
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => testUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);
        await notifier.login(email: 'admin@test.local', password: 'admin123');

        // ACT
        final user = container.read(currentUserProvider);

        // ASSERT
        expect(user?.email, equals(testUser.email));
      });

      test('isAuthenticated returns true when authenticated', () async {
        // ARRANGE
        final testUser = createMockAdminUser();
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => testUser);
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);
        await notifier.login(email: 'admin@test.local', password: 'admin123');

        // ACT
        final isAuth = container.read(isAuthenticatedProvider);

        // ASSERT
        expect(isAuth, isTrue);
      });
    });

    group('AsyncValue State', () {
      test('State is AsyncLoading during login', () async {
        // ARRANGE
        when(() => mockAuthRepository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 100));
          return mockAdminUser;
        });
        when(() => mockSecureStorage.setAccessToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.setRefreshToken(any()))
            .thenAnswer((_) async => {});
        when(() => mockSecureStorage.saveUser(any()))
            .thenAnswer((_) async => {});

        final notifier = container.read(authNotifierProvider.notifier);

        // ACT
        final loginFuture = notifier.login(
          email: 'admin@test.local',
          password: 'admin123',
        );

        await Future.delayed(const Duration(milliseconds: 50));
        var state = container.read(authNotifierProvider);
        expect(state, isA<AsyncLoading<AuthState>>());

        // Wait for completion
        await loginFuture;
        state = container.read(authNotifierProvider);
        expect(state, isA<AsyncData<AuthState>>());
      });
    });
  });
}
