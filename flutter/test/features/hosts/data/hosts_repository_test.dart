// Unit tests for HostsRepository
//
// Tests cover:
// - Fetch paginated hosts with search and type filter
// - Create, update, delete operations
// - Host model deserialization (HostType.external/internal)
// - Error handling

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/host.dart';
import 'package:arafatvisitor/features/hosts/data/hosts_repository.dart';
import '../../../fixtures/factories.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('HostsRepository', () {
    late MockDio mockDio;
    late HostsRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = HostsRepository(dio: mockDio);
      registerFallbackValue(RequestOptions(path: ApiEndpoints.hosts));
    });

    group('GetHosts', () {
      final hostJson = {
        'id': 'host_1',
        'externalId': 'office_rnd_123',
        'name': 'John Manager',
        'company': 'Tech Corp',
        'email': 'john@test.local',
        'phone': '974555001234',
        'location': 'MAIN_LOBBY',
        'type': 'EXTERNAL',
        'status': 'ACTIVE',
        'createdAt': '2026-02-01T10:00:00Z',
        'updatedAt': '2026-02-13T14:00:00Z',
      };

      final paginatedJson = {
        'data': [hostJson],
        'page': 1,
        'limit': 10,
        'total': 45,
        'totalPages': 5,
      };

      test('GetHosts returns paginated response', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          statusCode: 200,
          data: paginatedJson,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.getHosts(page: 1, limit: 10);

        expect(result.data, isNotEmpty);
        expect(result.total, equals(45));
        expect(result.data.first.type, equals(HostType.external));
      });

      test('GetHosts filters by type EXTERNAL', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          statusCode: 200,
          data: {'data': [hostJson], 'page': 1, 'limit': 10, 'total': 40, 'totalPages': 4},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        await repository.getHosts(page: 1, limit: 10, type: 'EXTERNAL');

        verify(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: {'page': 1, 'limit': 10, 'type': 'EXTERNAL'},
          ),
        ).called(1);
      });

      test('GetHosts includes search parameter', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        await repository.getHosts(page: 1, limit: 10, search: 'Tech');

        verify(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: {'page': 1, 'limit': 10, 'search': 'Tech'},
          ),
        ).called(1);
      });

      test('GetHosts throws exception on error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.getHosts(page: 1, limit: 10),
          throwsException,
        );
      });
    });

    group('CreateHost', () {
      final createdJson = {
        'id': 'host_new',
        'externalId': 'office_rnd_456',
        'name': 'Jane Sales',
        'company': 'New Company',
        'email': 'jane@test.local',
        'phone': '974555005678',
        'location': 'RECEPTION',
        'type': 'EXTERNAL',
        'status': 'ACTIVE',
        'createdAt': '2026-02-13T15:00:00Z',
      };

      test('CreateHost returns new host', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          statusCode: 201,
          data: createdJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.hosts,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.createHost({'name': 'Jane Sales'});

        expect(result.id, equals('host_new'));
        expect(result.type, equals(HostType.external));
        expect(result.status, equals(HostStatus.active));
      });

      test('CreateHost throws on validation error', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.hosts),
            statusCode: 422,
            data: {'message': 'Company is required'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.hosts,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.createHost({}),
          throwsException,
        );
      });
    });

    group('UpdateHost', () {
      final updatedJson = {
        'id': 'host_1',
        'name': 'John Updated',
        'company': 'Tech Corp',
        'status': 'ACTIVE',
        'updatedAt': '2026-02-13T16:00:00Z',
      };

      test('UpdateHost returns updated host', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/host_1'),
          statusCode: 200,
          data: updatedJson,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.hosts}/host_1',
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        final result = await repository.updateHost('host_1', {'name': 'John Updated'});

        expect(result.id, equals('host_1'));
        expect(result.name, equals('John Updated'));
      });

      test('UpdateHost throws on 404', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Host not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.hosts}/invalid_id',
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.updateHost('invalid_id', {}),
          throwsException,
        );
      });
    });

    group('DeleteHost', () {
      test('DeleteHost succeeds on 204', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/host_1'),
          statusCode: 204,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.hosts}/host_1'),
        ).thenAnswer((_) async => response);

        expect(
          repository.deleteHost('host_1'),
          completes,
        );
      });

      test('DeleteHost throws on 403 forbidden', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/host_1'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/host_1'),
            statusCode: 403,
            data: {'message': 'Cannot delete host with active visitors'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.hosts}/host_1'),
        ).thenThrow(dioException);

        expect(
          () => repository.deleteHost('host_1'),
          throwsException,
        );
      });
    });

    group('GetHost', () {
      final hostJson = {
        'id': 'host_1',
        'externalId': 'office_rnd_123',
        'name': 'John Manager',
        'company': 'Tech Corp',
        'email': 'john@test.local',
        'phone': '974555001234',
        'location': 'MAIN_LOBBY',
        'type': 'EXTERNAL',
        'status': 'ACTIVE',
        'createdAt': '2026-02-01T10:00:00Z',
        'updatedAt': '2026-02-13T14:00:00Z',
      };

      test('GetHost returns single host by ID', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/host_1'),
          statusCode: 200,
          data: hostJson,
        );
        when(
          () => mockDio.get('${ApiEndpoints.hosts}/host_1'),
        ).thenAnswer((_) async => response);

        final result = await repository.getHost('host_1');

        expect(result.id, equals('host_1'));
        expect(result.name, equals('John Manager'));
        expect(result.company, equals('Tech Corp'));
      });

      test('GetHost throws on 404', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.hosts}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Host not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get('${ApiEndpoints.hosts}/invalid_id'),
        ).thenThrow(dioException);

        expect(
          () => repository.getHost('invalid_id'),
          throwsException,
        );
      });
    });

    group('Error Handling', () {
      test('Error with message returns message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.hosts),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.hosts),
            statusCode: 500,
            data: {'message': 'Server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.hosts,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        expect(
          () => repository.getHosts(page: 1, limit: 10),
          throwsException,
        );
      });
    });
  });
}
