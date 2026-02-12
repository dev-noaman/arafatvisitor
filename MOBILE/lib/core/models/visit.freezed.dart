// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'visit.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Visit {

 String get id; String? get sessionId; String get visitorName; String get visitorCompany; String get visitorPhone; String? get visitorEmail; String get hostId; Host? get host; String get purpose; String get location; VisitStatus get status; DateTime? get expectedDate; DateTime? get checkInAt; DateTime? get checkOutAt; DateTime? get approvedAt; DateTime? get rejectedAt; DateTime get createdAt; DateTime get updatedAt;
/// Create a copy of Visit
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VisitCopyWith<Visit> get copyWith => _$VisitCopyWithImpl<Visit>(this as Visit, _$identity);

  /// Serializes this Visit to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Visit&&(identical(other.id, id) || other.id == id)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorCompany, visitorCompany) || other.visitorCompany == visitorCompany)&&(identical(other.visitorPhone, visitorPhone) || other.visitorPhone == visitorPhone)&&(identical(other.visitorEmail, visitorEmail) || other.visitorEmail == visitorEmail)&&(identical(other.hostId, hostId) || other.hostId == hostId)&&(identical(other.host, host) || other.host == host)&&(identical(other.purpose, purpose) || other.purpose == purpose)&&(identical(other.location, location) || other.location == location)&&(identical(other.status, status) || other.status == status)&&(identical(other.expectedDate, expectedDate) || other.expectedDate == expectedDate)&&(identical(other.checkInAt, checkInAt) || other.checkInAt == checkInAt)&&(identical(other.checkOutAt, checkOutAt) || other.checkOutAt == checkOutAt)&&(identical(other.approvedAt, approvedAt) || other.approvedAt == approvedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,sessionId,visitorName,visitorCompany,visitorPhone,visitorEmail,hostId,host,purpose,location,status,expectedDate,checkInAt,checkOutAt,approvedAt,rejectedAt,createdAt,updatedAt);

@override
String toString() {
  return 'Visit(id: $id, sessionId: $sessionId, visitorName: $visitorName, visitorCompany: $visitorCompany, visitorPhone: $visitorPhone, visitorEmail: $visitorEmail, hostId: $hostId, host: $host, purpose: $purpose, location: $location, status: $status, expectedDate: $expectedDate, checkInAt: $checkInAt, checkOutAt: $checkOutAt, approvedAt: $approvedAt, rejectedAt: $rejectedAt, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class $VisitCopyWith<$Res>  {
  factory $VisitCopyWith(Visit value, $Res Function(Visit) _then) = _$VisitCopyWithImpl;
@useResult
$Res call({
 String id, String? sessionId, String visitorName, String visitorCompany, String visitorPhone, String? visitorEmail, String hostId, Host? host, String purpose, String location, VisitStatus status, DateTime? expectedDate, DateTime? checkInAt, DateTime? checkOutAt, DateTime? approvedAt, DateTime? rejectedAt, DateTime createdAt, DateTime updatedAt
});


$HostCopyWith<$Res>? get host;

}
/// @nodoc
class _$VisitCopyWithImpl<$Res>
    implements $VisitCopyWith<$Res> {
  _$VisitCopyWithImpl(this._self, this._then);

  final Visit _self;
  final $Res Function(Visit) _then;

/// Create a copy of Visit
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? sessionId = freezed,Object? visitorName = null,Object? visitorCompany = null,Object? visitorPhone = null,Object? visitorEmail = freezed,Object? hostId = null,Object? host = freezed,Object? purpose = null,Object? location = null,Object? status = null,Object? expectedDate = freezed,Object? checkInAt = freezed,Object? checkOutAt = freezed,Object? approvedAt = freezed,Object? rejectedAt = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorCompany: null == visitorCompany ? _self.visitorCompany : visitorCompany // ignore: cast_nullable_to_non_nullable
as String,visitorPhone: null == visitorPhone ? _self.visitorPhone : visitorPhone // ignore: cast_nullable_to_non_nullable
as String,visitorEmail: freezed == visitorEmail ? _self.visitorEmail : visitorEmail // ignore: cast_nullable_to_non_nullable
as String?,hostId: null == hostId ? _self.hostId : hostId // ignore: cast_nullable_to_non_nullable
as String,host: freezed == host ? _self.host : host // ignore: cast_nullable_to_non_nullable
as Host?,purpose: null == purpose ? _self.purpose : purpose // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as VisitStatus,expectedDate: freezed == expectedDate ? _self.expectedDate : expectedDate // ignore: cast_nullable_to_non_nullable
as DateTime?,checkInAt: freezed == checkInAt ? _self.checkInAt : checkInAt // ignore: cast_nullable_to_non_nullable
as DateTime?,checkOutAt: freezed == checkOutAt ? _self.checkOutAt : checkOutAt // ignore: cast_nullable_to_non_nullable
as DateTime?,approvedAt: freezed == approvedAt ? _self.approvedAt : approvedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}
/// Create a copy of Visit
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


