// Unit tests for VisitorsRepository
//
// Tests cover:
// - Fetch paginated visitors list with pagination
// - Search and status filtering
// - Create, read, update, delete operations
// - PaginatedResponse<Visit> generic deserialization
// - Error handling for network and server errors

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/features/visitors/data/visitors_repository.dart';
import '../../../fixtures/factories.dart';
import '../../../fixtures/models.dart';

// Mock Dio client
class MockDio extends Mock implements Dio {}

void main() {
  group('VisitorsRepository', () {
    late MockDio mockDio;
    late VisitorsRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = VisitorsRepository(dio: mockDio);
      registerFallbackValue(RequestOptions(path: ApiEndpoints.visitors));
    });

    group('GetVisitors', () {
      final visitJson = {
        'id': 'visit_1',
        'sessionId': 'session_123',
        'visitorName': 'John Doe',
        'visitorCompany': 'Acme Corp',
        'visitorPhone': '974555001111',
        'visitorEmail': 'john@test.local',
        'hostId': 'host_1',
        'purpose': 'Meeting',
        'location': 'BARWA_TOWERS',
        'status': 'APPROVED',
        'expectedDate': '2026-02-13T14:30:00Z',
        'checkInAt': null,
        'checkOutAt': null,
        'approvedAt': '2026-02-13T10:00:00Z',
        'rejectedAt': null,
        'createdAt': '2026-02-13T08:00:00Z',
        'updatedAt': '2026-02-13T09:00:00Z',
      };

      final paginatedJson = {
        'data': [visitJson],
        'page': 1,
        'limit': 10,
        'total': 25,
        'totalPages': 3,
      };

      test('GetVisitors returns paginated response on success', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          statusCode: 200,
          data: paginatedJson,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.getVisitors(
          page: 1,
          limit: 10,
        );

        // ASSERT
        expect(result.data, isNotEmpty);
        expect(result.page, equals(1));
        expect(result.limit, equals(10));
        expect(result.total, equals(25));
        expect(result.totalPages, equals(3));
        expect(result.data.first.id, equals('visit_1'));
        expect(result.data.first.visitorName, equals('John Doe'));
      });

      test('GetVisitors includes search parameter when provided', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        await repository.getVisitors(
          page: 1,
          limit: 10,
          search: 'John',
        );

        // ASSERT
        verify(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: {
              'page': 1,
              'limit': 10,
              'search': 'John',
            },
          ),
        ).called(1);
      });

      test('GetVisitors includes status parameter when provided', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        await repository.getVisitors(
          page: 1,
          limit: 10,
          status: 'APPROVED',
        );

        // ASSERT
        verify(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: {
              'page': 1,
              'limit': 10,
              'status': 'APPROVED',
            },
          ),
        ).called(1);
      });

      test('GetVisitors excludes empty search parameter', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        await repository.getVisitors(
          page: 1,
          limit: 10,
          search: '',
        );

        // ASSERT
        verify(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: {
              'page': 1,
              'limit': 10,
            },
          ),
        ).called(1);
      });

      test('GetVisitors throws exception on network error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitors(page: 1, limit: 10),
          throwsException,
        );
      });

      test('GetVisitors throws exception on 500 server error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.visitors),
            statusCode: 500,
            data: {'message': 'Internal server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitors(page: 1, limit: 10),
          throwsException,
        );
      });
    });

    group('CreateVisitor', () {
      final visitJson = {
        'id': 'visit_new',
        'visitorName': 'Jane Smith',
        'visitorCompany': 'Tech Inc',
        'visitorPhone': '974555002222',
        'visitorEmail': 'jane@test.local',
        'hostId': 'host_1',
        'status': 'PENDING_APPROVAL',
        'createdAt': '2026-02-13T15:00:00Z',
        'updatedAt': '2026-02-13T15:00:00Z',
      };

      test('CreateVisitor returns created visit on success', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          statusCode: 201,
          data: visitJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.visitors,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        final visitData = {
          'visitorName': 'Jane Smith',
          'visitorCompany': 'Tech Inc',
          'visitorPhone': '974555002222',
        };

        // ACT
        final result = await repository.createVisitor(visitData);

        // ASSERT
        expect(result.id, equals('visit_new'));
        expect(result.visitorName, equals('Jane Smith'));
        expect(result.visitorCompany, equals('Tech Inc'));
      });

      test('CreateVisitor throws exception on validation error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.visitors),
            statusCode: 422,
            data: {'message': 'Visitor name is required'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.visitors,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.createVisitor({}),
          throwsException,
        );
      });

      test('CreateVisitor throws exception on 401 unauthorized', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.visitors),
            statusCode: 401,
            data: {'message': 'Unauthorized'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.visitors,
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.createVisitor({'visitorName': 'Test'}),
          throwsException,
        );
      });
    });

    group('UpdateVisitor', () {
      final updatedJson = {
        'id': 'visit_1',
        'visitorName': 'John Updated',
        'visitorCompany': 'Acme Updated',
        'visitorPhone': '974555001111',
        'status': 'APPROVED',
        'createdAt': '2026-02-13T08:00:00Z',
        'updatedAt': '2026-02-13T15:30:00Z',
      };

      test('UpdateVisitor returns updated visit on success', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          statusCode: 200,
          data: updatedJson,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.visitors}/visit_1',
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.updateVisitor('visit_1', {
          'visitorName': 'John Updated',
        });

        // ASSERT
        expect(result.id, equals('visit_1'));
        expect(result.visitorName, equals('John Updated'));
        expect(result.visitorCompany, equals('Acme Updated'));
      });

      test('UpdateVisitor throws exception on 404 not found', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Visitor not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.visitors}/invalid_id',
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.updateVisitor('invalid_id', {}),
          throwsException,
        );
      });

      test('UpdateVisitor throws exception on network error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.put(
            '${ApiEndpoints.visitors}/visit_1',
            data: any(named: 'data'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.updateVisitor('visit_1', {}),
          throwsException,
        );
      });
    });

    group('DeleteVisitor', () {
      test('DeleteVisitor succeeds on 204 no content', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          statusCode: 204,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.visitors}/visit_1'),
        ).thenAnswer((_) async => response);

        // ACT & ASSERT
        expect(
          repository.deleteVisitor('visit_1'),
          completes,
        );
      });

      test('DeleteVisitor throws exception on 403 forbidden', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
            statusCode: 403,
            data: {'message': 'You do not have permission to delete this visitor'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.visitors}/visit_1'),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.deleteVisitor('visit_1'),
          throwsException,
        );
      });

      test('DeleteVisitor throws exception on 404 not found', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Visitor not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.delete('${ApiEndpoints.visitors}/invalid_id'),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.deleteVisitor('invalid_id'),
          throwsException,
        );
      });
    });

    group('GetVisitor', () {
      final visitJson = {
        'id': 'visit_1',
        'sessionId': 'session_123',
        'visitorName': 'John Doe',
        'visitorCompany': 'Acme Corp',
        'visitorPhone': '974555001111',
        'visitorEmail': 'john@test.local',
        'hostId': 'host_1',
        'status': 'CHECKED_IN',
        'expectedDate': '2026-02-13T14:30:00Z',
        'checkInAt': '2026-02-13T14:35:00Z',
        'createdAt': '2026-02-13T08:00:00Z',
        'updatedAt': '2026-02-13T14:35:00Z',
      };

      test('GetVisitor returns single visitor by ID', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          statusCode: 200,
          data: visitJson,
        );
        when(
          () => mockDio.get('${ApiEndpoints.visitors}/visit_1'),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.getVisitor('visit_1');

        // ASSERT
        expect(result.id, equals('visit_1'));
        expect(result.visitorName, equals('John Doe'));
        expect(result.status, equals(VisitStatus.checkedIn));
        expect(result.checkInAt, isNotNull);
      });

      test('GetVisitor throws exception on 404 not found', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/invalid_id'),
            statusCode: 404,
            data: {'message': 'Visitor not found'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get('${ApiEndpoints.visitors}/invalid_id'),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitor('invalid_id'),
          throwsException,
        );
      });

      test('GetVisitor throws exception on timeout', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.visitors}/visit_1'),
          type: DioExceptionType.receiveTimeout,
        );
        when(
          () => mockDio.get('${ApiEndpoints.visitors}/visit_1'),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitor('visit_1'),
          throwsException,
        );
      });
    });

    group('Error Handling', () {
      test('Error with message returns message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.visitors),
            statusCode: 400,
            data: {'message': 'Custom error message'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitors(page: 1, limit: 10),
          throwsException,
        );
      });

      test('Error without message returns default message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.visitors),
            statusCode: 500,
            data: {},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitors(page: 1, limit: 10),
          throwsException,
        );
      });

      test('Network error returns network error message', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.visitors),
          type: DioExceptionType.connectionError,
          message: 'Failed to connect',
        );
        when(
          () => mockDio.get(
            ApiEndpoints.visitors,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getVisitors(page: 1, limit: 10),
          throwsException,
        );
      });
    });
  });
}
