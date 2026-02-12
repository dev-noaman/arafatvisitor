import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/models/delivery.dart';
import '../../../core/models/paginated_response.dart';

/// Repository for delivery-related API operations
class DeliveriesRepository {
  final Dio dio;

  DeliveriesRepository({required this.dio});

  /// Fetch paginated list of deliveries with optional search and status filter
  Future<PaginatedResponse<Delivery>> getDeliveries({
    required int page,
    required int limit,
    String? search,
    String? status,
  }) async {
    try {
      final response = await dio.get(
        ApiEndpoints.deliveries,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null && search.isNotEmpty) 'search': search,
          if (status != null && status.isNotEmpty) 'status': status,
        },
      );

      return PaginatedResponse<Delivery>.fromJson(
        response.data,
        (json) => Delivery.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create a new delivery
  Future<Delivery> createDelivery(Map<String, dynamic> data) async {
    try {
      final response = await dio.post(
        ApiEndpoints.deliveries,
        data: data,
      );

      return Delivery.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Update a delivery
  Future<Delivery> updateDelivery(String id, Map<String, dynamic> data) async {
    try {
      final response = await dio.put(
        '${ApiEndpoints.deliveries}/$id',
        data: data,
      );

      return Delivery.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a delivery
  Future<void> deleteDelivery(String id) async {
    try {
      await dio.delete('${ApiEndpoints.deliveries}/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Mark a delivery as picked up
  Future<Delivery> markPickedUp(String id) async {
    try {
      final response = await dio.post(
        '${ApiEndpoints.deliveries}/$id/mark-picked-up',
      );

      return Delivery.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data?['message'] as String?;
      return message ?? 'Failed to perform delivery operation';
    }
    return e.message ?? 'Network error occurred';
  }
}
