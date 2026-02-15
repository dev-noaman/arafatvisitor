import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/dashboard.dart';
import '../data/dashboard_repository.dart';

part 'dashboard_provider.g.dart';

/// Dashboard data state
class DashboardData {
  const DashboardData({
    this.kpis,
    this.pendingApprovals,
    this.currentVisitors,
    this.receivedDeliveries,
    this.charts,
  });

  final DashboardKpis? kpis;
  final List<PendingApproval>? pendingApprovals;
  final List<CurrentVisitor>? currentVisitors;
  final List<ReceivedDelivery>? receivedDeliveries;
  final Map<String, dynamic>? charts;

  DashboardData copyWith({
    DashboardKpis? kpis,
    List<PendingApproval>? pendingApprovals,
    List<CurrentVisitor>? currentVisitors,
    List<ReceivedDelivery>? receivedDeliveries,
    Map<String, dynamic>? charts,
  }) {
    return DashboardData(
      kpis: kpis ?? this.kpis,
      pendingApprovals: pendingApprovals ?? this.pendingApprovals,
      currentVisitors: currentVisitors ?? this.currentVisitors,
      receivedDeliveries: receivedDeliveries ?? this.receivedDeliveries,
      charts: charts ?? this.charts,
    );
  }
}

/// Dashboard provider
@riverpod
class DashboardNotifier extends AsyncNotifier<DashboardData> {
  @override
  DashboardData build() {
    return const DashboardData();
  }

  /// Fetch all dashboard data in parallel
  Future<void> fetchDashboardData() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);

      // Fetch all data in parallel using Future.wait
      final results = await Future.wait([
        dashboardRepository.getKpis(),
        dashboardRepository.getPendingApprovals(),
        dashboardRepository.getCurrentVisitors(),
        dashboardRepository.getReceivedDeliveries(),
        dashboardRepository.getCharts(),
      ]);

      return DashboardData(
        kpis: results[0] as DashboardKpis,
        pendingApprovals: results[1] as List<PendingApproval>,
        currentVisitors: results[2] as List<CurrentVisitor>,
        receivedDeliveries: results[3] as List<ReceivedDelivery>,
        charts: results[4] as Map<String, dynamic>,
      );
    });
  }

  /// Approve a visit
  Future<void> approveVisit(int visitId) async {
    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      await dashboardRepository.approveVisit(visitId);

      // Refresh pending approvals after approval
      await fetchPendingApprovals();
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Reject a visit
  Future<void> rejectVisit(int visitId) async {
    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      await dashboardRepository.rejectVisit(visitId);

      // Refresh pending approvals after rejection
      await fetchPendingApprovals();
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Check out a visitor
  Future<void> checkOutVisitor(int visitId) async {
    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      await dashboardRepository.checkOutVisitor(visitId);

      // Refresh current visitors after checkout
      await fetchCurrentVisitors();
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Refresh only KPIs
  Future<void> fetchKpis() async {
    final currentData = state.value;
    if (currentData == null) return;

    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      final kpis = await dashboardRepository.getKpis();
      state = AsyncData(currentData.copyWith(kpis: kpis));
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Refresh only pending approvals
  Future<void> fetchPendingApprovals() async {
    final currentData = state.value;
    if (currentData == null) return;

    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      final pendingApprovals = await dashboardRepository.getPendingApprovals();
      state = AsyncData(
        currentData.copyWith(pendingApprovals: pendingApprovals),
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Refresh only current visitors
  Future<void> fetchCurrentVisitors() async {
    final currentData = state.value;
    if (currentData == null) return;

    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      final currentVisitors = await dashboardRepository.getCurrentVisitors();
      state = AsyncData(currentData.copyWith(currentVisitors: currentVisitors));
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Refresh only received deliveries
  Future<void> fetchReceivedDeliveries() async {
    final currentData = state.value;
    if (currentData == null) return;

    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      final receivedDeliveries = await dashboardRepository
          .getReceivedDeliveries();
      state = AsyncData(
        currentData.copyWith(receivedDeliveries: receivedDeliveries),
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Refresh only charts data
  Future<void> fetchCharts() async {
    final currentData = state.value;
    if (currentData == null) return;

    try {
      final dashboardRepository = ref.read(dashboardRepositoryProvider);
      final charts = await dashboardRepository.getCharts();
      state = AsyncData(currentData.copyWith(charts: charts));
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  /// Pull-to-refresh: invalidate and refetch all data
  Future<void> refresh() async {
    ref.invalidateSelf();
    await fetchDashboardData();
  }
}

/// Dashboard data provider (convenience)
@riverpod
DashboardKpis? dashboardKpis(DashboardKpisRef ref) {
  return ref.watch(dashboardNotifierProvider).value?.kpis;
}

/// Pending approvals provider (convenience)
@riverpod
List<PendingApproval>? pendingApprovals(PendingApprovalsRef ref) {
  return ref.watch(dashboardNotifierProvider).value?.pendingApprovals;
}

/// Current visitors provider (convenience)
@riverpod
List<CurrentVisitor>? currentVisitors(CurrentVisitorsRef ref) {
  return ref.watch(dashboardNotifierProvider).value?.currentVisitors;
}

/// Received deliveries provider (convenience)
@riverpod
List<ReceivedDelivery>? receivedDeliveries(ReceivedDeliveriesRef ref) {
  return ref.watch(dashboardNotifierProvider).value?.receivedDeliveries;
}

/// Charts data provider (convenience)
@riverpod
Map<String, dynamic>? chartsData(ChartsDataRef ref) {
  return ref.watch(dashboardNotifierProvider).value?.charts;
}
