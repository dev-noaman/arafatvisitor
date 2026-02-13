import 'package:freezed_annotation/freezed_annotation.dart';

part 'paginated_response.freezed.dart';
part 'paginated_response.g.dart';

/// Generic paginated response model
@Freezed(genericArgumentFactories: true)
abstract class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const factory PaginatedResponse({
    required List<T> data,
    required int total,
    required int page,
    required int limit,
    required int totalPages,
  }) = _PaginatedResponse;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) =>
      _$PaginatedResponseFromJson<T>(json, fromJsonT);
}
