import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/core_providers.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/profile_repository.dart';

part 'profile_provider.g.dart';

final profileRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return ProfileRepository(dio: dio);
});

final profileProvider = FutureProvider((ref) async {
  final authState = ref.watch(authStateProvider);
  return authState.user;
});

@riverpod
class ChangePassword extends AsyncNotifier<void> {
  late ProfileRepository _repository;

  @override
  Future<void> build() async {
    _repository = ref.watch(profileRepositoryProvider);
    return Future.value();
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _repository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
    });
  }

  void reset() {
    state = const AsyncValue.data(null);
  }
}
