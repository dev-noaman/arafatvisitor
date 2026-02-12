// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'dashboard.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$DashboardKpis {

 int get totalHosts; int get visitsToday; int get deliveriesToday;
/// Create a copy of DashboardKpis
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DashboardKpisCopyWith<DashboardKpis> get copyWith => _$DashboardKpisCopyWithImpl<DashboardKpis>(this as DashboardKpis, _$identity);

  /// Serializes this DashboardKpis to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DashboardKpis&&(identical(other.totalHosts, totalHosts) || other.totalHosts == totalHosts)&&(identical(other.visitsToday, visitsToday) || other.visitsToday == visitsToday)&&(identical(other.deliveriesToday, deliveriesToday) || other.deliveriesToday == deliveriesToday));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalHosts,visitsToday,deliveriesToday);

@override
String toString() {
  return 'DashboardKpis(totalHosts: $totalHosts, visitsToday: $visitsToday, deliveriesToday: $deliveriesToday)';
}


}

/// @nodoc
abstract mixin class $DashboardKpisCopyWith<$Res>  {
  factory $DashboardKpisCopyWith(DashboardKpis value, $Res Function(DashboardKpis) _then) = _$DashboardKpisCopyWithImpl;
@useResult
$Res call({
 int totalHosts, int visitsToday, int deliveriesToday
});




}
/// @nodoc
class _$DashboardKpisCopyWithImpl<$Res>
    implements $DashboardKpisCopyWith<$Res> {
  _$DashboardKpisCopyWithImpl(this._self, this._then);

  final DashboardKpis _self;
  final $Res Function(DashboardKpis) _then;

/// Create a copy of DashboardKpis
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalHosts = null,Object? visitsToday = null,Object? deliveriesToday = null,}) {
  return _then(_self.copyWith(
totalHosts: null == totalHosts ? _self.totalHosts : totalHosts // ignore: cast_nullable_to_non_nullable
as int,visitsToday: null == visitsToday ? _self.visitsToday : visitsToday // ignore: cast_nullable_to_non_nullable
as int,deliveriesToday: null == deliveriesToday ? _self.deliveriesToday : deliveriesToday // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [DashboardKpis].
extension DashboardKpisPatterns on DashboardKpis {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DashboardKpis value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DashboardKpis() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DashboardKpis value)  $default,){
final _that = this;
switch (_that) {
case _DashboardKpis():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DashboardKpis value)?  $default,){
final _that = this;
switch (_that) {
case _DashboardKpis() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int totalHosts,  int visitsToday,  int deliveriesToday)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DashboardKpis() when $default != null:
return $default(_that.totalHosts,_that.visitsToday,_that.deliveriesToday);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int totalHosts,  int visitsToday,  int deliveriesToday)  $default,) {final _that = this;
switch (_that) {
case _DashboardKpis():
return $default(_that.totalHosts,_that.visitsToday,_that.deliveriesToday);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int totalHosts,  int visitsToday,  int deliveriesToday)?  $default,) {final _that = this;
switch (_that) {
case _DashboardKpis() when $default != null:
return $default(_that.totalHosts,_that.visitsToday,_that.deliveriesToday);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DashboardKpis implements DashboardKpis {
  const _DashboardKpis({required this.totalHosts, required this.visitsToday, required this.deliveriesToday});
  factory _DashboardKpis.fromJson(Map<String, dynamic> json) => _$DashboardKpisFromJson(json);

@override final  int totalHosts;
@override final  int visitsToday;
@override final  int deliveriesToday;

/// Create a copy of DashboardKpis
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DashboardKpisCopyWith<_DashboardKpis> get copyWith => __$DashboardKpisCopyWithImpl<_DashboardKpis>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DashboardKpisToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DashboardKpis&&(identical(other.totalHosts, totalHosts) || other.totalHosts == totalHosts)&&(identical(other.visitsToday, visitsToday) || other.visitsToday == visitsToday)&&(identical(other.deliveriesToday, deliveriesToday) || other.deliveriesToday == deliveriesToday));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalHosts,visitsToday,deliveriesToday);

@override
String toString() {
  return 'DashboardKpis(totalHosts: $totalHosts, visitsToday: $visitsToday, deliveriesToday: $deliveriesToday)';
}


}

/// @nodoc
abstract mixin class _$DashboardKpisCopyWith<$Res> implements $DashboardKpisCopyWith<$Res> {
  factory _$DashboardKpisCopyWith(_DashboardKpis value, $Res Function(_DashboardKpis) _then) = __$DashboardKpisCopyWithImpl;
@override @useResult
$Res call({
 int totalHosts, int visitsToday, int deliveriesToday
});




}
/// @nodoc
class __$DashboardKpisCopyWithImpl<$Res>
    implements _$DashboardKpisCopyWith<$Res> {
  __$DashboardKpisCopyWithImpl(this._self, this._then);

  final _DashboardKpis _self;
  final $Res Function(_DashboardKpis) _then;

/// Create a copy of DashboardKpis
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalHosts = null,Object? visitsToday = null,Object? deliveriesToday = null,}) {
  return _then(_DashboardKpis(
totalHosts: null == totalHosts ? _self.totalHosts : totalHosts // ignore: cast_nullable_to_non_nullable
as int,visitsToday: null == visitsToday ? _self.visitsToday : visitsToday // ignore: cast_nullable_to_non_nullable
as int,deliveriesToday: null == deliveriesToday ? _self.deliveriesToday : deliveriesToday // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$PendingApproval {

 String get id; String get visitorName; String get visitorPhone; String get hostName; String get hostCompany; DateTime get expectedDate;
/// Create a copy of PendingApproval
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PendingApprovalCopyWith<PendingApproval> get copyWith => _$PendingApprovalCopyWithImpl<PendingApproval>(this as PendingApproval, _$identity);

  /// Serializes this PendingApproval to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PendingApproval&&(identical(other.id, id) || other.id == id)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorPhone, visitorPhone) || other.visitorPhone == visitorPhone)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.expectedDate, expectedDate) || other.expectedDate == expectedDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,visitorName,visitorPhone,hostName,hostCompany,expectedDate);

@override
String toString() {
  return 'PendingApproval(id: $id, visitorName: $visitorName, visitorPhone: $visitorPhone, hostName: $hostName, hostCompany: $hostCompany, expectedDate: $expectedDate)';
}


}

/// @nodoc
abstract mixin class $PendingApprovalCopyWith<$Res>  {
  factory $PendingApprovalCopyWith(PendingApproval value, $Res Function(PendingApproval) _then) = _$PendingApprovalCopyWithImpl;
@useResult
$Res call({
 String id, String visitorName, String visitorPhone, String hostName, String hostCompany, DateTime expectedDate
});




}
/// @nodoc
class _$PendingApprovalCopyWithImpl<$Res>
    implements $PendingApprovalCopyWith<$Res> {
  _$PendingApprovalCopyWithImpl(this._self, this._then);

  final PendingApproval _self;
  final $Res Function(PendingApproval) _then;

/// Create a copy of PendingApproval
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? visitorName = null,Object? visitorPhone = null,Object? hostName = null,Object? hostCompany = null,Object? expectedDate = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorPhone: null == visitorPhone ? _self.visitorPhone : visitorPhone // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,expectedDate: null == expectedDate ? _self.expectedDate : expectedDate // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [PendingApproval].
extension PendingApprovalPatterns on PendingApproval {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PendingApproval value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PendingApproval() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PendingApproval value)  $default,){
final _that = this;
switch (_that) {
case _PendingApproval():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PendingApproval value)?  $default,){
final _that = this;
switch (_that) {
case _PendingApproval() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String visitorName,  String visitorPhone,  String hostName,  String hostCompany,  DateTime expectedDate)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PendingApproval() when $default != null:
return $default(_that.id,_that.visitorName,_that.visitorPhone,_that.hostName,_that.hostCompany,_that.expectedDate);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String visitorName,  String visitorPhone,  String hostName,  String hostCompany,  DateTime expectedDate)  $default,) {final _that = this;
switch (_that) {
case _PendingApproval():
return $default(_that.id,_that.visitorName,_that.visitorPhone,_that.hostName,_that.hostCompany,_that.expectedDate);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String visitorName,  String visitorPhone,  String hostName,  String hostCompany,  DateTime expectedDate)?  $default,) {final _that = this;
switch (_that) {
case _PendingApproval() when $default != null:
return $default(_that.id,_that.visitorName,_that.visitorPhone,_that.hostName,_that.hostCompany,_that.expectedDate);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PendingApproval implements PendingApproval {
  const _PendingApproval({required this.id, required this.visitorName, required this.visitorPhone, required this.hostName, required this.hostCompany, required this.expectedDate});
  factory _PendingApproval.fromJson(Map<String, dynamic> json) => _$PendingApprovalFromJson(json);

@override final  String id;
@override final  String visitorName;
@override final  String visitorPhone;
@override final  String hostName;
@override final  String hostCompany;
@override final  DateTime expectedDate;

/// Create a copy of PendingApproval
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PendingApprovalCopyWith<_PendingApproval> get copyWith => __$PendingApprovalCopyWithImpl<_PendingApproval>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PendingApprovalToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PendingApproval&&(identical(other.id, id) || other.id == id)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorPhone, visitorPhone) || other.visitorPhone == visitorPhone)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.expectedDate, expectedDate) || other.expectedDate == expectedDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,visitorName,visitorPhone,hostName,hostCompany,expectedDate);

