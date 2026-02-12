// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'host.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Host _$HostFromJson(Map<String, dynamic> json) => _Host(
  id: json['id'] as String,
  externalId: json['externalId'] as String,
  name: json['name'] as String,
  company: json['company'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String,
  location: $enumDecode(_$LocationEnumMap, json['location']),
  status: $enumDecode(_$HostStatusEnumMap, json['status']),
  type: $enumDecode(_$HostTypeEnumMap, json['type']),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$HostToJson(_Host instance) => <String, dynamic>{
  'id': instance.id,
  'externalId': instance.externalId,
  'name': instance.name,
  'company': instance.company,
  'email': instance.email,
  'phone': instance.phone,
  'location': _$LocationEnumMap[instance.location]!,
  'status': _$HostStatusEnumMap[instance.status]!,
  'type': _$HostTypeEnumMap[instance.type]!,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$LocationEnumMap = {
  Location.mainLobby: 'MAIN_LOBBY',
  Location.reception: 'RECEPTION',
  Location.conferenceRoomA: 'CONFERENCE_ROOM_A',
  Location.conferenceRoomB: 'CONFERENCE_ROOM_B',
  Location.meetingRoom1: 'MEETING_ROOM_1',
  Location.meetingRoom2: 'MEETING_ROOM_2',
  Location.executiveSuite: 'EXECUTIVE_SUITE',
  Location.cafeteria: 'CAFETERIA',
  Location.trainingRoom: 'TRAINING_ROOM',
};

const _$HostStatusEnumMap = {
  HostStatus.active: 'ACTIVE',
  HostStatus.inactive: 'INACTIVE',
};

const _$HostTypeEnumMap = {
  HostType.internal: 'INTERNAL',
  HostType.external: 'EXTERNAL',
};
