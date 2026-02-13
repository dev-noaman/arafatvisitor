// Unit tests for Hosts Provider
//
// Tests cover:
// - Initial state with pagination
// - Pagination with search and type filtering (EXTERNAL/INTERNAL)
// - LoadMore operation for infinite scroll
// - CRUD operations (create, update, delete)
// - AsyncValue state transitions (loading → data → error)
// - State refresh and reset functionality

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/models/host.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/features/hosts/providers/hosts_provider.dart';
import 'package:arafatvisitor/features/hosts/data/hosts_repository.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class MockHostsRepository extends Mock implements HostsRepository {}

void main() {
  group('HostsListNotifier Provider', () {
    late MockHostsRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockHostsRepository();
      container = ProviderContainer(
        overrides: [
          hostsRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AsyncLoading', () {
        final state = container.read(hostsListProvider);
        expect(state, isA<AsyncLoading>());
      });

      test('Initial load fetches hosts on page 1', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        // ACT
        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));
        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).called(1);

        container2.dispose();
      });
    });

    group('Fetch Hosts with Pagination', () {
      test('getHosts success returns paginated data', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.total, equals(mockResponse.total));
        expect(state.value?.totalPages, equals(mockResponse.totalPages));

        container2.dispose();
      });

      test('getHosts returns empty list on 200 with no data', () async {
        // ARRANGE
        final emptyResponse = PaginatedResponse<Host>(
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        );
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => emptyResponse);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isEmpty);

        container2.dispose();
      });

      test('getHosts throws on network error', () async {
        // ARRANGE
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenThrow(Exception('Network error'));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(hostsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Search Functionality', () {
      test('search updates query and resets to page 1', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: 'Tech Corp',
          type: null,
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockExternalHost()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.search('Tech Corp');

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));

        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: 'Tech Corp',
          type: null,
        )).called(1);

        container2.dispose();
      });

      test('empty search query sends null to repository', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.search('');

        // ASSERT
        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('Type Filtering (EXTERNAL/INTERNAL)', () {
      test('setTypeFilter for EXTERNAL hosts', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: 'EXTERNAL',
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockExternalHost()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.setTypeFilter('EXTERNAL');

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isNotEmpty);

        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: 'EXTERNAL',
        )).called(1);

        container2.dispose();
      });

      test('setTypeFilter for INTERNAL hosts', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: 'INTERNAL',
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockInternalHost()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.setTypeFilter('INTERNAL');

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.value?.data, isNotEmpty);

        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: 'INTERNAL',
        )).called(1);

        container2.dispose();
      });

      test('setTypeFilter with null clears filter', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: any(named: 'type'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.setTypeFilter(null);

        // ASSERT
        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('Pagination - LoadMore', () {
      test('loadMore appends next page data to existing list', () async {
        // ARRANGE
        final page1 = PaginatedResponse(
          data: [createMockExternalHost()],
          total: 40,
          page: 1,
          limit: 20,
          totalPages: 2,
        );
        final page2 = PaginatedResponse(
          data: [createMockInternalHost()],
          total: 40,
          page: 2,
          limit: 20,
          totalPages: 2,
        );

        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => page1);

        when(() => mockRepository.getHosts(
          page: 2,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => page2);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.value?.data.length, equals(2));
        expect(state.value?.page, equals(2));

        verify(() => mockRepository.getHosts(
          page: 2,
          limit: 20,
          search: null,
          type: null,
        )).called(1);

        container2.dispose();
      });

      test('loadMore does not exceed totalPages', () async {
        // ARRANGE
        final lastPage = PaginatedResponse(
          data: [createMockExternalHost()],
          total: 20,
          page: 1,
          limit: 20,
          totalPages: 1,
        );

        when(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).thenAnswer((_) async => lastPage);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        verify(() => mockRepository.getHosts(
          page: 2,
          limit: 20,
          search: null,
          type: null,
        )).called(0);

        container2.dispose();
      });
    });

    group('Create Operations', () {
      test('createHost success reloads data', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createHost(any()))
            .thenAnswer((_) async => createMockExternalHost());

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.createHost({
          'name': 'John Manager',
          'company': 'Tech Corp',
          'email': 'john@techcorp.com'
        });

        // ASSERT
        verify(() => mockRepository.createHost(any())).called(1);

        container2.dispose();
      });

      test('createHost failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createHost(any()))
            .thenThrow(Exception('Create failed'));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.createHost({'name': 'John', 'company': 'Tech Corp'});

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Update Operations', () {
      test('updateHost success reloads data', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateHost(any(), any()))
            .thenAnswer((_) async => createMockExternalHost());

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.updateHost('host_1', {'name': 'John Smith'});

        // ASSERT
        verify(() => mockRepository.updateHost('host_1', any())).called(1);

        container2.dispose();
      });

      test('updateHost failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateHost(any(), any()))
            .thenThrow(Exception('Update failed'));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.updateHost('host_1', {'name': 'John'});

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Delete Operations', () {
      test('deleteHost success reloads data', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteHost(any()))
            .thenAnswer((_) async => {});

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.deleteHost('host_1');

        // ASSERT
        verify(() => mockRepository.deleteHost('host_1')).called(1);

        container2.dispose();
      });

      test('deleteHost failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          type: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteHost(any()))
            .thenThrow(Exception('Delete failed'));

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.deleteHost('host_1');

        // ASSERT
        final state = container2.read(hostsListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Refresh and Reset', () {
      test('refresh resets pagination, search, and type filter', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
          type: any(named: 'type'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        await notifier.search('Tech Corp');
        await notifier.setTypeFilter('EXTERNAL');
        await notifier.refresh();

        // ASSERT
        verify(() => mockRepository.getHosts(
          page: 1,
          limit: 20,
          search: null,
          type: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('AsyncValue State Transitions', () {
      test('State transitions to AsyncLoading on search', () async {
        // ARRANGE
        final mockResponse = mockHostsPaginatedResponse;
        when(() => mockRepository.getHosts(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
          type: null,
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return mockResponse;
        });

        final container2 = ProviderContainer(
          overrides: [
            hostsRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(hostsListProvider.notifier);

        // ACT
        final searchFuture = notifier.search('Tech Corp');
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container2.read(hostsListProvider);
        expect(state, isA<AsyncLoading>());

        // Wait for completion
        await searchFuture;
        state = container2.read(hostsListProvider);
        expect(state, isA<AsyncData>());

        container2.dispose();
      });
    });
  });
}
