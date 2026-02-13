// Unit tests for Deliveries Provider
//
// Tests cover:
// - Initial state with pagination
// - Pagination with search and status filtering
// - LoadMore operation for infinite scroll
// - CRUD operations (create, update, delete)
// - Delivery status workflow (mark picked up)
// - AsyncValue state transitions (loading → data → error)
// - State refresh and reset functionality

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/models/delivery.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/features/deliveries/providers/deliveries_provider.dart';
import 'package:arafatvisitor/features/deliveries/data/deliveries_repository.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class MockDeliveriesRepository extends Mock implements DeliveriesRepository {}

void main() {
  group('DeliveriesListNotifier Provider', () {
    late MockDeliveriesRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockDeliveriesRepository();
      container = ProviderContainer(
        overrides: [
          deliveriesRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AsyncLoading', () {
        final state = container.read(deliveriesListProvider);
        expect(state, isA<AsyncLoading>());
      });

      test('Initial load fetches deliveries on page 1', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        // ACT
        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));
        verify(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).called(1);

        container2.dispose();
      });
    });

    group('Fetch Deliveries with Pagination', () {
      test('getDeliveries success returns paginated data', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.total, equals(mockResponse.total));
        expect(state.value?.totalPages, equals(mockResponse.totalPages));

        container2.dispose();
      });

      test('getDeliveries returns empty list on 200 with no data', () async {
        // ARRANGE
        final emptyResponse = PaginatedResponse<Delivery>(
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        );
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => emptyResponse);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data, isEmpty);

        container2.dispose();
      });

      test('getDeliveries throws on network error', () async {
        // ARRANGE
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenThrow(Exception('Network error'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Search Functionality', () {
      test('search updates query and resets to page 1', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: 'DHL',
          status: null,
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockDocumentDelivery()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.search('DHL');

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));

        verify(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: 'DHL',
          status: null,
        )).called(1);

        container2.dispose();
      });

      test('empty search query sends null to repository', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.search('');

        // ASSERT
        verify(() => mockRepository.getDeliveries(
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
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: 'RECEIVED',
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockDocumentDelivery()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.setStatusFilter('RECEIVED');

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data, isNotEmpty);

        verify(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: 'RECEIVED',
        )).called(1);

        container2.dispose();
      });

      test('setStatusFilter with null clears filter', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: any(named: 'status'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.setStatusFilter(null);

        // ASSERT
        verify(() => mockRepository.getDeliveries(
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
          data: [createMockDocumentDelivery()],
          total: 40,
          page: 1,
          limit: 20,
          totalPages: 2,
        );
        final page2 = PaginatedResponse(
          data: [createMockFoodDelivery()],
          total: 40,
          page: 2,
          limit: 20,
          totalPages: 2,
        );

        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => page1);

        when(() => mockRepository.getDeliveries(
          page: 2,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => page2);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.value?.data.length, equals(2));
        expect(state.value?.page, equals(2));

        verify(() => mockRepository.getDeliveries(
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
          data: [createMockDocumentDelivery()],
          total: 20,
          page: 1,
          limit: 20,
          totalPages: 1,
        );

        when(() => mockRepository.getDeliveries(
          page: 1,
          limit: 20,
          search: null,
          status: null,
        )).thenAnswer((_) async => lastPage);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        verify(() => mockRepository.getDeliveries(
          page: 2,
          limit: 20,
          search: null,
          status: null,
        )).called(0);

        container2.dispose();
      });
    });

    group('Create Operations', () {
      test('createDelivery success reloads data', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createDelivery(any()))
            .thenAnswer((_) async => createMockDocumentDelivery());

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.createDelivery({
          'deliveryType': 'Document',
          'recipient': 'Ahmed',
          'hostId': '1'
        });

        // ASSERT
        verify(() => mockRepository.createDelivery(any())).called(1);

        container2.dispose();
      });

      test('createDelivery failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createDelivery(any()))
            .thenThrow(Exception('Create failed'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.createDelivery({'deliveryType': 'Document'});

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Update Operations', () {
      test('updateDelivery success reloads data', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateDelivery(any(), any()))
            .thenAnswer((_) async => createMockDocumentDelivery());

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.updateDelivery('delivery_1', {'recipient': 'Ahmed Khan'});

        // ASSERT
        verify(() => mockRepository.updateDelivery('delivery_1', any())).called(1);

        container2.dispose();
      });

      test('updateDelivery failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updateDelivery(any(), any()))
            .thenThrow(Exception('Update failed'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.updateDelivery('delivery_1', {'recipient': 'Ahmed'});

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Delete Operations', () {
      test('deleteDelivery success reloads data', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteDelivery(any()))
            .thenAnswer((_) async => {});

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.deleteDelivery('delivery_1');

        // ASSERT
        verify(() => mockRepository.deleteDelivery('delivery_1')).called(1);

        container2.dispose();
      });

      test('deleteDelivery failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deleteDelivery(any()))
            .thenThrow(Exception('Delete failed'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.deleteDelivery('delivery_1');

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Delivery Workflow - Mark Picked Up', () {
      test('markPickedUp success reloads data', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.markPickedUp(any()))
            .thenAnswer((_) async => createMockPickedUpDelivery());

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.markPickedUp('delivery_1');

        // ASSERT
        verify(() => mockRepository.markPickedUp('delivery_1')).called(1);

        container2.dispose();
      });

      test('markPickedUp failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.markPickedUp(any()))
            .thenThrow(Exception('Mark picked up failed'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.markPickedUp('delivery_1');

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });

      test('markPickedUp on already picked up delivery throws 400', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
          status: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.markPickedUp(any()))
            .thenThrow(Exception('Delivery already picked up'));

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.markPickedUp('delivery_1');

        // ASSERT
        final state = container2.read(deliveriesListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Refresh and Reset', () {
      test('refresh resets pagination, search, and status', () async {
        // ARRANGE
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
          status: any(named: 'status'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        await notifier.search('DHL');
        await notifier.setStatusFilter('RECEIVED');
        await notifier.refresh();

        // ASSERT
        verify(() => mockRepository.getDeliveries(
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
        final mockResponse = mockDeliveriesPaginatedResponse;
        when(() => mockRepository.getDeliveries(
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
            deliveriesRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(deliveriesListProvider.notifier);

        // ACT
        final searchFuture = notifier.search('DHL');
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container2.read(deliveriesListProvider);
        expect(state, isA<AsyncLoading>());

        // Wait for completion
        await searchFuture;
        state = container2.read(deliveriesListProvider);
        expect(state, isA<AsyncData>());

        container2.dispose();
      });
    });
  });
}
