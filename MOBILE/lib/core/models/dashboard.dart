import 'package:freezed_annotation/freezed_annotation.dart';

part 'dashboard.freezed.dart';
part 'dashboard.g.dart';

/// Dashboard KPIs summary
@freezed
class DashboardKpis with _$DashboardKpis {
  const factory DashboardKpis({
    required int totalHosts,
    required int visitsToday,
    required int deliveriesToday,
  }) = _DashboardKpis;

  factory DashboardKpis.fromJson(Map<String, dynamic> json) =>
      _$DashboardKpisFromJson(json);
}

/// Pending approval item
@freezed
class PendingApproval with _$PendingApproval {
  const factory PendingApproval({
    required String id,
    required String visitorName,
    required String visitorPhone,
    required String hostName,
    required String hostCompany,
    required DateTime expectedDate,
  }) = _PendingApproval;

  factory PendingApproval.fromJson(Map<String, dynamic> json) =>
      _$PendingApprovalFromJson(json);
}

/// Current visitor item
@freezed
class CurrentVisitor with _$CurrentVisitor {
  const factory CurrentVisitor({
    required String id,
    required String visitorName,
    required String visitorCompany,
    required String hostName,
    required String hostCompany,
    required DateTime checkInAt,
    String? sessionId,
  }) = _CurrentVisitor;

  factory CurrentVisitor.fromJson(Map<String, dynamic> json) =>
      _$CurrentVisitorFromJson(json);
}

/// Received delivery item
@freezed
class ReceivedDelivery with _$ReceivedDelivery {
  const factory ReceivedDelivery({
    required String id,
    required String deliveryType,
    required String recipient,
    required String hostName,
    required String hostCompany,
    required DateTime receivedAt,
  }) = _ReceivedDelivery;

  factory ReceivedDelivery.fromJson(Map<String, dynamic> json) =>
      _$ReceivedDeliveryFromJson(json);
}
