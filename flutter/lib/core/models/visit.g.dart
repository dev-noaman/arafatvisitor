// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'visit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Visit _$VisitFromJson(Map<String, dynamic> json) => _Visit(
  id: json['id'] as String,
  sessionId: json['sessionId'] as String?,
  visitorName: json['visitorName'] as String,
  visitorCompany: json['visitorCompany'] as String,
  visitorPhone: json['visitorPhone'] as String,
  visitorEmail: json['visitorEmail'] as String?,
  hostId: json['hostId'] as String,
  host: json['host'] == null
      ? null
      : Host.fromJson(json['host'] as Map<String, dynamic>),
  purpose: json['purpose'] as String,
  location: json['location'] as String,
  status: $enumDecode(_$VisitStatusEnumMap, json['status']),
  expectedDate: json['expectedDate'] == null
      ? null
      : DateTime.parse(json['expectedDate'] as String),
  checkInAt: json['checkInAt'] == null
      ? null
      : DateTime.parse(json['checkInAt'] as String),
  checkOutAt: json['checkOutAt'] == null
      ? null
      : DateTime.parse(json['checkOutAt'] as String),
  approvedAt: json['approvedAt'] == null
      ? null
      : DateTime.parse(json['approvedAt'] as String),
  rejectedAt: json['rejectedAt'] == null
      ? null
      : DateTime.parse(json['rejectedAt'] as String),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$VisitToJson(_Visit instance) => <String, dynamic>{
  'id': instance.id,
  'sessionId': ?instance.sessionId,
  'visitorName': instance.visitorName,
  'visitorCompany': instance.visitorCompany,
  'visitorPhone': instance.visitorPhone,
  'visitorEmail': ?instance.visitorEmail,
  'hostId': instance.hostId,
  'host': ?instance.host?.toJson(),
  'purpose': instance.purpose,
  'location': instance.location,
  'status': _$VisitStatusEnumMap[instance.status]!,
  'expectedDate': ?instance.expectedDate?.toIso8601String(),
  'checkInAt': ?instance.checkInAt?.toIso8601String(),
  'checkOutAt': ?instance.checkOutAt?.toIso8601String(),
  'approvedAt': ?instance.approvedAt?.toIso8601String(),
  'rejectedAt': ?instance.rejectedAt?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$VisitStatusEnumMap = {
  VisitStatus.pending: 'PENDING',
  VisitStatus.approved: 'APPROVED',
  VisitStatus.rejected: 'REJECTED',
  VisitStatus.checkedIn: 'CHECKED_IN',
  VisitStatus.checkedOut: 'CHECKED_OUT',
};
