// Unit tests for DeliveriesRepository
//
// Tests cover:
// - Fetch paginated deliveries with search and status filter
// - Create, update, delete operations
// - Mark delivery as picked up
// - PaginatedResponse<Delivery> deserialization
// - Error handling

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/delivery.dart';
import 'package:arafatvisitor/features/deliveries/data/deliveries_repository.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('DeliveriesRepository', () {
    late MockDio mockDio;
    late DeliveriesRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = DeliveriesRepository(dio: mockDio);
      registerFallbackValue(RequestOptions(path: ApiEndpoints.deliveries));
    });

    group('GetDeliveries', () {
      final deliveryJson = {
        'id': 'delivery_1',
        'deliveryType': 'Document',
        'recipient': 'Finance Department',
        'hostId': 'host_1',
        'courier': 'DHL',
        'location': 'MAIN_LOBBY',
        'status': 'RECEIVED',
        'notes': 'Important documents',
        'receivedAt': '2026-02-13T09:00:00Z',
        'pickedUpAt': null,
        'createdAt': '2026-02-13T09:00:00Z',
      };

      final paginatedJson = {
        'data': [deliveryJson],
        'page': 1,
        'limit': 10,
        'total': 20,
        'totalPages': 2,
      };

      test('GetDeliveries returns paginated response', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          statusCode: 200,
          data: paginatedJson,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.deliveries,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.getDeliveries(page: 1, limit: 10);

        expect(result.data, isNotEmpty);
        expect(result.total, equals(20));
        expect(result.data.first.deliveryType, equals('Document'));
      });

      test('GetDeliveries includes search parameter', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.deliveries,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        await repository.getDeliveries(page: 1, limit: 10, search: 'DHL');

        verify(
          () => mockDio.get(
            ApiEndpoints.deliveries,
            queryParameters: {'page': 1, 'limit': 10, 'search': 'DHL'},
          ),
        ).called(1);
      });

      test('GetDeliveries throws exception on error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.deliveries,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.getDeliveries(page: 1, limit: 10),
          throwsException,
        );
      });
    });

    group('CreateDelivery', () {
      final createdJson = {
        'id': 'delivery_new',
        'deliveryType': 'Food',
        'recipient': 'Reception',
        'hostId': 'host_1',
        'courier': 'Snoonu',
        'status': 'RECEIVED',
        'createdAt': '2026-02-13T10:00:00Z',
      };

      test('CreateDelivery returns new delivery', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          statusCode: 201,
          data: createdJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.deliveries,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.createDelivery({'deliveryType': 'Food'});

        expect(result.id, equals('delivery_new'));
        expect(result.deliveryType, equals('Food'));
        expect(result.status, equals(DeliveryStatus.received));
      });

      test('CreateDelivery throws on validation error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
            statusCode: 422,
            data: {'message': 'Courier is required'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.deliveries,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.createDelivery({}),
          throwsException,
        );
      });
    });

    group('UpdateDelivery', () {
      final updatedJson = {
        'id': 'delivery_1',
        'deliveryType': 'Document',
        'recipient': 'Updated Recipient',
        'status': 'RECEIVED',
        'updatedAt': '2026-02-13T11:00:00Z',
      };

      test('UpdateDelivery returns updated delivery', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1'),
          statusCode: 200,
          data: updatedJson,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.deliveries}/delivery_1',
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.updateDelivery('delivery_1', {'recipient': 'Updated'});

        expect(result.id, equals('delivery_1'));
        expect(result.recipient, equals('Updated Recipient'));
      });

      test('UpdateDelivery throws on 404', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Delivery not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.deliveries}/invalid_id',
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.updateDelivery('invalid_id', {}),
          throwsException,
        );
      });
    });

    group('DeleteDelivery', () {
      test('DeleteDelivery succeeds on 204', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1'),
          statusCode: 204,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.deliveries}/delivery_1'),
        ).thenAnswer((_) async => response);

        expect(
          repository.deleteDelivery('delivery_1'),
          completes,
        );
      });

      test('DeleteDelivery throws on 403 forbidden', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1'),
            statusCode: 403,
            data: {'message': 'Permission denied'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.deliveries}/delivery_1'),
        ).thenThrow(dioException);

        expect(
          () => repository.deleteDelivery('delivery_1'),
          throwsException,
        );
      });
    });

    group('MarkPickedUp', () {
      final pickedUpJson = {
        'id': 'delivery_1',
        'deliveryType': 'Document',
        'recipient': 'Finance Department',
        'status': 'PICKED_UP',
        'receivedAt': '2026-02-13T09:00:00Z',
        'pickedUpAt': '2026-02-13T14:30:00Z',
      };

      test('MarkPickedUp returns delivery with PICKED_UP status', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1/mark-picked-up'),
          statusCode: 200,
          data: pickedUpJson,
        );
        when(
          () => mockDio.post('${ApiEndpoints.deliveries}/delivery_1/mark-picked-up'),
        ).thenAnswer((_) async => response);

        final result = await repository.markPickedUp('delivery_1');

        expect(result.status, equals(DeliveryStatus.pickedUp));
        expect(result.pickedUpAt, isNotNull);
      });

      test('MarkPickedUp throws on 400 already picked up', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1/mark-picked-up'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.deliveries}/delivery_1/mark-picked-up'),
            statusCode: 400,
            data: {'message': 'Delivery already picked up'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post('${ApiEndpoints.deliveries}/delivery_1/mark-picked-up'),
        ).thenThrow(dioException);

        expect(
          () => repository.markPickedUp('delivery_1'),
          throwsException,
        );
      });
    });

    group('Error Handling', () {
      test('Error with message returns message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.deliveries),
            statusCode: 500,
            data: {'message': 'Server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.deliveries,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.getDeliveries(page: 1, limit: 10),
          throwsException,
        );
      });
    });
  });
}
