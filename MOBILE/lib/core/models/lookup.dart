import 'package:freezed_annotation/freezed_annotation.dart';

part 'lookup.freezed.dart';
part 'lookup.g.dart';

/// Visit purpose lookup
@freezed
abstract class LookupPurpose with _$LookupPurpose {
  const factory LookupPurpose({required String id, required String name}) =
      _LookupPurpose;

  factory LookupPurpose.fromJson(Map<String, dynamic> json) =>
      _$LookupPurposeFromJson(json);
}

/// Delivery type lookup
@freezed
abstract class LookupDeliveryType with _$LookupDeliveryType {
  const factory LookupDeliveryType({required String id, required String name}) =
      _LookupDeliveryType;

  factory LookupDeliveryType.fromJson(Map<String, dynamic> json) =>
      _$LookupDeliveryTypeFromJson(json);
}

/// Courier lookup with category
@freezed
abstract class LookupCourier with _$LookupCourier {
  const factory LookupCourier({
    required String id,
    required String name,
    required String category,
  }) = _LookupCourier;

  factory LookupCourier.fromJson(Map<String, dynamic> json) =>
      _$LookupCourierFromJson(json);
}

/// Location lookup
@freezed
abstract class LookupLocation with _$LookupLocation {
  const factory LookupLocation({required String id, required String name}) =
      _LookupLocation;

  factory LookupLocation.fromJson(Map<String, dynamic> json) =>
      _$LookupLocationFromJson(json);
}