@override
String toString() {
  return 'PendingApproval(id: $id, visitorName: $visitorName, visitorPhone: $visitorPhone, hostName: $hostName, hostCompany: $hostCompany, expectedDate: $expectedDate)';
}


}

/// @nodoc
abstract mixin class _$PendingApprovalCopyWith<$Res> implements $PendingApprovalCopyWith<$Res> {
  factory _$PendingApprovalCopyWith(_PendingApproval value, $Res Function(_PendingApproval) _then) = __$PendingApprovalCopyWithImpl;
@override @useResult
$Res call({
 String id, String visitorName, String visitorPhone, String hostName, String hostCompany, DateTime expectedDate
});




}
/// @nodoc
class __$PendingApprovalCopyWithImpl<$Res>
    implements _$PendingApprovalCopyWith<$Res> {
  __$PendingApprovalCopyWithImpl(this._self, this._then);

  final _PendingApproval _self;
  final $Res Function(_PendingApproval) _then;

/// Create a copy of PendingApproval
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? visitorName = null,Object? visitorPhone = null,Object? hostName = null,Object? hostCompany = null,Object? expectedDate = null,}) {
  return _then(_PendingApproval(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorPhone: null == visitorPhone ? _self.visitorPhone : visitorPhone // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,expectedDate: null == expectedDate ? _self.expectedDate : expectedDate // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}


/// @nodoc
mixin _$CurrentVisitor {

 String get id; String get visitorName; String get visitorCompany; String get hostName; String get hostCompany; DateTime get checkInAt; String? get sessionId;
/// Create a copy of CurrentVisitor
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CurrentVisitorCopyWith<CurrentVisitor> get copyWith => _$CurrentVisitorCopyWithImpl<CurrentVisitor>(this as CurrentVisitor, _$identity);

  /// Serializes this CurrentVisitor to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CurrentVisitor&&(identical(other.id, id) || other.id == id)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorCompany, visitorCompany) || other.visitorCompany == visitorCompany)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.checkInAt, checkInAt) || other.checkInAt == checkInAt)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,visitorName,visitorCompany,hostName,hostCompany,checkInAt,sessionId);

@override
String toString() {
  return 'CurrentVisitor(id: $id, visitorName: $visitorName, visitorCompany: $visitorCompany, hostName: $hostName, hostCompany: $hostCompany, checkInAt: $checkInAt, sessionId: $sessionId)';
}


}

/// @nodoc
abstract mixin class $CurrentVisitorCopyWith<$Res>  {
  factory $CurrentVisitorCopyWith(CurrentVisitor value, $Res Function(CurrentVisitor) _then) = _$CurrentVisitorCopyWithImpl;
@useResult
$Res call({
 String id, String visitorName, String visitorCompany, String hostName, String hostCompany, DateTime checkInAt, String? sessionId
});




}
/// @nodoc
class _$CurrentVisitorCopyWithImpl<$Res>
    implements $CurrentVisitorCopyWith<$Res> {
  _$CurrentVisitorCopyWithImpl(this._self, this._then);

  final CurrentVisitor _self;
  final $Res Function(CurrentVisitor) _then;

/// Create a copy of CurrentVisitor
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? visitorName = null,Object? visitorCompany = null,Object? hostName = null,Object? hostCompany = null,Object? checkInAt = null,Object? sessionId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorCompany: null == visitorCompany ? _self.visitorCompany : visitorCompany // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,checkInAt: null == checkInAt ? _self.checkInAt : checkInAt // ignore: cast_nullable_to_non_nullable
as DateTime,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [CurrentVisitor].
extension CurrentVisitorPatterns on CurrentVisitor {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CurrentVisitor value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CurrentVisitor() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CurrentVisitor value)  $default,){
final _that = this;
switch (_that) {
case _CurrentVisitor():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CurrentVisitor value)?  $default,){
final _that = this;
switch (_that) {
case _CurrentVisitor() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String visitorName,  String visitorCompany,  String hostName,  String hostCompany,  DateTime checkInAt,  String? sessionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CurrentVisitor() when $default != null:
return $default(_that.id,_that.visitorName,_that.visitorCompany,_that.hostName,_that.hostCompany,_that.checkInAt,_that.sessionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String visitorName,  String visitorCompany,  String hostName,  String hostCompany,  DateTime checkInAt,  String? sessionId)  $default,) {final _that = this;
switch (_that) {
case _CurrentVisitor():
return $default(_that.id,_that.visitorName,_that.visitorCompany,_that.hostName,_that.hostCompany,_that.checkInAt,_that.sessionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String visitorName,  String visitorCompany,  String hostName,  String hostCompany,  DateTime checkInAt,  String? sessionId)?  $default,) {final _that = this;
switch (_that) {
case _CurrentVisitor() when $default != null:
return $default(_that.id,_that.visitorName,_that.visitorCompany,_that.hostName,_that.hostCompany,_that.checkInAt,_that.sessionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CurrentVisitor implements CurrentVisitor {
  const _CurrentVisitor({required this.id, required this.visitorName, required this.visitorCompany, required this.hostName, required this.hostCompany, required this.checkInAt, this.sessionId});
  factory _CurrentVisitor.fromJson(Map<String, dynamic> json) => _$CurrentVisitorFromJson(json);

@override final  String id;
@override final  String visitorName;
@override final  String visitorCompany;
@override final  String hostName;
@override final  String hostCompany;
@override final  DateTime checkInAt;
@override final  String? sessionId;

/// Create a copy of CurrentVisitor
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CurrentVisitorCopyWith<_CurrentVisitor> get copyWith => __$CurrentVisitorCopyWithImpl<_CurrentVisitor>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CurrentVisitorToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CurrentVisitor&&(identical(other.id, id) || other.id == id)&&(identical(other.visitorName, visitorName) || other.visitorName == visitorName)&&(identical(other.visitorCompany, visitorCompany) || other.visitorCompany == visitorCompany)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.checkInAt, checkInAt) || other.checkInAt == checkInAt)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,visitorName,visitorCompany,hostName,hostCompany,checkInAt,sessionId);

@override
String toString() {
  return 'CurrentVisitor(id: $id, visitorName: $visitorName, visitorCompany: $visitorCompany, hostName: $hostName, hostCompany: $hostCompany, checkInAt: $checkInAt, sessionId: $sessionId)';
}


}

/// @nodoc
abstract mixin class _$CurrentVisitorCopyWith<$Res> implements $CurrentVisitorCopyWith<$Res> {
  factory _$CurrentVisitorCopyWith(_CurrentVisitor value, $Res Function(_CurrentVisitor) _then) = __$CurrentVisitorCopyWithImpl;
@override @useResult
$Res call({
 String id, String visitorName, String visitorCompany, String hostName, String hostCompany, DateTime checkInAt, String? sessionId
});




}
/// @nodoc
class __$CurrentVisitorCopyWithImpl<$Res>
    implements _$CurrentVisitorCopyWith<$Res> {
  __$CurrentVisitorCopyWithImpl(this._self, this._then);

  final _CurrentVisitor _self;
  final $Res Function(_CurrentVisitor) _then;

/// Create a copy of CurrentVisitor
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? visitorName = null,Object? visitorCompany = null,Object? hostName = null,Object? hostCompany = null,Object? checkInAt = null,Object? sessionId = freezed,}) {
  return _then(_CurrentVisitor(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,visitorName: null == visitorName ? _self.visitorName : visitorName // ignore: cast_nullable_to_non_nullable
as String,visitorCompany: null == visitorCompany ? _self.visitorCompany : visitorCompany // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,checkInAt: null == checkInAt ? _self.checkInAt : checkInAt // ignore: cast_nullable_to_non_nullable
as DateTime,sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$ReceivedDelivery {

 String get id; String get deliveryType; String get recipient; String get hostName; String get hostCompany; DateTime get receivedAt;
/// Create a copy of ReceivedDelivery
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReceivedDeliveryCopyWith<ReceivedDelivery> get copyWith => _$ReceivedDeliveryCopyWithImpl<ReceivedDelivery>(this as ReceivedDelivery, _$identity);

  /// Serializes this ReceivedDelivery to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReceivedDelivery&&(identical(other.id, id) || other.id == id)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.recipient, recipient) || other.recipient == recipient)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.receivedAt, receivedAt) || other.receivedAt == receivedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,deliveryType,recipient,hostName,hostCompany,receivedAt);

@override
String toString() {
  return 'ReceivedDelivery(id: $id, deliveryType: $deliveryType, recipient: $recipient, hostName: $hostName, hostCompany: $hostCompany, receivedAt: $receivedAt)';
}


}

/// @nodoc
abstract mixin class $ReceivedDeliveryCopyWith<$Res>  {
  factory $ReceivedDeliveryCopyWith(ReceivedDelivery value, $Res Function(ReceivedDelivery) _then) = _$ReceivedDeliveryCopyWithImpl;
@useResult
$Res call({
 String id, String deliveryType, String recipient, String hostName, String hostCompany, DateTime receivedAt
});




}
/// @nodoc
class _$ReceivedDeliveryCopyWithImpl<$Res>
    implements $ReceivedDeliveryCopyWith<$Res> {
  _$ReceivedDeliveryCopyWithImpl(this._self, this._then);

  final ReceivedDelivery _self;
  final $Res Function(ReceivedDelivery) _then;

/// Create a copy of ReceivedDelivery
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? deliveryType = null,Object? recipient = null,Object? hostName = null,Object? hostCompany = null,Object? receivedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,recipient: null == recipient ? _self.recipient : recipient // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,receivedAt: null == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [ReceivedDelivery].
extension ReceivedDeliveryPatterns on ReceivedDelivery {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReceivedDelivery value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReceivedDelivery() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReceivedDelivery value)  $default,){
final _that = this;
switch (_that) {
case _ReceivedDelivery():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReceivedDelivery value)?  $default,){
final _that = this;
switch (_that) {
case _ReceivedDelivery() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String deliveryType,  String recipient,  String hostName,  String hostCompany,  DateTime receivedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReceivedDelivery() when $default != null:
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostName,_that.hostCompany,_that.receivedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String deliveryType,  String recipient,  String hostName,  String hostCompany,  DateTime receivedAt)  $default,) {final _that = this;
switch (_that) {
case _ReceivedDelivery():
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostName,_that.hostCompany,_that.receivedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String deliveryType,  String recipient,  String hostName,  String hostCompany,  DateTime receivedAt)?  $default,) {final _that = this;
switch (_that) {
case _ReceivedDelivery() when $default != null:
return $default(_that.id,_that.deliveryType,_that.recipient,_that.hostName,_that.hostCompany,_that.receivedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ReceivedDelivery implements ReceivedDelivery {
  const _ReceivedDelivery({required this.id, required this.deliveryType, required this.recipient, required this.hostName, required this.hostCompany, required this.receivedAt});
  factory _ReceivedDelivery.fromJson(Map<String, dynamic> json) => _$ReceivedDeliveryFromJson(json);

@override final  String id;
@override final  String deliveryType;
@override final  String recipient;
@override final  String hostName;
@override final  String hostCompany;
@override final  DateTime receivedAt;

/// Create a copy of ReceivedDelivery
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReceivedDeliveryCopyWith<_ReceivedDelivery> get copyWith => __$ReceivedDeliveryCopyWithImpl<_ReceivedDelivery>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ReceivedDeliveryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReceivedDelivery&&(identical(other.id, id) || other.id == id)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.recipient, recipient) || other.recipient == recipient)&&(identical(other.hostName, hostName) || other.hostName == hostName)&&(identical(other.hostCompany, hostCompany) || other.hostCompany == hostCompany)&&(identical(other.receivedAt, receivedAt) || other.receivedAt == receivedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,deliveryType,recipient,hostName,hostCompany,receivedAt);

@override
String toString() {
  return 'ReceivedDelivery(id: $id, deliveryType: $deliveryType, recipient: $recipient, hostName: $hostName, hostCompany: $hostCompany, receivedAt: $receivedAt)';
}


}

/// @nodoc
abstract mixin class _$ReceivedDeliveryCopyWith<$Res> implements $ReceivedDeliveryCopyWith<$Res> {
  factory _$ReceivedDeliveryCopyWith(_ReceivedDelivery value, $Res Function(_ReceivedDelivery) _then) = __$ReceivedDeliveryCopyWithImpl;
@override @useResult
$Res call({
 String id, String deliveryType, String recipient, String hostName, String hostCompany, DateTime receivedAt
});




}
/// @nodoc
class __$ReceivedDeliveryCopyWithImpl<$Res>
    implements _$ReceivedDeliveryCopyWith<$Res> {
  __$ReceivedDeliveryCopyWithImpl(this._self, this._then);

  final _ReceivedDelivery _self;
  final $Res Function(_ReceivedDelivery) _then;

/// Create a copy of ReceivedDelivery
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? deliveryType = null,Object? recipient = null,Object? hostName = null,Object? hostCompany = null,Object? receivedAt = null,}) {
  return _then(_ReceivedDelivery(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,recipient: null == recipient ? _self.recipient : recipient // ignore: cast_nullable_to_non_nullable
as String,hostName: null == hostName ? _self.hostName : hostName // ignore: cast_nullable_to_non_nullable
as String,hostCompany: null == hostCompany ? _self.hostCompany : hostCompany // ignore: cast_nullable_to_non_nullable
as String,receivedAt: null == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
