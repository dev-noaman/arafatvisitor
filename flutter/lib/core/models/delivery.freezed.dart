// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'delivery.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Delivery {

 String get id; String get deliveryType; String get recipient; String get hostId; Host? get host; String? get courier; String get location; DeliveryStatus get status; String? get notes; DateTime? get receivedAt; DateTime? get pickedUpAt; DateTime get createdAt;
/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DeliveryCopyWith<Delivery> get copyWith => _$DeliveryCopyWithImpl<Delivery>(this as Delivery, _$identity);

  /// Serializes this Delivery to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Delivery&&(identical(other.id, id) || other.id == id)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.recipient, recipient) || other.recipient == recipient)&&(identical(other.hostId, hostId) || other.hostId == hostId)&&(identical(other.host, host) || other.host == host)&&(identical(other.courier, courier) || other.courier == courier)&&(identical(other.location, location) || other.location == location)&&(identical(other.status, status) || other.status == status)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.receivedAt, receivedAt) || other.receivedAt == receivedAt)&&(identical(other.pickedUpAt, pickedUpAt) || other.pickedUpAt == pickedUpAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,deliveryType,recipient,hostId,host,courier,location,status,notes,receivedAt,pickedUpAt,createdAt);

@override
String toString() {
  return 'Delivery(id: $id, deliveryType: $deliveryType, recipient: $recipient, hostId: $hostId, host: $host, courier: $courier, location: $location, status: $status, notes: $notes, receivedAt: $receivedAt, pickedUpAt: $pickedUpAt, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $DeliveryCopyWith<$Res>  {
  factory $DeliveryCopyWith(Delivery value, $Res Function(Delivery) _then) = _$DeliveryCopyWithImpl;
@useResult
$Res call({
 String id, String deliveryType, String recipient, String hostId, Host? host, String? courier, String location, DeliveryStatus status, String? notes, DateTime? receivedAt, DateTime? pickedUpAt, DateTime createdAt
});


$HostCopyWith<$Res>? get host;

}
/// @nodoc
class _$DeliveryCopyWithImpl<$Res>
    implements $DeliveryCopyWith<$Res> {
  _$DeliveryCopyWithImpl(this._self, this._then);

  final Delivery _self;
  final $Res Function(Delivery) _then;

/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? deliveryType = null,Object? recipient = null,Object? hostId = null,Object? host = freezed,Object? courier = freezed,Object? location = null,Object? status = null,Object? notes = freezed,Object? receivedAt = freezed,Object? pickedUpAt = freezed,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,recipient: null == recipient ? _self.recipient : recipient // ignore: cast_nullable_to_non_nullable
as String,hostId: null == hostId ? _self.hostId : hostId // ignore: cast_nullable_to_non_nullable
as String,host: freezed == host ? _self.host : host // ignore: cast_nullable_to_non_nullable
as Host?,courier: freezed == courier ? _self.courier : courier // ignore: cast_nullable_to_non_nullable
as String?,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as DeliveryStatus,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,receivedAt: freezed == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,pickedUpAt: freezed == pickedUpAt ? _self.pickedUpAt : pickedUpAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}
/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$HostCopyWith<$Res>? get host {
    if (_self.host == null) {
    return null;
  }

  return $HostCopyWith<$Res>(_self.host!, (value) {
    return _then(_self.copyWith(host: value));
  });
}
}


