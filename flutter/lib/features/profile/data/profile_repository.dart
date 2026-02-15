import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';

/// Repository for profile-related API operations
class ProfileRepository {
  final Dio dio;

  ProfileRepository({required this.dio});

  /// Change user password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await dio.post(
        ApiEndpoints.changePassword,
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data?['message'] as String?;
      return message ?? 'Failed to change password';
    }
    return e.message ?? 'Network error occurred';
  }
}
