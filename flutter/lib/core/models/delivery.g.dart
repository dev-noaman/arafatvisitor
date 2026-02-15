// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Delivery _$DeliveryFromJson(Map<String, dynamic> json) => _Delivery(
  id: json['id'] as String,
  deliveryType: json['deliveryType'] as String,
  recipient: json['recipient'] as String,
  hostId: json['hostId'] as String,
  host: json['host'] == null
      ? null
      : Host.fromJson(json['host'] as Map<String, dynamic>),
  courier: json['courier'] as String?,
  location: json['location'] as String,
  status: $enumDecode(_$DeliveryStatusEnumMap, json['status']),
  notes: json['notes'] as String?,
  receivedAt: json['receivedAt'] == null
      ? null
      : DateTime.parse(json['receivedAt'] as String),
  pickedUpAt: json['pickedUpAt'] == null
      ? null
      : DateTime.parse(json['pickedUpAt'] as String),
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$DeliveryToJson(_Delivery instance) => <String, dynamic>{
  'id': instance.id,
  'deliveryType': instance.deliveryType,
  'recipient': instance.recipient,
  'hostId': instance.hostId,
  'host': ?instance.host?.toJson(),
  'courier': ?instance.courier,
  'location': instance.location,
  'status': _$DeliveryStatusEnumMap[instance.status]!,
  'notes': ?instance.notes,
  'receivedAt': ?instance.receivedAt?.toIso8601String(),
  'pickedUpAt': ?instance.pickedUpAt?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$DeliveryStatusEnumMap = {
  DeliveryStatus.pending: 'PENDING',
  DeliveryStatus.received: 'RECEIVED',
  DeliveryStatus.pickedUp: 'PICKED_UP',
};