/// Adds pattern-matching-related methods to [Delivery].
extension DeliveryPatterns on Delivery {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Delivery value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Delivery() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Delivery value)  $default,){
final _that = this;
switch (_that) {
case _Delivery():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Delivery value)?  $default,){
final _that = this;
switch (_that) {
case _Delivery() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String deliveryType,  String recipient,  String hostId,  Host? host,  String? courier,  String location,  DeliveryStatus status,  String? notes,  DateTime? receivedAt,  DateTime? pickedUpAt,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Delivery() when $default != null:
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostId,_that.host,_that.courier,_that.location,_that.status,_that.notes,_that.receivedAt,_that.pickedUpAt,_that.createdAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String deliveryType,  String recipient,  String hostId,  Host? host,  String? courier,  String location,  DeliveryStatus status,  String? notes,  DateTime? receivedAt,  DateTime? pickedUpAt,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _Delivery():
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostId,_that.host,_that.courier,_that.location,_that.status,_that.notes,_that.receivedAt,_that.pickedUpAt,_that.createdAt);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String deliveryType,  String recipient,  String hostId,  Host? host,  String? courier,  String location,  DeliveryStatus status,  String? notes,  DateTime? receivedAt,  DateTime? pickedUpAt,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _Delivery() when $default != null:
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostId,_that.host,_that.courier,_that.location,_that.status,_that.notes,_that.receivedAt,_that.pickedUpAt,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Delivery implements Delivery {
  const _Delivery({required this.id, required this.deliveryType, required this.recipient, required this.hostId, this.host, this.courier, required this.location, required this.status, this.notes, this.receivedAt, this.pickedUpAt, required this.createdAt});
  factory _Delivery.fromJson(Map<String, dynamic> json) => _$DeliveryFromJson(json);

@override final  String id;
@override final  String deliveryType;
@override final  String recipient;
@override final  String hostId;
@override final  Host? host;
@override final  String? courier;
@override final  String location;
@override final  DeliveryStatus status;
@override final  String? notes;
@override final  DateTime? receivedAt;
@override final  DateTime? pickedUpAt;
@override final  DateTime createdAt;

/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DeliveryCopyWith<_Delivery> get copyWith => __$DeliveryCopyWithImpl<_Delivery>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DeliveryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Delivery&&(identical(other.id, id) || other.id == id)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.recipient, recipient) || other.recipient == recipient)&&(identical(other.hostId, hostId) || other.hostId == hostId)&&(identical(other.host, host) || other.host == host)&&(identical(other.courier, courier) || other.courier == courier)&&(identical(other.location, location) || other.location == location)&&(identical(other.status, status) || other.status == status)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.receivedAt, receivedAt) || other.receivedAt == receivedAt)&&(identical(other.pickedUpAt, pickedUpAt) || other.pickedUpAt == pickedUpAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,deliveryType,recipient,hostId,host,courier,location,status,notes,receivedAt,pickedUpAt,createdAt);

@override
String toString() {
  return 'Delivery(id: $id, deliveryType: $deliveryType, recipient: $recipient, hostId: $hostId, host: $host, courier: $courier, location: $location, status: $status, notes: $notes, receivedAt: $receivedAt, pickedUpAt: $pickedUpAt, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$DeliveryCopyWith<$Res> implements $DeliveryCopyWith<$Res> {
  factory _$DeliveryCopyWith(_Delivery value, $Res Function(_Delivery) _then) = __$DeliveryCopyWithImpl;
@override @useResult
$Res call({
 String id, String deliveryType, String recipient, String hostId, Host? host, String? courier, String location, DeliveryStatus status, String? notes, DateTime? receivedAt, DateTime? pickedUpAt, DateTime createdAt
});


@override $HostCopyWith<$Res>? get host;

}
/// @nodoc
class __$DeliveryCopyWithImpl<$Res>
    implements _$DeliveryCopyWith<$Res> {
  __$DeliveryCopyWithImpl(this._self, this._then);

  final _Delivery _self;
  final $Res Function(_Delivery) _then;

/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? deliveryType = null,Object? recipient = null,Object? hostId = null,Object? host = freezed,Object? courier = freezed,Object? location = null,Object? status = null,Object? notes = freezed,Object? receivedAt = freezed,Object? pickedUpAt = freezed,Object? createdAt = null,}) {
  return _then(_Delivery(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,recipient: null == recipient ? _self.recipient : recipient // ignore: cast_nullable_to_non_nullable
as String,hostId: null == hostId ? _self.hostId : hostId // ignore: cast_nullable_to_non_nullable
as String,host: freezed == host ? _self.host : host // ignore: cast_nullable_to_non_nullable
as Host?,courier: freezed == courier ? _self.courier : courier // ignore: cast_nullable_to_non_nullable
as String?,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as DeliveryStatus,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,receivedAt: freezed == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,pickedUpAt: freezed == pickedUpAt ? _self.pickedUpAt : pickedUpAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

/// Create a copy of Delivery
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$HostCopyWith<$Res>? get host {
    if (_self.host == null) {
    return null;
  }

  return $HostCopyWith<$Res>(_self.host!, (value) {
    return _then(_self.copyWith(host: value));
  });
}
}

// dart format on
