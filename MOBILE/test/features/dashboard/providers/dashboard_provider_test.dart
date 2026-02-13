// Unit tests for Dashboard Provider
//
// Tests cover:
// - Fetch all dashboard data in parallel (KPIs, pending approvals, visitors, deliveries, charts)
// - Individual data refresh methods (KPIs, pending approvals, current visitors)
// - Visit action workflow (approve, reject, checkout)
// - AsyncValue state transitions (loading → data → error)
// - Partial data update on refresh

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/models/dashboard.dart';
import 'package:arafatvisitor/features/dashboard/providers/dashboard_provider.dart';
import 'package:arafatvisitor/features/dashboard/data/dashboard_repository.dart';
import '../../fixtures/models.dart';

class MockDashboardRepository extends Mock implements DashboardRepository {}

void main() {
  group('DashboardNotifier Provider', () {
    late MockDashboardRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockDashboardRepository();
      container = ProviderContainer(
        overrides: [
          dashboardRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is empty DashboardData', () {
        final state = container.read(dashboardNotifierProvider);
        expect(state.value, isNotNull);
        expect(state.value?.kpis, isNull);
        expect(state.value?.pendingApprovals, isNull);
        expect(state.value?.currentVisitors, isNull);
        expect(state.value?.receivedDeliveries, isNull);
        expect(state.value?.charts, isNull);
      });
    });

    group('Fetch All Dashboard Data', () {
      test('fetchDashboardData loads all data in parallel', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => [mockPendingApproval]);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => [mockReceivedDelivery]);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {'visitTrend': [], 'visitsByHost': []});

        final notifier = container.read(dashboardNotifierProvider.notifier);

        // ACT
        await notifier.fetchDashboardData();

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.value?.kpis, isNotNull);
        expect(state.value?.pendingApprovals, isNotEmpty);
        expect(state.value?.currentVisitors, isNotEmpty);
        expect(state.value?.receivedDeliveries, isNotEmpty);
        expect(state.value?.charts, isNotEmpty);

        verify(() => mockRepository.getKpis()).called(1);
        verify(() => mockRepository.getPendingApprovals()).called(1);
        verify(() => mockRepository.getCurrentVisitors()).called(1);
        verify(() => mockRepository.getReceivedDeliveries()).called(1);
        verify(() => mockRepository.getCharts()).called(1);
      });

      test('fetchDashboardData with partial data failure', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenThrow(Exception('KPI fetch failed'));
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);

        // ACT
        await notifier.fetchDashboardData();

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.hasError, isTrue);
      });

      test('fetchDashboardData transitions to AsyncLoading', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return mockDashboardKpis;
        });
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);

        // ACT
        final fetchFuture = notifier.fetchDashboardData();
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container.read(dashboardNotifierProvider);
        expect(state, isA<AsyncLoading>());

        await fetchFuture;
        state = container.read(dashboardNotifierProvider);
        expect(state, isA<AsyncData>());
      });
    });

    group('Refresh Individual Data', () {
      test('fetchKpis updates only KPIs and preserves other data', () async {
        // ARRANGE - First load all data
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => [mockPendingApproval]);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => [mockReceivedDelivery]);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {'visitTrend': []});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        // Setup new KPI response
        final updatedKpis = DashboardKpis(
          totalHosts: 50,
          visitsToday: 10,
          deliveriesToday: 8,
        );
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => updatedKpis);

        // ACT
        await notifier.fetchKpis();

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.value?.kpis?.totalHosts, equals(50));
        expect(state.value?.pendingApprovals, isNotEmpty);
        expect(state.value?.currentVisitors, isNotEmpty);
      });

      test('fetchPendingApprovals updates only pending approvals', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => [mockPendingApproval]);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => [mockReceivedDelivery]);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        // Setup updated response
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);

        // ACT
        await notifier.fetchPendingApprovals();

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.value?.pendingApprovals, isEmpty);
        expect(state.value?.kpis, isNotNull);
      });

      test('fetchCurrentVisitors updates only current visitors', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        // Setup updated response
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);

        // ACT
        await notifier.fetchCurrentVisitors();

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.value?.currentVisitors, isEmpty);
        expect(state.value?.kpis, isNotNull);
      });
    });

    group('Visit Actions - Approve', () {
      test('approveVisit success refreshes pending approvals', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => [mockPendingApproval]);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => [mockReceivedDelivery]);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.approveVisit(any()))
            .thenAnswer((_) async => {});
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);

        // ACT
        await notifier.approveVisit(1);

        // ASSERT
        verify(() => mockRepository.approveVisit(1)).called(1);
        verify(() => mockRepository.getPendingApprovals()).called(atLeast(1));
      });

      test('approveVisit failure sets error state', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.approveVisit(any()))
            .thenThrow(Exception('Approve failed'));

        // ACT
        await notifier.approveVisit(1);

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('Visit Actions - Reject', () {
      test('rejectVisit success refreshes pending approvals', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => [mockPendingApproval]);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.rejectVisit(any()))
            .thenAnswer((_) async => {});
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);

        // ACT
        await notifier.rejectVisit(1);

        // ASSERT
        verify(() => mockRepository.rejectVisit(1)).called(1);
        verify(() => mockRepository.getPendingApprovals()).called(atLeast(1));
      });

      test('rejectVisit failure sets error state', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.rejectVisit(any()))
            .thenThrow(Exception('Reject failed'));

        // ACT
        await notifier.rejectVisit(1);

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('Visit Actions - Checkout', () {
      test('checkOutVisitor success refreshes current visitors', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => [mockCurrentVisitor]);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.checkOutVisitor(any()))
            .thenAnswer((_) async => {});
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);

        // ACT
        await notifier.checkOutVisitor(1);

        // ASSERT
        verify(() => mockRepository.checkOutVisitor(1)).called(1);
        verify(() => mockRepository.getCurrentVisitors()).called(atLeast(1));
      });

      test('checkOutVisitor failure sets error state', () async {
        // ARRANGE
        when(() => mockRepository.getKpis())
            .thenAnswer((_) async => mockDashboardKpis);
        when(() => mockRepository.getPendingApprovals())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCurrentVisitors())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getReceivedDeliveries())
            .thenAnswer((_) async => []);
        when(() => mockRepository.getCharts())
            .thenAnswer((_) async => {});

        final notifier = container.read(dashboardNotifierProvider.notifier);
        await notifier.fetchDashboardData();

        when(() => mockRepository.checkOutVisitor(any()))
            .thenThrow(Exception('Checkout failed'));

        // ACT
        await notifier.checkOutVisitor(1);

        // ASSERT
        final state = container.read(dashboardNotifierProvider);
        expect(state.hasError, isTrue);
      });
    });
  });
}
