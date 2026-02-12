import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/models/host.dart';
import '../../../core/models/paginated_response.dart';

/// Repository for host-related API operations
class HostsRepository {
  final Dio dio;

  HostsRepository({required this.dio});

  /// Fetch paginated list of hosts with optional search and type filter
  Future<PaginatedResponse<Host>> getHosts({
    required int page,
    required int limit,
    String? search,
    String? type,
  }) async {
    try {
      final response = await dio.get(
        ApiEndpoints.hosts,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null && search.isNotEmpty) 'search': search,
          if (type != null && type.isNotEmpty) 'type': type,
        },
      );

      return PaginatedResponse<Host>.fromJson(
        response.data,
        (json) => Host.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create a new host
  Future<Host> createHost(Map<String, dynamic> data) async {
    try {
      final response = await dio.post(
        ApiEndpoints.hosts,
        data: data,
      );

      return Host.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Update an existing host
  Future<Host> updateHost(String id, Map<String, dynamic> data) async {
    try {
      final response = await dio.put(
        '${ApiEndpoints.hosts}/$id',
        data: data,
      );

      return Host.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a host
  Future<void> deleteHost(String id) async {
    try {
      await dio.delete('${ApiEndpoints.hosts}/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get a single host by ID
  Future<Host> getHost(String id) async {
    try {
      final response = await dio.get('${ApiEndpoints.hosts}/$id');
      return Host.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data?['message'] as String?;
      return message ?? 'Failed to perform host operation';
    }
    return e.message ?? 'Network error occurred';
  }
}
