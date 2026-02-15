// Unit tests for Visitors List Provider
//
// Tests cover:
// - Initial state with pagination
// - Pagination with search and status filtering
// - LoadMore operation for infinite scroll
// - CRUD operations (create, update, delete)
// - AsyncValue state transitions (loading → data → error)
// - State refresh and reset functionality

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/features/visitors/providers/visitors_provider.dart';
import 'package:arafatvisitor/features/visitors/data/visitors_repository.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class MockVisitorsRepository extends Mock implements VisitorsRepository {}

void main() {
  group('VisitorsListNotifier Provider', () {
    late MockVisitorsRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockVisitorsRepository();
      container = ProviderContainer(
        overrides: [
          visitorsRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AsyncLoading', () {
        final state = container.read(visitorsListProvider);
        expect(state, isA<AsyncLoading>());
      });

      test('Initial load fetches visitors on page 1', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        // ACT - Create container to trigger _loadInitial
        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );

        await Future.delayed(const Duration(milliseconds: 100));

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));
        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(1);

        container2.dispose();
      });
    });

    group('Fetch Visitors with Pagination', () {
      test('getVisitors success returns paginated data', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(visitorsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.total, equals(mockResponse.total));
        expect(state.value?.totalPages, equals(mockResponse.totalPages));

        container2.dispose();
      });

      test('getVisitors returns empty list on 200 with no data', () async {
        // ARRANGE
        final emptyResponse = PaginatedResponse<Visit>(
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        );
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => emptyResponse);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(visitorsListProvider);
        expect(state.value?.data, isEmpty);

        container2.dispose();
      });

      test('getVisitors throws on network error', () async {
        // ARRANGE
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenThrow(Exception('Network error'));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(visitorsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Search Functionality', () {
      test('search updates query and resets to page 1', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: 'John',
          status: null,
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockApprovedVisit()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.search('John');

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));

        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: 'John',
          status: null,
        )).called(1);

        container2.dispose();
      });

      test('empty search query sends null to repository', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.search('');

        // ASSERT
        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('Status Filtering', () {
      test('setStatusFilter updates filter and resets to page 1', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: 'APPROVED',
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockApprovedVisit()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.setStatusFilter('APPROVED');

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.value?.data, isNotEmpty);

        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: 'APPROVED',
        )).called(1);

        container2.dispose();
      });

      test('setStatusFilter with null clears filter', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: any(named: 'status'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.setStatusFilter(null);

        // ASSERT
        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('Pagination - LoadMore', () {
      test('loadMore appends next page data to existing list', () async {
        // ARRANGE
        final page1 = PaginatedResponse(
          data: [createMockApprovedVisit()],
          total: 40,
          page: 1,
          limit: 20,
          totalPages: 2,
        );
        final page2 = PaginatedResponse(
          data: [createMockCheckedInVisit()],
          total: 40,
          page: 2,
          limit: 20,
          totalPages: 2,
        );

        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => page1);

        when(() => mockRepository.getVisitors(
          page: 2,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => page2);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.value?.data.length, equals(2));
        expect(state.value?.page, equals(2));

        verify(() => mockRepository.getVisitors(
          page: 2,
          limit: 20,
          search: null,
          status: null,
        )).called(1);

        container2.dispose();
      });

      test('loadMore does not exceed totalPages', () async {
        // ARRANGE
        final lastPage = PaginatedResponse(
          data: [createMockApprovedVisit()],
          total: 20,
          page: 1,
          limit: 20,
          totalPages: 1,
        );

        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => lastPage);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        verify(() => mockRepository.getVisitors(
          page: 2,
          limit: 20,
          search: null,
          status: null,
        )).called(0);

        container2.dispose();
      });
    });

    group('Create Operations', () {
      test('createVisitor success reloads data', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createVisitor(any()))
            .thenAnswer((_) async => createMockApprovedVisit());

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.createVisitor({'visitorName': 'Ahmed', 'hostId': '1'});

        // ASSERT
        verify(() => mockRepository.createVisitor(any())).called(1);
        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(atLeast(1));

        container2.dispose();
      });

      test('createVisitor failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createVisitor(any()))
            .thenThrow(Exception('Create failed'));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.createVisitor({'visitorName': 'Ahmed'});

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Update Operations', () {
      test('updateVisitor success reloads data', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateVisitor(any(), any()))
            .thenAnswer((_) async => createMockApprovedVisit());

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.updateVisitor('visit_1', {'visitorName': 'Ahmed Khan'});

        // ASSERT
        verify(() => mockRepository.updateVisitor('visit_1', any())).called(1);

        container2.dispose();
      });

      test('updateVisitor failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateVisitor(any(), any()))
            .thenThrow(Exception('Update failed'));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.updateVisitor('visit_1', {'visitorName': 'Ahmed'});

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Delete Operations', () {
      test('deleteVisitor success reloads data', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteVisitor(any()))
            .thenAnswer((_) async => {});

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.deleteVisitor('visit_1');

        // ASSERT
        verify(() => mockRepository.deleteVisitor('visit_1')).called(1);

        container2.dispose();
      });

      test('deleteVisitor failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteVisitor(any()))
            .thenThrow(Exception('Delete failed'));

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        await notifier.deleteVisitor('visit_1');

        // ASSERT
        final state = container2.read(visitorsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Refresh and Reset', () {
      test('refresh resets pagination, search, and status', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
          status: any(named: 'status'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT - Set search and filter
        await notifier.search('John');
        await notifier.setStatusFilter('APPROVED');
        // Then refresh
        await notifier.refresh();

        // ASSERT
        verify(() => mockRepository.getVisitors(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('AsyncValue State Transitions', () {
      test('State transitions to AsyncLoading on search', () async {
        // ARRANGE
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
          status: null,
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return mockResponse;
        });

        final container2 = ProviderContainer(
          overrides: [
            visitorsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(visitorsListProvider.notifier);

        // ACT
        final searchFuture = notifier.search('John');
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container2.read(visitorsListProvider);
        expect(state, isA<AsyncLoading>());

        // Wait for completion
        await searchFuture;
        state = container2.read(visitorsListProvider);
        expect(state, isA<AsyncData>());

        container2.dispose();
      });
    });
  });
}
