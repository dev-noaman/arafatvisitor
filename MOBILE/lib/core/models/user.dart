import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

/// User roles in the Arafat VMS system
enum UserRole {
  @JsonValue('ADMIN')
  admin,
  @JsonValue('RECEPTION')
  reception,
  @JsonValue('HOST')
  host,
  @JsonValue('STAFF')
  staff,
}

/// User account status
enum UserStatus {
  @JsonValue('ACTIVE')
  active,
  @JsonValue('INACTIVE')
  inactive,
  @JsonValue('DEACTIVATED')
  deactivated,
}

/// User model representing a system user
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    required UserRole role,
    String? hostId,
    String? accessToken,
    String? refreshToken,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
