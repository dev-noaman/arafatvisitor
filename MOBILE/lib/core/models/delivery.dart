import 'package:freezed_annotation/freezed_annotation.dart';
import 'host.dart';

part 'delivery.freezed.dart';
part 'delivery.g.dart';

/// Delivery status throughout the delivery lifecycle
enum DeliveryStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('RECEIVED')
  received,
  @JsonValue('PICKED_UP')
  pickedUp,
}

/// Delivery model representing a package delivery
@freezed
class Delivery with _$Delivery {
  const factory Delivery({
    required String id,
    required String deliveryType,
    required String recipient,
    required String hostId,
    Host? host,
    String? courier,
    required String location,
    required DeliveryStatus status,
    String? notes,
    DateTime? receivedAt,
    DateTime? pickedUpAt,
    required DateTime createdAt,
  }) = _Delivery;

  factory Delivery.fromJson(Map<String, dynamic> json) =>
      _$DeliveryFromJson(json);
}
