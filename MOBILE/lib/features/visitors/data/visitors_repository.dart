import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/models/visit.dart';

/// Repository for visitor-related API operations
class VisitorsRepository {
  final Dio dio;

  VisitorsRepository({required this.dio});

  /// Fetch paginated list of visitors with optional search and status filter
  Future<PaginatedResponse<Visit>> getVisitors({
    required int page,
    required int limit,
    String? search,
    String? status,
  }) async {
    try {
      final response = await dio.get(
        ApiEndpoints.visitors,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null && search.isNotEmpty) 'search': search,
          if (status != null && status.isNotEmpty) 'status': status,
        },
      );

      return PaginatedResponse<Visit>.fromJson(
        response.data,
        (json) => Visit.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create a new visitor
  Future<Visit> createVisitor(Map<String, dynamic> data) async {
    try {
      final response = await dio.post(
        ApiEndpoints.visitors,
        data: data,
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Update an existing visitor
  Future<Visit> updateVisitor(String id, Map<String, dynamic> data) async {
    try {
      final response = await dio.put(
        '${ApiEndpoints.visitors}/$id',
        data: data,
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a visitor
  Future<void> deleteVisitor(String id) async {
    try {
      await dio.delete('${ApiEndpoints.visitors}/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get a single visitor by ID
  Future<Visit> getVisitor(String id) async {
    try {
      final response = await dio.get('${ApiEndpoints.visitors}/$id');
      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data?['message'] as String?;
      return message ?? 'Failed to perform visitor operation';
    }
    return e.message ?? 'Network error occurred';
  }
}
