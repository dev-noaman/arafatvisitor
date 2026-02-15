import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/models/paginated_response.dart';
import '../../../core/models/visit.dart';

/// Repository for pre-registration API operations
class PreRegisterRepository {
  final Dio dio;

  PreRegisterRepository({required this.dio});

  /// Fetch paginated list of pre-registrations
  Future<PaginatedResponse<Visit>> getPreRegistrations({
    required int page,
    required int limit,
    String? search,
  }) async {
    try {
      final response = await dio.get(
        ApiEndpoints.preRegistrations,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null && search.isNotEmpty) 'search': search,
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

  /// Create a new pre-registration
  Future<Visit> createPreRegistration(Map<String, dynamic> data) async {
    try {
      final response = await dio.post(
        ApiEndpoints.preRegistrations,
        data: data,
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Update a pre-registration
  Future<Visit> updatePreRegistration(String id, Map<String, dynamic> data) async {
    try {
      final response = await dio.put(
        '${ApiEndpoints.preRegistrations}/$id',
        data: data,
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a pre-registration
  Future<void> deletePreRegistration(String id) async {
    try {
      await dio.delete('${ApiEndpoints.preRegistrations}/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Approve a pre-registration
  Future<Visit> approvePreRegistration(String id) async {
    try {
      final response = await dio.post(
        '${ApiEndpoints.preRegistrations}/$id/approve',
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Reject a pre-registration
  Future<Visit> rejectPreRegistration(String id) async {
    try {
      final response = await dio.post(
        '${ApiEndpoints.preRegistrations}/$id/reject',
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Re-approve a pre-registration
  Future<Visit> reApprovePreRegistration(String id) async {
    try {
      final response = await dio.post(
        '${ApiEndpoints.preRegistrations}/$id/re-approve',
      );

      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data?['message'] as String?;
      return message ?? 'Failed to perform pre-registration operation';
    }
    return e.message ?? 'Network error occurred';
  }
}
