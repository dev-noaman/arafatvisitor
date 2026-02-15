import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/paginated_response.dart';
import '../../../core/models/visit.dart';
import '../../../core/providers/core_providers.dart';
import '../data/pre_register_repository.dart';

final preRegisterRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return PreRegisterRepository(dio: dio);
});

final preRegisterListProvider =
    StateNotifierProvider<PreRegisterListNotifier, AsyncValue<PaginatedResponse<Visit>>>((ref) {
  final repository = ref.watch(preRegisterRepositoryProvider);
  return PreRegisterListNotifier(repository);
});

class PreRegisterListNotifier extends StateNotifier<AsyncValue<PaginatedResponse<Visit>>> {
  final PreRegisterRepository _repository;

  PreRegisterListNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadInitial();
  }

  int _currentPage = 1;
  final int _pageSize = 20;
  String _searchQuery = '';

  Future<void> _loadInitial() async {
    state = await AsyncValue.guard(() => _repository.getPreRegistrations(
          page: _currentPage,
          limit: _pageSize,
          search: _searchQuery.isEmpty ? null : _searchQuery,
        ));
  }

  Future<void> refresh() async {
    _currentPage = 1;
    _searchQuery = '';
    await _loadInitial();
  }

  Future<void> search(String query) async {
    _searchQuery = query;
    _currentPage = 1;
    await _loadInitial();
  }

  Future<void> loadMore() async {
    final current = state;
    if (current.value != null) {
      final nextPage = _currentPage + 1;
      if (nextPage <= current.value!.totalPages) {
        _currentPage = nextPage;
        final result = await AsyncValue.guard(() => _repository.getPreRegistrations(
              page: _currentPage,
              limit: _pageSize,
              search: _searchQuery.isEmpty ? null : _searchQuery,
            ));

        result.whenData((newData) {
          final currentData = current.value!;
          state = AsyncValue.data(PaginatedResponse(
            data: [...currentData.data, ...newData.data],
            total: newData.total,
            page: newData.page,
            limit: newData.limit,
            totalPages: newData.totalPages,
          ));
        });
      }
    }
  }

  Future<void> createPreRegistration(Map<String, dynamic> data) async {
    try {
      await _repository.createPreRegistration(data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updatePreRegistration(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updatePreRegistration(id, data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deletePreRegistration(String id) async {
    try {
      await _repository.deletePreRegistration(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> approvePreRegistration(String id) async {
    try {
      await _repository.approvePreRegistration(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> rejectPreRegistration(String id) async {
    try {
      await _repository.rejectPreRegistration(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> reApprovePreRegistration(String id) async {
    try {
      await _repository.reApprovePreRegistration(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}
