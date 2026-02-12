import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/host.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/providers/core_providers.dart';
import '../data/hosts_repository.dart';

final hostsRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return HostsRepository(dio: dio);
});

final hostsListProvider =
    StateNotifierProvider<HostsListNotifier, AsyncValue<PaginatedResponse<Host>>>((ref) {
  final repository = ref.watch(hostsRepositoryProvider);
  return HostsListNotifier(repository);
});

class HostsListNotifier extends StateNotifier<AsyncValue<PaginatedResponse<Host>>> {
  final HostsRepository _repository;

  HostsListNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadInitial();
  }

  int _currentPage = 1;
  final int _pageSize = 20;
  String _searchQuery = '';
  String? _typeFilter;

  Future<void> _loadInitial() async {
    state = await AsyncValue.guard(() => _repository.getHosts(
          page: _currentPage,
          limit: _pageSize,
          search: _searchQuery.isEmpty ? null : _searchQuery,
          type: _typeFilter,
        ));
  }

  Future<void> refresh() async {
    _currentPage = 1;
    _searchQuery = '';
    _typeFilter = null;
    await _loadInitial();
  }

  Future<void> search(String query) async {
    _searchQuery = query;
    _currentPage = 1;
    await _loadInitial();
  }

  Future<void> setTypeFilter(String? type) async {
    _typeFilter = type;
    _currentPage = 1;
    await _loadInitial();
  }

  Future<void> loadMore() async {
    final current = state;
    if (current.value != null) {
      final nextPage = _currentPage + 1;
      if (nextPage <= current.value!.totalPages) {
        _currentPage = nextPage;
        final result = await AsyncValue.guard(() => _repository.getHosts(
              page: _currentPage,
              limit: _pageSize,
              search: _searchQuery.isEmpty ? null : _searchQuery,
              type: _typeFilter,
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

  Future<void> createHost(Map<String, dynamic> data) async {
    try {
      await _repository.createHost(data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateHost(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updateHost(id, data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteHost(String id) async {
    try {
      await _repository.deleteHost(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}
