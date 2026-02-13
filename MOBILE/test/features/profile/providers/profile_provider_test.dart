// Unit tests for Profile Provider
//
// Tests cover:
// - Change password operation
// - Password validation (old password check, minimum length)
// - Error handling (401 wrong current, 400 validation, 422 length, 500 server)
// - AsyncValue state transitions (loading → data → error)
// - Reset functionality

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/features/profile/providers/profile_provider.dart';
import 'package:arafatvisitor/features/profile/data/profile_repository.dart';

class MockProfileRepository extends Mock implements ProfileRepository {}

void main() {
  group('ChangePasswordNotifier Provider', () {
    late MockProfileRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockProfileRepository();
      container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AsyncData with null', () {
        final state = container.read(changePasswordProvider);
        expect(state, isA<AsyncData<void>>());
        expect(state.value, isNull);
      });
    });

    group('Change Password Success', () {
      test('changePassword success returns AsyncData', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: 'oldPass123',
          newPassword: 'newPass456',
        )).thenAnswer((_) async => {});

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'oldPass123',
          newPassword: 'newPass456',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state, isA<AsyncData<void>>());
        expect(state.value, isNull);

        verify(() => mockRepository.changePassword(
          currentPassword: 'oldPass123',
          newPassword: 'newPass456',
        )).called(1);
      });

      test('changePassword sends correct payload to repository', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenAnswer((_) async => {});

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass456',
        );

        // ASSERT
        verify(() => mockRepository.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass456',
        )).called(1);
      });
    });

    group('Change Password Errors', () {
      test('changePassword throws on 401 wrong current password', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Current password is incorrect'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'wrongpass',
          newPassword: 'newpass123',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });

      test('changePassword throws on 400 bad request', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('New password must be different from current'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'pass123',
          newPassword: 'pass123',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });

      test('changePassword throws on 422 validation error', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Password must be at least 6 characters'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'short',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });

      test('changePassword throws on 500 server error', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Internal server error'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });

      test('changePassword throws on network timeout', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Connection timeout'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });

      test('changePassword throws on network error', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('No internet connection'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        // ASSERT
        final state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('AsyncValue State Transitions', () {
      test('State transitions to AsyncLoading during changePassword', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
        });

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        final changeFuture = notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        await Future.delayed(const Duration(milliseconds: 25));
        var state = container.read(changePasswordProvider);
        expect(state, isA<AsyncLoading>());

        // Wait for completion
        await changeFuture;
        state = container.read(changePasswordProvider);
        expect(state, isA<AsyncData<void>>());
      });

      test('State remains AsyncData after error is reset', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Error'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        var state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);

        // Reset the state
        notifier.reset();
        state = container.read(changePasswordProvider);
        expect(state, isA<AsyncData<void>>());
        expect(state.value, isNull);
      });
    });

    group('Reset Functionality', () {
      test('reset clears error state', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenThrow(Exception('Error occurred'));

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current',
          newPassword: 'newpass',
        );

        var state = container.read(changePasswordProvider);
        expect(state.hasError, isTrue);

        // Call reset
        notifier.reset();

        // ASSERT
        state = container.read(changePasswordProvider);
        expect(state.hasError, isFalse);
        expect(state, isA<AsyncData<void>>());
      });

      test('reset after successful changePassword resets to null', () async {
        // ARRANGE
        when(() => mockRepository.changePassword(
          currentPassword: any(named: 'currentPassword'),
          newPassword: any(named: 'newPassword'),
        )).thenAnswer((_) async => {});

        final notifier = container.read(changePasswordProvider.notifier);

        // ACT
        await notifier.changePassword(
          currentPassword: 'current123',
          newPassword: 'newpass123',
        );

        var state = container.read(changePasswordProvider);
        expect(state.value, isNull);

        notifier.reset();
        state = container.read(changePasswordProvider);
        expect(state.value, isNull);
      });
    });
  });
}
