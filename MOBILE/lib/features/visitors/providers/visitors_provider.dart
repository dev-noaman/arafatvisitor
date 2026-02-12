import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/paginated_response.dart';
import '../../../core/models/visit.dart';
import '../../../core/providers/core_providers.dart';
import '../data/visitors_repository.dart';

final visitorsRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return VisitorsRepository(dio: dio);
});

final visitorsListProvider =
    StateNotifierProvider<VisitorsListNotifier, AsyncValue<PaginatedResponse<Visit>>>((ref) {
  final repository = ref.watch(visitorsRepositoryProvider);
  return VisitorsListNotifier(repository);
});

class VisitorsListNotifier extends StateNotifier<AsyncValue<PaginatedResponse<Visit>>> {
  final VisitorsRepository _repository;

  VisitorsListNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadInitial();
  }

  int _currentPage = 1;
  final int _pageSize = 20;
  String _searchQuery = '';
  String? _statusFilter;

  Future<void> _loadInitial() async {
    state = await AsyncValue.guard(() => _repository.getVisitors(
          page: _currentPage,
          limit: _pageSize,
          search: _searchQuery.isEmpty ? null : _searchQuery,
          status: _statusFilter,
        ));
  }

  Future<void> refresh() async {
    _currentPage = 1;
    _searchQuery = '';
    _statusFilter = null;
    await _loadInitial();
  }

  Future<void> search(String query) async {
    _searchQuery = query;
    _currentPage = 1;
    await _loadInitial();
  }

  Future<void> setStatusFilter(String? status) async {
    _statusFilter = status;
    _currentPage = 1;
    await _loadInitial();
  }

  Future<void> loadMore() async {
    final current = state;
    if (current.value != null) {
      final nextPage = _currentPage + 1;
      if (nextPage <= current.value!.totalPages) {
        _currentPage = nextPage;
        final result = await AsyncValue.guard(() => _repository.getVisitors(
              page: _currentPage,
              limit: _pageSize,
              search: _searchQuery.isEmpty ? null : _searchQuery,
              status: _statusFilter,
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

  Future<void> createVisitor(Map<String, dynamic> data) async {
    try {
      await _repository.createVisitor(data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateVisitor(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updateVisitor(id, data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteVisitor(String id) async {
    try {
      await _repository.deleteVisitor(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}
