// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lookup.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_LookupPurpose _$LookupPurposeFromJson(Map<String, dynamic> json) =>
    _LookupPurpose(id: json['id'] as String, name: json['name'] as String);

Map<String, dynamic> _$LookupPurposeToJson(_LookupPurpose instance) =>
    <String, dynamic>{'id': instance.id, 'name': instance.name};

_LookupDeliveryType _$LookupDeliveryTypeFromJson(Map<String, dynamic> json) =>
    _LookupDeliveryType(id: json['id'] as String, name: json['name'] as String);

Map<String, dynamic> _$LookupDeliveryTypeToJson(_LookupDeliveryType instance) =>
    <String, dynamic>{'id': instance.id, 'name': instance.name};

_LookupCourier _$LookupCourierFromJson(Map<String, dynamic> json) =>
    _LookupCourier(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
    );

Map<String, dynamic> _$LookupCourierToJson(_LookupCourier instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'category': instance.category,
    };

_LookupLocation _$LookupLocationFromJson(Map<String, dynamic> json) =>
    _LookupLocation(id: json['id'] as String, name: json['name'] as String);

Map<String, dynamic> _$LookupLocationToJson(_LookupLocation instance) =>
    <String, dynamic>{'id': instance.id, 'name': instance.name};
