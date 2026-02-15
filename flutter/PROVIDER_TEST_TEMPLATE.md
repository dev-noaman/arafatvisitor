# Provider Test Implementation Template

Use this template to quickly implement remaining provider tests (14 more).

## Template Pattern

```dart
// Unit tests for [Feature]Provider
//
// Tests cover:
// - Initial state
// - Fetch/create/update/delete operations
// - AsyncValue state transitions (loading → data → error)
// - Repository integration
// - Error handling

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafat_vms/features/[feature]/providers/[feature]_provider.dart';
import 'package:arafat_vms/features/[feature]/data/[feature]_repository.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

class Mock[Feature]Repository extends Mock implements [Feature]Repository {}

void main() {
  group('[Feature]Notifier Provider', () {
    late Mock[Feature]Repository mockRepository;
    late ProviderContainer container;

    setUp(() {
      mockRepository = Mock[Feature]Repository();
      container = ProviderContainer(
        overrides: [
          [feature]RepositoryProvider.overrideWithValue(mockRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    group('Initial State', () {
      test('Initial state contains null data', () {
        final state = container.read([feature]NotifierProvider).value;
        expect(state, isNull);
      });
    });

    group('Fetch Operations', () {
      test('fetch[Feature] success returns data', () async {
        // ARRANGE
        final testData = createMock[Feature]();
        when(() => mockRepository.get[Features](...))
            .thenAnswer((_) async => testData);

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        await notifier.fetch[Features]();

        // ASSERT
        final state = container.read([feature]NotifierProvider);
        expect(state.value, isNotEmpty);
        verify(() => mockRepository.get[Features](...)).called(1);
      });

      test('fetch[Feature] failure returns AsyncError', () async {
        // ARRANGE
        when(() => mockRepository.get[Features](...))
            .thenThrow(Exception('Network error'));

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        await notifier.fetch[Features]();

        // ASSERT
        final state = container.read([feature]NotifierProvider);
        expect(state.hasError, isTrue);
      });
    });

    group('Create Operations', () {
      test('create[Feature] success updates state', () async {
        // ARRANGE
        final newItem = createMock[Feature]();
        when(() => mockRepository.create[Feature](any()))
            .thenAnswer((_) async => newItem);

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        await notifier.create[Feature]({'field': 'value'});

        // ASSERT
        verify(() => mockRepository.create[Feature](any())).called(1);
      });
    });

    group('Update Operations', () {
      test('update[Feature] success refreshes data', () async {
        // ARRANGE
        final updatedItem = createMock[Feature]();
        when(() => mockRepository.update[Feature](any(), any()))
            .thenAnswer((_) async => updatedItem);

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        await notifier.update[Feature]('id', {'field': 'value'});

        // ASSERT
        verify(() => mockRepository.update[Feature](any(), any())).called(1);
      });
    });

    group('Delete Operations', () {
      test('delete[Feature] success removes item', () async {
        // ARRANGE
        when(() => mockRepository.delete[Feature](any()))
            .thenAnswer((_) async => {});

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        await notifier.delete[Feature]('id');

        // ASSERT
        verify(() => mockRepository.delete[Feature]('id')).called(1);
      });
    });

    group('AsyncValue State', () {
      test('State transitions to AsyncLoading during fetch', () async {
        // ARRANGE
        when(() => mockRepository.get[Features](...))
            .thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return [];
        });

        final notifier = container.read([feature]NotifierProvider.notifier);

        // ACT
        final fetchFuture = notifier.fetch[Features]();
        await Future.delayed(const Duration(milliseconds: 25));

        var state = container.read([feature]NotifierProvider);
        expect(state, isA<AsyncLoading>());

        await fetchFuture;
        state = container.read([feature]NotifierProvider);
        expect(state, isA<AsyncData>());
      });
    });

    group('Convenience Providers', () {
      test('[Feature] convenience provider returns data', () async {
        // ARRANGE
        final testData = createMock[Feature]();
        when(() => mockRepository.get[Features](...))
            .thenAnswer((_) async => [testData]);

        final notifier = container.read([feature]NotifierProvider.notifier);
        await notifier.fetch[Features]();

        // ACT
        final items = container.read([feature]sProvider);

        // ASSERT
        expect(items, isNotEmpty);
      });
    });
  });
}
```

## Providers to Implement

### List 1 (Data Providers)
- `visitors_provider_test.dart` - Uses VisitorsRepository
- `pre_register_provider_test.dart` - Uses PreRegisterRepository
- `deliveries_provider_test.dart` - Uses DeliveriesRepository
- `hosts_provider_test.dart` - Uses HostsRepository
- `profile_provider_test.dart` - Uses ProfileRepository (changePassword)

### List 2 (Lookup/Cache Providers)
- `lookups_provider_test.dart` - Caches lookup data (purposes, delivery types, couriers, locations)
- `qr_scan_provider_test.dart` - QR scanning and session state

### Implementation Steps for Each

1. **Create Mock[Repository]** class extending Mock
2. **Setup ProviderContainer** with override
3. **Test fetch/create/update/delete** operations
4. **Test error handling** (AsyncError states)
5. **Test AsyncValue transitions** (loading → data → error)
6. **Test convenience providers** (if applicable)
7. **Verify repository calls** with Mocktail

## Quick Reference: Changes Needed

For each provider test file:

1. Replace header comments with correct feature name
2. Import correct provider and repository
3. Create correct Mock[Repository] class
4. Update setUp to override correct provider
5. Update test methods to call actual repository methods
6. Use factory functions from fixtures (createMock[Type])
7. Verify with Mocktail when/verify patterns

## Example: Completing visitors_provider_test.dart

```dart
// File: test/features/visitors/providers/visitors_provider_test.dart

import 'package:arafat_vms/features/visitors/providers/visitors_provider.dart';
import 'package:arafat_vms/features/visitors/data/visitors_repository.dart';
import '../../fixtures/factories.dart';

class MockVisitorsRepository extends Mock implements VisitorsRepository {}

void main() {
  group('VisitorsNotifier Provider', () {
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

    group('Fetch Visitors', () {
      test('getVisitors success returns paginated data', () async {
        final mockResponse = mockVisitsPaginatedResponse;
        when(() => mockRepository.getVisitors(
          page: 1,
          limit: 10,
        )).thenAnswer((_) async => mockResponse);

        final notifier = container.read(visitorsNotifierProvider.notifier);
        await notifier.getVisitors(page: 1, limit: 10);

        final state = container.read(visitorsNotifierProvider);
        expect(state.value?.data, isNotEmpty);
      });
    });

    // ... continue with create, update, delete tests
  });
}
```

## Running Tests

```bash
# Run all provider tests
flutter test test/features/*/providers/*_provider_test.dart

# Run specific provider test
flutter test test/features/visitors/providers/visitors_provider_test.dart

# Run with coverage
flutter test --coverage
```

## Expected Coverage

After implementing all provider tests:
- Each provider should have 8-12 tests
- Coverage target: >85% for provider code
- All AsyncValue states tested
- All error scenarios tested
- Repository integration verified
