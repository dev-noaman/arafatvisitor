// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_DashboardKpis _$DashboardKpisFromJson(Map<String, dynamic> json) =>
    _DashboardKpis(
      totalHosts: (json['totalHosts'] as num).toInt(),
      visitsToday: (json['visitsToday'] as num).toInt(),
      deliveriesToday: (json['deliveriesToday'] as num).toInt(),
    );

Map<String, dynamic> _$DashboardKpisToJson(_DashboardKpis instance) =>
    <String, dynamic>{
      'totalHosts': instance.totalHosts,
      'visitsToday': instance.visitsToday,
      'deliveriesToday': instance.deliveriesToday,
    };

_PendingApproval _$PendingApprovalFromJson(Map<String, dynamic> json) =>
    _PendingApproval(
      id: json['id'] as String,
      visitorName: json['visitorName'] as String,
      visitorPhone: json['visitorPhone'] as String,
      hostName: json['hostName'] as String,
      hostCompany: json['hostCompany'] as String,
      expectedDate: DateTime.parse(json['expectedDate'] as String),
    );

Map<String, dynamic> _$PendingApprovalToJson(_PendingApproval instance) =>
    <String, dynamic>{
      'id': instance.id,
      'visitorName': instance.visitorName,
      'visitorPhone': instance.visitorPhone,
      'hostName': instance.hostName,
      'hostCompany': instance.hostCompany,
      'expectedDate': instance.expectedDate.toIso8601String(),
    };

_CurrentVisitor _$CurrentVisitorFromJson(Map<String, dynamic> json) =>
    _CurrentVisitor(
      id: json['id'] as String,
      visitorName: json['visitorName'] as String,
      visitorCompany: json['visitorCompany'] as String,
      hostName: json['hostName'] as String,
      hostCompany: json['hostCompany'] as String,
      checkInAt: DateTime.parse(json['checkInAt'] as String),
      sessionId: json['sessionId'] as String?,
    );

Map<String, dynamic> _$CurrentVisitorToJson(_CurrentVisitor instance) =>
    <String, dynamic>{
      'id': instance.id,
      'visitorName': instance.visitorName,
      'visitorCompany': instance.visitorCompany,
      'hostName': instance.hostName,
      'hostCompany': instance.hostCompany,
      'checkInAt': instance.checkInAt.toIso8601String(),
      'sessionId': ?instance.sessionId,
    };

_ReceivedDelivery _$ReceivedDeliveryFromJson(Map<String, dynamic> json) =>
    _ReceivedDelivery(
      id: json['id'] as String,
      deliveryType: json['deliveryType'] as String,
      recipient: json['recipient'] as String,
      hostName: json['hostName'] as String,
      hostCompany: json['hostCompany'] as String,
      receivedAt: DateTime.parse(json['receivedAt'] as String),
    );

Map<String, dynamic> _$ReceivedDeliveryToJson(_ReceivedDelivery instance) =>
    <String, dynamic>{
      'id': instance.id,
      'deliveryType': instance.deliveryType,
      'recipient': instance.recipient,
      'hostName': instance.hostName,
      'hostCompany': instance.hostCompany,
      'receivedAt': instance.receivedAt.toIso8601String(),
    };
