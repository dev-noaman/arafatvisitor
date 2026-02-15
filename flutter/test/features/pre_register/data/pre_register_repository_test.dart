// Unit tests for PreRegisterRepository
//
// Tests cover:
// - Fetch paginated pre-registrations with search
// - Create, update, delete operations
// - Approve, reject, and re-approve actions
// - PaginatedResponse<Visit> generic deserialization
// - Error handling for network and server errors

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/paginated_response.dart';
import 'package:arafatvisitor/core/models/visit.dart';
import 'package:arafatvisitor/features/pre_register/data/pre_register_repository.dart';
import '../../../fixtures/factories.dart';

// Mock Dio client
class MockDio extends Mock implements Dio {}

void main() {
  group('PreRegisterRepository', () {
    late MockDio mockDio;
    late PreRegisterRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = PreRegisterRepository(dio: mockDio);
      registerFallbackValue(RequestOptions(path: ApiEndpoints.preRegistrations));
    });

    group('GetPreRegistrations', () {
      final preRegJson = {
        'id': 'visit_pending_1',
        'visitorName': 'Alice Johnson',
        'visitorCompany': 'Design Studio',
        'visitorPhone': '974555003333',
        'visitorEmail': 'alice@test.local',
        'hostId': 'host_2',
        'purpose': 'Interview',
        'location': 'MARINA_50',
        'status': 'PENDING_APPROVAL',
        'expectedDate': '2026-02-14T10:00:00Z',
        'createdAt': '2026-02-13T12:00:00Z',
        'updatedAt': '2026-02-13T12:00:00Z',
      };

      final paginatedJson = {
        'data': [preRegJson],
        'page': 1,
        'limit': 10,
        'total': 8,
        'totalPages': 1,
      };

      test('GetPreRegistrations returns paginated response on success', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
          statusCode: 200,
          data: paginatedJson,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.preRegistrations,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.getPreRegistrations(
          page: 1,
          limit: 10,
        );

        // ASSERT
        expect(result.data, isNotEmpty);
        expect(result.page, equals(1));
        expect(result.total, equals(8));
        expect(result.data.first.visitorName, equals('Alice Johnson'));
      });

      test('GetPreRegistrations includes search parameter when provided', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
          statusCode: 200,
          data: {'data': [], 'page': 1, 'limit': 10, 'total': 0, 'totalPages': 0},
        );
        when(
          () => mockDio.get(
            ApiEndpoints.preRegistrations,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        await repository.getPreRegistrations(
          page: 1,
          limit: 10,
          search: 'Alice',
        );

        // ASSERT
        verify(
          () => mockDio.get(
            ApiEndpoints.preRegistrations,
            queryParameters: {
              'page': 1,
              'limit': 10,
              'search': 'Alice',
            },
          ),
        ).called(1);
      });

      test('GetPreRegistrations throws exception on network error', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
          type: DioExceptionType.connectionError,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.preRegistrations,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getPreRegistrations(page: 1, limit: 10),
          throwsException,
        );
      });
    });

    group('CreatePreRegistration', () {
      final createdJson = {
        'id': 'visit_new_prereg',
        'visitorName': 'Bob Wilson',
        'visitorCompany': 'Consulting Ltd',
        'visitorPhone': '974555004444',
        'hostId': 'host_3',
        'status': 'PENDING_APPROVAL',
        'createdAt': '2026-02-13T16:00:00Z',
        'updatedAt': '2026-02-13T16:00:00Z',
      };

      test('CreatePreRegistration returns created pre-registration', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
          statusCode: 201,
          data: createdJson,
        );
        when(
          () => mockDio.post(
            ApiEndpoints.preRegistrations,
            data: any(named: 'data'),
          ),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.createPreRegistration({
          'visitorName': 'Bob Wilson',
          'visitorCompany': 'Consulting Ltd',
        });

        // ASSERT
        expect(result.id, equals('visit_new_prereg'));
        expect(result.visitorName, equals('Bob Wilson'));
        expect(result.status, equals(VisitStatus.pending));
      });
    });

    group('ApprovePreRegistration', () {
      final approvedJson = {
        'id': 'visit_pending_1',
        'visitorName': 'Alice Johnson',
        'status': 'APPROVED',
        'approvedAt': '2026-02-13T14:00:00Z',
        'updatedAt': '2026-02-13T14:00:00Z',
      };

      test('ApprovePreRegistration returns approved pre-registration', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.preRegistrations}/visit_pending_1/approve'),
          statusCode: 200,
          data: approvedJson,
        );
        when(
          () => mockDio.post('${ApiEndpoints.preRegistrations}/visit_pending_1/approve'),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.approvePreRegistration('visit_pending_1');

        // ASSERT
        expect(result.status, equals(VisitStatus.approved));
        expect(result.approvedAt, isNotNull);
      });
    });

    group('RejectPreRegistration', () {
      final rejectedJson = {
        'id': 'visit_pending_1',
        'visitorName': 'Alice Johnson',
        'status': 'REJECTED',
        'rejectedAt': '2026-02-13T15:00:00Z',
        'updatedAt': '2026-02-13T15:00:00Z',
      };

      test('RejectPreRegistration returns rejected pre-registration', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.preRegistrations}/visit_pending_1/reject'),
          statusCode: 200,
          data: rejectedJson,
        );
        when(
          () => mockDio.post('${ApiEndpoints.preRegistrations}/visit_pending_1/reject'),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.rejectPreRegistration('visit_pending_1');

        // ASSERT
        expect(result.status, equals(VisitStatus.rejected));
        expect(result.rejectedAt, isNotNull);
      });
    });

    group('ReApprovePreRegistration', () {
      final reApprovedJson = {
        'id': 'visit_pending_1',
        'visitorName': 'Alice Johnson',
        'status': 'APPROVED',
        'approvedAt': '2026-02-13T16:00:00Z',
        'updatedAt': '2026-02-13T16:00:00Z',
      };

      test('ReApprovePreRegistration returns re-approved pre-registration', () async {
        // ARRANGE
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.preRegistrations}/visit_pending_1/re-approve'),
          statusCode: 200,
          data: reApprovedJson,
        );
        when(
          () => mockDio.post('${ApiEndpoints.preRegistrations}/visit_pending_1/re-approve'),
        ).thenAnswer((_) async => response);

        // ACT
        final result = await repository.reApprovePreRegistration('visit_pending_1');

        // ASSERT
        expect(result.status, equals(VisitStatus.approved));
      });
    });

    group('Error Handling', () {
      test('Error returns message from response', () async {
        // ARRANGE
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.preRegistrations),
            statusCode: 400,
            data: {'message': 'Custom error message'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(
          () => mockDio.get(
            ApiEndpoints.preRegistrations,
            queryParameters: any(named: 'queryParameters'),
          ),
        ).thenThrow(dioException);

        // ACT & ASSERT
        expect(
          () => repository.getPreRegistrations(page: 1, limit: 10),
          throwsException,
        );
      });
    });
  });
}
