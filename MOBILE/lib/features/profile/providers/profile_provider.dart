import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/profile_repository.dart';

final profileRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return ProfileRepository(dio: dio);
});

final profileProvider = FutureProvider((ref) async {
  final authState = ref.watch(authNotifierProvider);
  return authState.whenData((auth) => auth?.user).value;
});

final changePasswordProvider = StateNotifierProvider<ChangePasswordNotifier, AsyncValue<void>>((ref) {
  final repository = ref.watch(profileRepositoryProvider);
  return ChangePasswordNotifier(repository);
});

class ChangePasswordNotifier extends StateNotifier<AsyncValue<void>> {
  final ProfileRepository _repository;

  ChangePasswordNotifier(this._repository) : super(const AsyncValue.data(null));

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    state = const AsyncValue.loading();

    try {
      await _repository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() {
    state = const AsyncValue.data(null);
  }
}
