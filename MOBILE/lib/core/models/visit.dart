import 'package:freezed_annotation/freezed_annotation.dart';
import 'host.dart';

part 'visit.freezed.dart';
part 'visit.g.dart';

/// Visit status throughout the visitor lifecycle
enum VisitStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('APPROVED')
  approved,
  @JsonValue('REJECTED')
  rejected,
  @JsonValue('CHECKED_IN')
  checkedIn,
  @JsonValue('CHECKED_OUT')
  checkedOut,
}

/// Visit model representing a visitor's visit
@freezed
class Visit with _$Visit {
  const factory Visit({
    required String id,
    String? sessionId,
    required String visitorName,
    required String visitorCompany,
    required String visitorPhone,
    String? visitorEmail,
    required String hostId,
    Host? host,
    required String purpose,
    required String location,
    required VisitStatus status,
    DateTime? expectedDate,
    DateTime? checkInAt,
    DateTime? checkOutAt,
    DateTime? approvedAt,
    DateTime? rejectedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Visit;

  factory Visit.fromJson(Map<String, dynamic> json) => _$VisitFromJson(json);
}
