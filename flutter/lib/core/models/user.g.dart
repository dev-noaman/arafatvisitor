// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_User _$UserFromJson(Map<String, dynamic> json) => _User(
  id: json['id'] as String,
  email: json['email'] as String,
  name: json['name'] as String,
  role: $enumDecode(_$UserRoleEnumMap, json['role']),
  hostId: json['hostId'] as String?,
  accessToken: json['accessToken'] as String?,
  refreshToken: json['refreshToken'] as String?,
);

Map<String, dynamic> _$UserToJson(_User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'name': instance.name,
  'role': _$UserRoleEnumMap[instance.role]!,
  'hostId': ?instance.hostId,
  'accessToken': ?instance.accessToken,
  'refreshToken': ?instance.refreshToken,
};

const _$UserRoleEnumMap = {
  UserRole.admin: 'ADMIN',
  UserRole.reception: 'RECEPTION',
  UserRole.host: 'HOST',
  UserRole.staff: 'STAFF',
};
