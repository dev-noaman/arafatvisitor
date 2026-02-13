// Unit tests for Pre-Registration Provider
//
// Tests cover:
// - Initial state with pagination
// - Pagination with search filtering
// - LoadMore operation for infinite scroll
// - CRUD operations (create, update, delete)
// - Workflow operations (approve, reject, re-approve)
// - AsyncValue state transitions (loading → data → error)
// - State refresh and reset functionality

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/features/pre_register/providers/pre_register_provider.dart';
import 'package:arafatvisitor/features/pre_register/data/pre_register_repository.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class MockPreRegisterRepository extends Mock implements PreRegisterRepository {}

void main() {
  group('PreRegisterListNotifier Provider', () {
    late MockPreRegisterRepository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = MockPreRegisterRepository();
      container = ProviderContainer(
        overrides: [
          preRegisterRepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state is AsyncLoading', () {
        final state = container.read(preRegisterListProvider);
        expect(state, isA<AsyncLoading>());
      });

      test('Initial load fetches pre-registrations on page 1', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => mockResponse);

        // ACT
        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));
        verify(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).called(1);

        container2.dispose();
      });
    });

    group('Fetch Pre-Registrations with Pagination', () {
      test('getPreRegistrations success returns paginated data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(preRegisterListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.total, equals(mockResponse.total));
        expect(state.value?.totalPages, equals(mockResponse.totalPages));

        container2.dispose();
      });

      test('getPreRegistrations returns empty list on 200 with no data', () async {
        // ARRANGE
        final emptyResponse = PaginatedResponse<Visit>(
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        );
        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => emptyResponse);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(preRegisterListProvider);
        expect(state.value?.data, isEmpty);

        container2.dispose();
      });

      test('getPreRegistrations throws on network error', () async {
        // ARRANGE
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenThrow(Exception('Network error'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Search Functionality', () {
      test('search updates query and resets to page 1', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: 'Ahmed',
        )).thenAnswer((_) async => PaginatedResponse(
          data: [createMockPendingApprovalVisit()],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        ));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.search('Ahmed');

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.value?.data, isNotEmpty);
        expect(state.value?.page, equals(1));

        verify(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: 'Ahmed',
        )).called(1);

        container2.dispose();
      });

      test('empty search query sends null to repository', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.search('');

        // ASSERT
        verify(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('Pagination - LoadMore', () {
      test('loadMore appends next page data to existing list', () async {
        // ARRANGE
        final page1 = PaginatedResponse(
          data: [createMockPendingApprovalVisit()],
          total: 40,
          page: 1,
          limit: 20,
          totalPages: 2,
        );
        final page2 = PaginatedResponse(
          data: [createMockRejectedVisit()],
          total: 40,
          page: 2,
          limit: 20,
          totalPages: 2,
        );

        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => page1);

        when(() => mockRepository.getPreRegistrations(
          page: 2,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => page2);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.value?.data.length, equals(2));
        expect(state.value?.page, equals(2));

        verify(() => mockRepository.getPreRegistrations(
          page: 2,
          limit: 20,
          search: null,
        )).called(1);

        container2.dispose();
      });

      test('loadMore does not exceed totalPages', () async {
        // ARRANGE
        final lastPage = PaginatedResponse(
          data: [createMockPendingApprovalVisit()],
          total: 20,
          page: 1,
          limit: 20,
          totalPages: 1,
        );

        when(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).thenAnswer((_) async => lastPage);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.loadMore();

        // ASSERT
        verify(() => mockRepository.getPreRegistrations(
          page: 2,
          limit: 20,
          search: null,
        )).called(0);

        container2.dispose();
      });
    });

    group('Create Operations', () {
      test('createPreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createPreRegistration(any()))
            .thenAnswer((_) async => createMockPendingApprovalVisit());

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.createPreRegistration({
          'visitorName': 'Ahmed',
          'hostId': '1',
          'expectedDate': '2026-02-14T10:00:00Z'
        });

        // ASSERT
        verify(() => mockRepository.createPreRegistration(any())).called(1);

        container2.dispose();
      });

      test('createPreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.createPreRegistration(any()))
            .thenThrow(Exception('Create failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.createPreRegistration({'visitorName': 'Ahmed'});

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Update Operations', () {
      test('updatePreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updatePreRegistration(any(), any()))
            .thenAnswer((_) async => createMockPendingApprovalVisit());

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.updatePreRegistration('visit_1', {'visitorName': 'Ahmed Khan'});

        // ASSERT
        verify(() => mockRepository.updatePreRegistration('visit_1', any())).called(1);

        container2.dispose();
      });

      test('updatePreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.updatePreRegistration(any(), any()))
            .thenThrow(Exception('Update failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.updatePreRegistration('visit_1', {'visitorName': 'Ahmed'});

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Delete Operations', () {
      test('deletePreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deletePreRegistration(any()))
            .thenAnswer((_) async => {});

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.deletePreRegistration('visit_1');

        // ASSERT
        verify(() => mockRepository.deletePreRegistration('visit_1')).called(1);

        container2.dispose();
      });

      test('deletePreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.deletePreRegistration(any()))
            .thenThrow(Exception('Delete failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.deletePreRegistration('visit_1');

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Workflow Operations - Approve', () {
      test('approvePreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.approvePreRegistration(any()))
            .thenAnswer((_) async => createMockApprovedVisit());

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.approvePreRegistration('visit_1');

        // ASSERT
        verify(() => mockRepository.approvePreRegistration('visit_1')).called(1);

        container2.dispose();
      });

      test('approvePreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.approvePreRegistration(any()))
            .thenThrow(Exception('Approve failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.approvePreRegistration('visit_1');

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Workflow Operations - Reject', () {
      test('rejectPreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.rejectPreRegistration(any()))
            .thenAnswer((_) async => createMockRejectedVisit());

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.rejectPreRegistration('visit_1');

        // ASSERT
        verify(() => mockRepository.rejectPreRegistration('visit_1')).called(1);

        container2.dispose();
      });

      test('rejectPreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.rejectPreRegistration(any()))
            .thenThrow(Exception('Reject failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.rejectPreRegistration('visit_1');

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Workflow Operations - Re-Approve', () {
      test('reApprovePreRegistration success reloads data', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.reApprovePreRegistration(any()))
            .thenAnswer((_) async => createMockApprovedVisit());

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.reApprovePreRegistration('visit_1');

        // ASSERT
        verify(() => mockRepository.reApprovePreRegistration('visit_1')).called(1);

        container2.dispose();
      });

      test('reApprovePreRegistration failure sets error state', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: null,
        )).thenAnswer((_) async => mockResponse);

        when(() => mockRepository.reApprovePreRegistration(any()))
            .thenThrow(Exception('Re-approve failed'));

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.reApprovePreRegistration('visit_1');

        // ASSERT
        final state = container2.read(preRegisterListProvider);
        expect(state.hasError, isTrue);

        container2.dispose();
      });
    });

    group('Refresh and Reset', () {
      test('refresh resets pagination and search', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
        )).thenAnswer((_) async => mockResponse);

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        await notifier.search('Ahmed');
        await notifier.refresh();

        // ASSERT
        verify(() => mockRepository.getPreRegistrations(
          page: 1,
          limit: 20,
          search: null,
        )).called(atLeast(1));

        container2.dispose();
      });
    });

    group('AsyncValue State Transitions', () {
      test('State transitions to AsyncLoading on search', () async {
        // ARRANGE
        final mockResponse = mockPreRegsPaginatedResponse;
        when(() => mockRepository.getPreRegistrations(
          page: any(named: 'page'),
          limit: any(named: 'limit'),
          search: any(named: 'search'),
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return mockResponse;
        });

        final container2 = ProviderContainer(
          overrides: [
            preRegisterRepositoryProvider.overrideWithValue(mockRepository),
          ],
        );
        await Future.delayed(const Duration(milliseconds: 100));

        final notifier = container2.read(preRegisterListProvider.notifier);

        // ACT
        final searchFuture = notifier.search('Ahmed');
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container2.read(preRegisterListProvider);
        expect(state, isA<AsyncLoading>());

        // Wait for completion
        await searchFuture;
        state = container2.read(preRegisterListProvider);
        expect(state, isA<AsyncData>());

        container2.dispose();
      });
    });
  });
}
