import 'package:freezed_annotation/freezed_annotation.dart';

part 'host.freezed.dart';
part 'host.g.dart';

/// Host type classification
enum HostType {
  @JsonValue('INTERNAL')
  internal,
  @JsonValue('EXTERNAL')
  external,
}

/// Location options for hosts
enum Location {
  @JsonValue('MAIN_LOBBY')
  mainLobby,
  @JsonValue('RECEPTION')
  reception,
  @JsonValue('CONFERENCE_ROOM_A')
  conferenceRoomA,
  @JsonValue('CONFERENCE_ROOM_B')
  conferenceRoomB,
  @JsonValue('MEETING_ROOM_1')
  meetingRoom1,
  @JsonValue('MEETING_ROOM_2')
  meetingRoom2,
  @JsonValue('EXECUTIVE_SUITE')
  executiveSuite,
  @JsonValue('CAFETERIA')
  cafeteria,
  @JsonValue('TRAINING_ROOM')
  trainingRoom,
}

/// Host status
enum HostStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('INACTIVE')
  inactive,
}

/// Host model representing a user who can host visitors
@freezed
abstract class Host with _$Host {
  const factory Host({
    required String id,
    required String externalId,
    required String name,
    required String company,
    required String email,
    required String phone,
    required Location location,
    required HostStatus status,
    required HostType type,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Host;

  factory Host.fromJson(Map<String, dynamic> json) => _$HostFromJson(json);
}
