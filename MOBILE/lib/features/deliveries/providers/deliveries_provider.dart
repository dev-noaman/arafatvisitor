import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/delivery.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/providers/core_providers.dart';
import '../data/deliveries_repository.dart';

final deliveriesRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return DeliveriesRepository(dio: dio);
});

final deliveriesListProvider =
    StateNotifierProvider<DeliveriesListNotifier, AsyncValue<PaginatedResponse<Delivery>>>((ref) {
  final repository = ref.watch(deliveriesRepositoryProvider);
  return DeliveriesListNotifier(repository);
});

class DeliveriesListNotifier extends StateNotifier<AsyncValue<PaginatedResponse<Delivery>>> {
  final DeliveriesRepository _repository;

  DeliveriesListNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadInitial();
  }

  int _currentPage = 1;
  final int _pageSize = 20;
  String _searchQuery = '';
  String? _statusFilter;

  Future<void> _loadInitial() async {
    state = await AsyncValue.guard(() => _repository.getDeliveries(
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
        final result = await AsyncValue.guard(() => _repository.getDeliveries(
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

  Future<void> createDelivery(Map<String, dynamic> data) async {
    try {
      await _repository.createDelivery(data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> updateDelivery(String id, Map<String, dynamic> data) async {
    try {
      await _repository.updateDelivery(id, data);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> deleteDelivery(String id) async {
    try {
      await _repository.deleteDelivery(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> markPickedUp(String id) async {
    try {
      await _repository.markPickedUp(id);
      await _loadInitial();
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}
