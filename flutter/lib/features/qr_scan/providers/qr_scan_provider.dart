import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_endpoints.dart';
import '../../../core/models/visit.dart';
import '../../../core/providers/core_providers.dart';

final qrScanRepositoryProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return _QrScanRepository(dio);
});

final qrScanProvider =
    StateNotifierProvider<QrScanNotifier, AsyncValue<QrScanResult?>>((ref) {
  final repository = ref.watch(qrScanRepositoryProvider);
  return QrScanNotifier(repository);
});

class _QrScanRepository {
  final Dio dio;

  _QrScanRepository(this.dio);

  Future<Visit> getVisitPass(String sessionId) async {
    try {
      final response = await dio.get('${ApiEndpoints.visits}/pass/$sessionId');
      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw e.message ?? 'Failed to load visit pass';
    }
  }

  Future<Visit> checkIn(String sessionId) async {
    try {
      final response = await dio.post('${ApiEndpoints.visits}/$sessionId/checkin');
      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw e.message ?? 'Failed to check in';
    }
  }

  Future<Visit> checkOut(String sessionId) async {
    try {
      final response = await dio.post('${ApiEndpoints.visits}/$sessionId/checkout');
      return Visit.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw e.message ?? 'Failed to check out';
    }
  }
}

enum QrActionType { checkIn, checkOut }

class QrScanResult {
  final Visit visit;
  final QrActionType actionType;

  QrScanResult({required this.visit, required this.actionType});
}

class QrScanNotifier extends StateNotifier<AsyncValue<QrScanResult?>> {
  final _QrScanRepository _repository;

  QrScanNotifier(this._repository) : super(const AsyncValue.data(null));

  Future<void> processQrCode(String sessionId) async {
    state = const AsyncValue.loading();

    try {
      // Get the visit to check current status
      final visit = await _repository.getVisitPass(sessionId);

      // Determine action based on current status
      final actionType = visit.status == VisitStatus.approved
          ? QrActionType.checkIn
          : visit.status == VisitStatus.checkedIn
              ? QrActionType.checkOut
              : throw 'Invalid visit status for scanning';

      // Perform the action
      final updatedVisit = actionType == QrActionType.checkIn
          ? await _repository.checkIn(sessionId)
          : await _repository.checkOut(sessionId);

      state = AsyncValue.data(
        QrScanResult(visit: updatedVisit, actionType: actionType),
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() {
    state = const AsyncValue.data(null);
  }
}