/// Adds pattern-matching-related methods to [Visit].
extension VisitPatterns on Visit {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Visit value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Visit() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Visit value)  $default,){
final _that = this;
switch (_that) {
case _Visit():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Visit value)?  $default,){
final _that = this;
switch (_that) {
case _Visit() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? sessionId,  String visitorName,  String visitorCompany,  String visitorPhone,  String? visitorEmail,  String hostId,  Host? host,  String purpose,  String location,  VisitStatus status,  DateTime? expectedDate,  DateTime? checkInAt,  DateTime? checkOutAt,  DateTime? approvedAt,  DateTime? rejectedAt,  DateTime createdAt,  DateTime updatedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Visit() when $default != null:
return $default(_that.id,_that.sessionId,_that.visitorName,_that.visitorCompany,_that.visitorPhone,_that.visitorEmail,_that.hostId,_that.host,_that.purpose,_that.location,_that.status,_that.expectedDate,_that.checkInAt,_that.checkOutAt,_that.approvedAt,_that.rejectedAt,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? sessionId,  String visitorName,  String visitorCompany,  String visitorPhone,  String? visitorEmail,  String hostId,  Host? host,  String purpose,  String location,  VisitStatus status,  DateTime? expectedDate,  DateTime? checkInAt,  DateTime? checkOutAt,  DateTime? approvedAt,  DateTime? rejectedAt,  DateTime createdAt,  DateTime updatedAt)  $default,) {final _that = this;
switch (_that) {
case _Visit():
return $default(_that.id,_that.sessionId,_that.visitorName,_that.visitorCompany,_that.visitorPhone,_that.visitorEmail,_that.hostId,_that.host,_that.purpose,_that.location,_that.status,_that.expectedDate,_that.checkInAt,_that.checkOutAt,_that.approvedAt,_that.rejectedAt,_that.createdAt,_that.updatedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? sessionId,  String visitorName,  String visitorCompany,  String visitorPhone,  String? visitorEmail,  String hostId,  Host? host,  String purpose,  String location,  VisitStatus status,  DateTime? expectedDate,  DateTime? checkInAt,  DateTime? checkOutAt,  DateTime? approvedAt,  DateTime? rejectedAt,  DateTime createdAt,  DateTime updatedAt)?  $default,) {final _that = this;
switch (_that) {
case _Visit() when $default != null:
return $default(_that.id,_that.sessionId,_that.visitorName,_that.visitorCompany,_that.visitorPhone,_that.visitorEmail,_that.hostId,_that.host,_that.purpose,_that.location,_that.status,_that.expectedDate,_that.checkInAt,_that.checkOutAt,_that.approvedAt,_that.rejectedAt,_that.createdAt,_that.updatedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Visit implements Visit {
  const _Visit({required this.id, this.sessionId, required this.visitorName, required this.visitorCompany, required this.visitorPhone, this.visitorEmail, required this.hostId, this.host, required this.purpose, required this.location, required this.status, this.expectedDate, this.checkInAt, this.checkOutAt, this.approvedAt, this.rejectedAt, required this.createdAt, required this.updatedAt});
  factory _Visit.fromJson(Map<String, dynamic> json) => _$VisitFromJson(json);

@override final  String id;
@override final  String? sessionId;
@override final  String visitorName;
@override final  String visitorCompany;
@override final  String visitorPhone;
@override final  String? visitorEmail;
@override final  String hostId;
@override final  Host? host;
@override final  String purpose;
@override final  String location;
@override final  VisitStatus status;
@override final  DateTime? expectedDate;
@override final  DateTime? checkInAt;
@override final  DateTime? checkOutAt;
@override final  DateTime? approvedAt;
@override final  DateTime? rejectedAt;
@override final  DateTime createdAt;
@override final  DateTime updatedAt;

/// Create a copy of Visit
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VisitCopyWith<_Visit> get copyWith => __$VisitCopyWithImpl<_Visit>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VisitToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Visit&&(identical(other.id, id) || other.id == id)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorCompany, visitorCompany) || other.visitorCompany == visitorCompany)&&(identical(other.visitorPhone, visitorPhone) || other.visitorPhone == visitorPhone)&&(identical(other.visitorEmail, visitorEmail) || other.visitorEmail == visitorEmail)&&(identical(other.hostId, hostId) || other.hostId == hostId)&&(identical(other.host, host) || other.host == host)&&(identical(other.purpose, purpose) || other.purpose == purpose)&&(identical(other.location, location) || other.location == location)&&(identical(other.status, status) || other.status == status)&&(identical(other.expectedDate, expectedDate) || other.expectedDate == expectedDate)&&(identical(other.checkInAt, checkInAt) || other.checkInAt == checkInAt)&&(identical(other.checkOutAt, checkOutAt) || other.checkOutAt == checkOutAt)&&(identical(other.approvedAt, approvedAt) || other.approvedAt == approvedAt)&&(identical(other.rejectedAt, rejectedAt) || other.rejectedAt == rejectedAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,sessionId,visitorName,visitorCompany,visitorPhone,visitorEmail,hostId,host,purpose,location,status,expectedDate,checkInAt,checkOutAt,approvedAt,rejectedAt,createdAt,updatedAt);

@override
String toString() {
  return 'Visit(id: $id, sessionId: $sessionId, visitorName: $visitorName, visitorCompany: $visitorCompany, visitorPhone: $visitorPhone, visitorEmail: $visitorEmail, hostId: $hostId, host: $host, purpose: $purpose, location: $location, status: $status, expectedDate: $expectedDate, checkInAt: $checkInAt, checkOutAt: $checkOutAt, approvedAt: $approvedAt, rejectedAt: $rejectedAt, createdAt: $createdAt, updatedAt: $updatedAt)';
}


}

/// @nodoc
abstract mixin class _$VisitCopyWith<$Res> implements $VisitCopyWith<$Res> {
  factory _$VisitCopyWith(_Visit value, $Res Function(_Visit) _then) = __$VisitCopyWithImpl;
@override @useResult
$Res call({
 String id, String? sessionId, String visitorName, String visitorCompany, String visitorPhone, String? visitorEmail, String hostId, Host? host, String purpose, String location, VisitStatus status, DateTime? expectedDate, DateTime? checkInAt, DateTime? checkOutAt, DateTime? approvedAt, DateTime? rejectedAt, DateTime createdAt, DateTime updatedAt
});


@override $HostCopyWith<$Res>? get host;

}
/// @nodoc
class __$VisitCopyWithImpl<$Res>
    implements _$VisitCopyWith<$Res> {
  __$VisitCopyWithImpl(this._self, this._then);

  final _Visit _self;
  final $Res Function(_Visit) _then;

/// Create a copy of Visit
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? sessionId = freezed,Object? visitorName = null,Object? visitorCompany = null,Object? visitorPhone = null,Object? visitorEmail = freezed,Object? hostId = null,Object? host = freezed,Object? purpose = null,Object? location = null,Object? status = null,Object? expectedDate = freezed,Object? checkInAt = freezed,Object? checkOutAt = freezed,Object? approvedAt = freezed,Object? rejectedAt = freezed,Object? createdAt = null,Object? updatedAt = null,}) {
  return _then(_Visit(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorCompany: null == visitorCompany ? _self.visitorCompany : visitorCompany // ignore: cast_nullable_to_non_nullable
as String,visitorPhone: null == visitorPhone ? _self.visitorPhone : visitorPhone // ignore: cast_nullable_to_non_nullable
as String,visitorEmail: freezed == visitorEmail ? _self.visitorEmail : visitorEmail // ignore: cast_nullable_to_non_nullable
as String?,hostId: null == hostId ? _self.hostId : hostId // ignore: cast_nullable_to_non_nullable
as String,host: freezed == host ? _self.host : host // ignore: cast_nullable_to_non_nullable
as Host?,purpose: null == purpose ? _self.purpose : purpose // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as VisitStatus,expectedDate: freezed == expectedDate ? _self.expectedDate : expectedDate // ignore: cast_nullable_to_non_nullable
as DateTime?,checkInAt: freezed == checkInAt ? _self.checkInAt : checkInAt // ignore: cast_nullable_to_non_nullable
as DateTime?,checkOutAt: freezed == checkOutAt ? _self.checkOutAt : checkOutAt // ignore: cast_nullable_to_non_nullable
as DateTime?,approvedAt: freezed == approvedAt ? _self.approvedAt : approvedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,rejectedAt: freezed == rejectedAt ? _self.rejectedAt : rejectedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

/// Create a copy of Visit
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
