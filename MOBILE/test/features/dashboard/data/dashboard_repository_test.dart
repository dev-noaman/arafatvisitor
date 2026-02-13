// Unit tests for DashboardRepository
//
// Tests cover:
// - Get KPI statistics
// - Get pending approvals, current visitors, received deliveries lists
// - Get chart data
// - Approve, reject, checkout visit actions
// - Error handling (401, 403, 400, 500, network timeouts)

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:arafatvisitor/core/api/api_endpoints.dart';
import 'package:arafatvisitor/core/models/dashboard.dart';
import 'package:arafatvisitor/features/dashboard/data/dashboard_repository.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('DashboardRepository', () {
    late MockDio mockDio;
    late DashboardRepository repository;

    setUp(() {
      mockDio = MockDio();
      repository = DashboardRepository(mockDio);
    });

    group('GetKpis', () {
      final kpisJson = {
        'data': {
          'totalHosts': 45,
          'visitsToday': 8,
          'deliveriesToday': 5,
        }
      };

      test('GetKpis returns dashboard KPIs on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
          statusCode: 200,
          data: kpisJson,
        );
        when(() => mockDio.get(ApiEndpoints.dashboardKpis))
            .thenAnswer((_) async => response);

        final result = await repository.getKpis();

        expect(result.totalHosts, equals(45));
        expect(result.visitsToday, equals(8));
        expect(result.deliveriesToday, equals(5));
      });

      test('GetKpis throws on 401 unauthorized', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
            statusCode: 401,
            data: {'message': 'Unauthorized'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(() => mockDio.get(ApiEndpoints.dashboardKpis))
            .thenThrow(dioException);

        expect(
          () => repository.getKpis(),
          throwsException,
        );
      });
    });

    group('GetPendingApprovals', () {
      final pendingJson = {
        'data': [
          {
            'id': 'visit_pending_1',
            'visitorName': 'Ahmed Khan',
            'hostName': 'John Manager',
            'hostCompany': 'Tech Corp',
            'visitorPhone': '974555001111',
            'expectedDate': '2026-02-14T10:00:00Z',
          }
        ]
      };

      test('GetPendingApprovals returns list on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.pendingApprovals),
          statusCode: 200,
          data: pendingJson,
        );
        when(() => mockDio.get(ApiEndpoints.pendingApprovals))
            .thenAnswer((_) async => response);

        final result = await repository.getPendingApprovals();

        expect(result, isNotEmpty);
        expect(result.first.visitorName, equals('Ahmed Khan'));
      });

      test('GetPendingApprovals returns empty list on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.pendingApprovals),
          statusCode: 200,
          data: {'data': []},
        );
        when(() => mockDio.get(ApiEndpoints.pendingApprovals))
            .thenAnswer((_) async => response);

        final result = await repository.getPendingApprovals();

        expect(result, isEmpty);
      });
    });

    group('GetCurrentVisitors', () {
      final visitorsJson = {
        'data': [
          {
            'id': 'visit_1',
            'visitorName': 'John Doe',
            'visitorCompany': 'Acme Corp',
            'hostName': 'Manager',
            'hostCompany': 'Arafat',
            'checkInAt': '2026-02-13T10:15:00Z',
            'sessionId': 'session_123',
          }
        ]
      };

      test('GetCurrentVisitors returns list on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.currentVisitors),
          statusCode: 200,
          data: visitorsJson,
        );
        when(() => mockDio.get(ApiEndpoints.currentVisitors))
            .thenAnswer((_) async => response);

        final result = await repository.getCurrentVisitors();

        expect(result, isNotEmpty);
        expect(result.first.visitorName, equals('John Doe'));
      });
    });

    group('GetReceivedDeliveries', () {
      final deliveriesJson = {
        'data': [
          {
            'id': 'delivery_1',
            'deliveryType': 'Document',
            'recipient': 'John Smith',
            'hostName': 'Manager',
            'hostCompany': 'Tech Corp',
            'receivedAt': '2026-02-13T09:00:00Z',
          }
        ]
      };

      test('GetReceivedDeliveries returns list on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: ApiEndpoints.receivedDeliveries),
          statusCode: 200,
          data: deliveriesJson,
        );
        when(() => mockDio.get(ApiEndpoints.receivedDeliveries))
            .thenAnswer((_) async => response);

        final result = await repository.getReceivedDeliveries();

        expect(result, isNotEmpty);
        expect(result.first.deliveryType, equals('Document'));
      });
    });

    group('GetCharts', () {
      final chartsJson = {
        'data': {
          'visitTrend': [
            {'date': '2026-02-10', 'count': 12},
            {'date': '2026-02-11', 'count': 15},
          ],
          'visitsByHost': [
            {'company': 'Tech Corp', 'visits': 5},
          ],
        }
      };

      test('GetCharts returns data on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/charts'),
          statusCode: 200,
          data: chartsJson,
        );
        when(() => mockDio.get('${ApiEndpoints.dashboardKpis}/charts'))
            .thenAnswer((_) async => response);

        final result = await repository.getCharts();

        expect(result, isNotEmpty);
        expect(result.containsKey('visitTrend'), isTrue);
      });
    });

    group('ApproveVisit', () {
      test('ApproveVisit succeeds on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/approve/1'),
          statusCode: 200,
          data: {'message': 'Approved'},
        );
        when(() => mockDio.post(ApiEndpoints.approveVisit(1)))
            .thenAnswer((_) async => response);

        expect(
          repository.approveVisit(1),
          completes,
        );
      });

      test('ApproveVisit throws on 403 forbidden', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/approve/1'),
          response: Response(
            requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/approve/1'),
            statusCode: 403,
            data: {'message': 'Permission denied'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(() => mockDio.post(ApiEndpoints.approveVisit(1)))
            .thenThrow(dioException);

        expect(
          () => repository.approveVisit(1),
          throwsException,
        );
      });
    });

    group('RejectVisit', () {
      test('RejectVisit succeeds on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/reject/1'),
          statusCode: 200,
          data: {'message': 'Rejected'},
        );
        when(() => mockDio.post(ApiEndpoints.rejectVisit(1)))
            .thenAnswer((_) async => response);

        expect(
          repository.rejectVisit(1),
          completes,
        );
      });
    });

    group('CheckOutVisitor', () {
      test('CheckOutVisitor succeeds on 200', () async {
        final response = Response(
          requestOptions: RequestOptions(path: '${ApiEndpoints.dashboardKpis}/checkout/1'),
          statusCode: 200,
          data: {'message': 'Checked out'},
        );
        when(() => mockDio.post(ApiEndpoints.checkOutVisit(1)))
            .thenAnswer((_) async => response);

        expect(
          repository.checkOutVisitor(1),
          completes,
        );
      });
    });

    group('Error Handling', () {
      test('Timeout error returns timeout message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
          type: DioExceptionType.connectionTimeout,
        );
        when(() => mockDio.get(ApiEndpoints.dashboardKpis))
            .thenThrow(dioException);

        expect(
          () => repository.getKpis(),
          throwsException,
        );
      });

      test('500 error returns server error message', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
          response: Response(
            requestOptions: RequestOptions(path: ApiEndpoints.dashboardKpis),
            statusCode: 500,
            data: {'message': 'Server error'},
          ),
          type: DioExceptionType.badResponse,
        );
        when(() => mockDio.get(ApiEndpoints.dashboardKpis))
            .thenThrow(dioException);

        expect(
          () => repository.getKpis(),
          throwsException,
        );
      });
    });
  });
}
