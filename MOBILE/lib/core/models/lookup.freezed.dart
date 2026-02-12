// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lookup.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$LookupPurpose {

 String get id; String get name;
/// Create a copy of LookupPurpose
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LookupPurposeCopyWith<LookupPurpose> get copyWith => _$LookupPurposeCopyWithImpl<LookupPurpose>(this as LookupPurpose, _$identity);

  /// Serializes this LookupPurpose to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LookupPurpose&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupPurpose(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class $LookupPurposeCopyWith<$Res>  {
  factory $LookupPurposeCopyWith(LookupPurpose value, $Res Function(LookupPurpose) _then) = _$LookupPurposeCopyWithImpl;
@useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class _$LookupPurposeCopyWithImpl<$Res>
    implements $LookupPurposeCopyWith<$Res> {
  _$LookupPurposeCopyWithImpl(this._self, this._then);

  final LookupPurpose _self;
  final $Res Function(LookupPurpose) _then;

/// Create a copy of LookupPurpose
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [LookupPurpose].
extension LookupPurposePatterns on LookupPurpose {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LookupPurpose value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LookupPurpose() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LookupPurpose value)  $default,){
final _that = this;
switch (_that) {
case _LookupPurpose():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LookupPurpose value)?  $default,){
final _that = this;
switch (_that) {
case _LookupPurpose() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LookupPurpose() when $default != null:
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name)  $default,) {final _that = this;
switch (_that) {
case _LookupPurpose():
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name)?  $default,) {final _that = this;
switch (_that) {
case _LookupPurpose() when $default != null:
return $default(_that.id,_that.name);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LookupPurpose implements LookupPurpose {
  const _LookupPurpose({required this.id, required this.name});
  factory _LookupPurpose.fromJson(Map<String, dynamic> json) => _$LookupPurposeFromJson(json);

@override final  String id;
@override final  String name;

/// Create a copy of LookupPurpose
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LookupPurposeCopyWith<_LookupPurpose> get copyWith => __$LookupPurposeCopyWithImpl<_LookupPurpose>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LookupPurposeToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LookupPurpose&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupPurpose(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class _$LookupPurposeCopyWith<$Res> implements $LookupPurposeCopyWith<$Res> {
  factory _$LookupPurposeCopyWith(_LookupPurpose value, $Res Function(_LookupPurpose) _then) = __$LookupPurposeCopyWithImpl;
@override @useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class __$LookupPurposeCopyWithImpl<$Res>
    implements _$LookupPurposeCopyWith<$Res> {
  __$LookupPurposeCopyWithImpl(this._self, this._then);

  final _LookupPurpose _self;
  final $Res Function(_LookupPurpose) _then;

/// Create a copy of LookupPurpose
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,}) {
  return _then(_LookupPurpose(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$LookupDeliveryType {

 String get id; String get name;
/// Create a copy of LookupDeliveryType
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LookupDeliveryTypeCopyWith<LookupDeliveryType> get copyWith => _$LookupDeliveryTypeCopyWithImpl<LookupDeliveryType>(this as LookupDeliveryType, _$identity);

  /// Serializes this LookupDeliveryType to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LookupDeliveryType&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupDeliveryType(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class $LookupDeliveryTypeCopyWith<$Res>  {
  factory $LookupDeliveryTypeCopyWith(LookupDeliveryType value, $Res Function(LookupDeliveryType) _then) = _$LookupDeliveryTypeCopyWithImpl;
@useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class _$LookupDeliveryTypeCopyWithImpl<$Res>
    implements $LookupDeliveryTypeCopyWith<$Res> {
  _$LookupDeliveryTypeCopyWithImpl(this._self, this._then);

  final LookupDeliveryType _self;
  final $Res Function(LookupDeliveryType) _then;

/// Create a copy of LookupDeliveryType
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [LookupDeliveryType].
extension LookupDeliveryTypePatterns on LookupDeliveryType {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LookupDeliveryType value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LookupDeliveryType() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LookupDeliveryType value)  $default,){
final _that = this;
switch (_that) {
case _LookupDeliveryType():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LookupDeliveryType value)?  $default,){
final _that = this;
switch (_that) {
case _LookupDeliveryType() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LookupDeliveryType() when $default != null:
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name)  $default,) {final _that = this;
switch (_that) {
case _LookupDeliveryType():
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name)?  $default,) {final _that = this;
switch (_that) {
case _LookupDeliveryType() when $default != null:
return $default(_that.id,_that.name);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LookupDeliveryType implements LookupDeliveryType {
  const _LookupDeliveryType({required this.id, required this.name});
  factory _LookupDeliveryType.fromJson(Map<String, dynamic> json) => _$LookupDeliveryTypeFromJson(json);

@override final  String id;
@override final  String name;

/// Create a copy of LookupDeliveryType
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LookupDeliveryTypeCopyWith<_LookupDeliveryType> get copyWith => __$LookupDeliveryTypeCopyWithImpl<_LookupDeliveryType>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LookupDeliveryTypeToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LookupDeliveryType&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupDeliveryType(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class _$LookupDeliveryTypeCopyWith<$Res> implements $LookupDeliveryTypeCopyWith<$Res> {
  factory _$LookupDeliveryTypeCopyWith(_LookupDeliveryType value, $Res Function(_LookupDeliveryType) _then) = __$LookupDeliveryTypeCopyWithImpl;
@override @useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class __$LookupDeliveryTypeCopyWithImpl<$Res>
    implements _$LookupDeliveryTypeCopyWith<$Res> {
  __$LookupDeliveryTypeCopyWithImpl(this._self, this._then);

  final _LookupDeliveryType _self;
  final $Res Function(_LookupDeliveryType) _then;

/// Create a copy of LookupDeliveryType
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,}) {
  return _then(_LookupDeliveryType(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$LookupCourier {

 String get id; String get name; String get category;
/// Create a copy of LookupCourier
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LookupCourierCopyWith<LookupCourier> get copyWith => _$LookupCourierCopyWithImpl<LookupCourier>(this as LookupCourier, _$identity);

  /// Serializes this LookupCourier to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LookupCourier&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.category, category) || other.category == category));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,category);

@override
String toString() {
  return 'LookupCourier(id: $id, name: $name, category: $category)';
}


}

/// @nodoc
abstract mixin class $LookupCourierCopyWith<$Res>  {
  factory $LookupCourierCopyWith(LookupCourier value, $Res Function(LookupCourier) _then) = _$LookupCourierCopyWithImpl;
@useResult
$Res call({
 String id, String name, String category
});




}
/// @nodoc
class _$LookupCourierCopyWithImpl<$Res>
    implements $LookupCourierCopyWith<$Res> {
  _$LookupCourierCopyWithImpl(this._self, this._then);

  final LookupCourier _self;
  final $Res Function(LookupCourier) _then;

/// Create a copy of LookupCourier
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? category = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [LookupCourier].
extension LookupCourierPatterns on LookupCourier {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LookupCourier value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LookupCourier() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LookupCourier value)  $default,){
final _that = this;
switch (_that) {
case _LookupCourier():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LookupCourier value)?  $default,){
final _that = this;
switch (_that) {
case _LookupCourier() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String category)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LookupCourier() when $default != null:
return $default(_that.id,_that.name,_that.category);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String category)  $default,) {final _that = this;
switch (_that) {
case _LookupCourier():
return $default(_that.id,_that.name,_that.category);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String category)?  $default,) {final _that = this;
switch (_that) {
case _LookupCourier() when $default != null:
return $default(_that.id,_that.name,_that.category);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LookupCourier implements LookupCourier {
  const _LookupCourier({required this.id, required this.name, required this.category});
  factory _LookupCourier.fromJson(Map<String, dynamic> json) => _$LookupCourierFromJson(json);

@override final  String id;
@override final  String name;
@override final  String category;

/// Create a copy of LookupCourier
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LookupCourierCopyWith<_LookupCourier> get copyWith => __$LookupCourierCopyWithImpl<_LookupCourier>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LookupCourierToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LookupCourier&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.category, category) || other.category == category));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,category);

@override
String toString() {
  return 'LookupCourier(id: $id, name: $name, category: $category)';
}


}

/// @nodoc
abstract mixin class _$LookupCourierCopyWith<$Res> implements $LookupCourierCopyWith<$Res> {
  factory _$LookupCourierCopyWith(_LookupCourier value, $Res Function(_LookupCourier) _then) = __$LookupCourierCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String category
});




}
/// @nodoc
class __$LookupCourierCopyWithImpl<$Res>
    implements _$LookupCourierCopyWith<$Res> {
  __$LookupCourierCopyWithImpl(this._self, this._then);

  final _LookupCourier _self;
  final $Res Function(_LookupCourier) _then;

/// Create a copy of LookupCourier
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? category = null,}) {
  return _then(_LookupCourier(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$LookupLocation {

 String get id; String get name;
/// Create a copy of LookupLocation
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LookupLocationCopyWith<LookupLocation> get copyWith => _$LookupLocationCopyWithImpl<LookupLocation>(this as LookupLocation, _$identity);

  /// Serializes this LookupLocation to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LookupLocation&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupLocation(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class $LookupLocationCopyWith<$Res>  {
  factory $LookupLocationCopyWith(LookupLocation value, $Res Function(LookupLocation) _then) = _$LookupLocationCopyWithImpl;
@useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class _$LookupLocationCopyWithImpl<$Res>
    implements $LookupLocationCopyWith<$Res> {
  _$LookupLocationCopyWithImpl(this._self, this._then);

  final LookupLocation _self;
  final $Res Function(LookupLocation) _then;

/// Create a copy of LookupLocation
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [LookupLocation].
extension LookupLocationPatterns on LookupLocation {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LookupLocation value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LookupLocation() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LookupLocation value)  $default,){
final _that = this;
switch (_that) {
case _LookupLocation():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LookupLocation value)?  $default,){
final _that = this;
switch (_that) {
case _LookupLocation() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LookupLocation() when $default != null:
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name)  $default,) {final _that = this;
switch (_that) {
case _LookupLocation():
return $default(_that.id,_that.name);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name)?  $default,) {final _that = this;
switch (_that) {
case _LookupLocation() when $default != null:
return $default(_that.id,_that.name);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LookupLocation implements LookupLocation {
  const _LookupLocation({required this.id, required this.name});
  factory _LookupLocation.fromJson(Map<String, dynamic> json) => _$LookupLocationFromJson(json);

@override final  String id;
@override final  String name;

/// Create a copy of LookupLocation
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LookupLocationCopyWith<_LookupLocation> get copyWith => __$LookupLocationCopyWithImpl<_LookupLocation>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LookupLocationToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LookupLocation&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name);

@override
String toString() {
  return 'LookupLocation(id: $id, name: $name)';
}


}

/// @nodoc
abstract mixin class _$LookupLocationCopyWith<$Res> implements $LookupLocationCopyWith<$Res> {
  factory _$LookupLocationCopyWith(_LookupLocation value, $Res Function(_LookupLocation) _then) = __$LookupLocationCopyWithImpl;
@override @useResult
$Res call({
 String id, String name
});




}
/// @nodoc
class __$LookupLocationCopyWithImpl<$Res>
    implements _$LookupLocationCopyWith<$Res> {
  __$LookupLocationCopyWithImpl(this._self, this._then);

  final _LookupLocation _self;
  final $Res Function(_LookupLocation) _then;

/// Create a copy of LookupLocation
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,}) {
  return _then(_LookupLocation(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
