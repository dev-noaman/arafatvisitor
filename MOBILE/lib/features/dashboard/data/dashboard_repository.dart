import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/models/dashboard.dart';
import '../../../core/providers/core_providers.dart';

part 'dashboard_repository.g.dart';

/// Repository for dashboard data operations
@riverpod
DashboardRepository dashboardRepository(DashboardRepositoryRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DashboardRepository(apiClient);
}

class DashboardRepository {
  DashboardRepository(this._apiClient);
  final Dio _apiClient;

  /// Get dashboard KPIs
  /// Returns summary statistics (total hosts, visits today, deliveries today)
  Future<DashboardKpis> getKpis() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.dashboardKpis);

      if (response.statusCode == 200 && response.data != null) {
        final kpis = DashboardKpis.fromJson(response.data['data']);
        return kpis;
      } else {
        throw Exception(
          'Failed to fetch KPIs: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get pending approvals
  /// Returns list of visitors waiting for approval
  Future<List<PendingApproval>> getPendingApprovals() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.pendingApprovals);

      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map(
              (json) => PendingApproval.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      } else {
        throw Exception(
          'Failed to fetch pending approvals: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get current visitors
  /// Returns list of visitors currently checked in
  Future<List<CurrentVisitor>> getCurrentVisitors() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.currentVisitors);

      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map(
              (json) => CurrentVisitor.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      } else {
        throw Exception(
          'Failed to fetch current visitors: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get received deliveries
  /// Returns list of deliveries received today
  Future<List<ReceivedDelivery>> getReceivedDeliveries() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.receivedDeliveries);

      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> data = response.data['data'] ?? [];
        return data
            .map(
              (json) => ReceivedDelivery.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      } else {
        throw Exception(
          'Failed to fetch received deliveries: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get charts data
  /// Returns visitor trends and delivery statistics for charts
  Future<Map<String, dynamic>> getCharts() async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.dashboardKpis}/charts',
      );

      if (response.statusCode == 200 && response.data != null) {
        return response.data['data'] as Map<String, dynamic>;
      } else {
        throw Exception(
          'Failed to fetch charts data: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Approve a visit
  Future<void> approveVisit(int visitId) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.approveVisit(visitId),
      );

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to approve visit: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Reject a visit
  Future<void> rejectVisit(int visitId) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.rejectVisit(visitId));

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to reject visit: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Check out a visitor
  Future<void> checkOutVisitor(int visitId) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.checkOutVisit(visitId),
      );

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to check out visitor: ${response.data?['message'] ?? 'Unknown error'}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Handle Dio exceptions and convert to user-friendly messages
  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception(
          'Connection timeout. Please check your internet connection.',
        );

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? 'An error occurred';

        switch (statusCode) {
          case 400:
            return Exception('Bad request: $message');
          case 401:
            return Exception('Unauthorized: $message');
          case 403:
            return Exception('Forbidden: $message');
          case 404:
            return Exception('Not found: $message');
          case 422:
            return Exception('Validation error: $message');
          case 500:
            return Exception('Server error. Please try again later.');
          default:
            return Exception(
              'Request failed with status $statusCode: $message',
            );
        }

      case DioExceptionType.cancel:
        return Exception('Request was cancelled.');

      case DioExceptionType.connectionError:
        return Exception('No internet connection. Please check your network.');

      case DioExceptionType.unknown:
        return Exception('An unexpected error occurred: ${error.message}');

      default:
        return Exception('An error occurred: ${error.message}');
    }
  }
}
