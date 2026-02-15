import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/lookup.dart';
import 'core_providers.dart';

final lookupsProvider = FutureProvider((ref) async {
  final dio = ref.watch(dioProvider);
  final repository = _LookupsRepository(dio);
  return repository.getAllLookups();
});

final purposesProvider = FutureProvider<List<LookupPurpose>>((ref) async {
  final lookups = await ref.watch(lookupsProvider.future);
  return lookups.purposes;
});

final deliveryTypesProvider = FutureProvider<List<LookupDeliveryType>>((ref) async {
  final lookups = await ref.watch(lookupsProvider.future);
  return lookups.deliveryTypes;
});

final couriersProvider = FutureProvider<List<LookupCourier>>((ref) async {
  final lookups = await ref.watch(lookupsProvider.future);
  return lookups.couriers;
});

final locationsProvider = FutureProvider<List<LookupLocation>>((ref) async {
  final lookups = await ref.watch(lookupsProvider.future);
  return lookups.locations;
});

/// Filter couriers by category
final couriersByCategoryProvider =
    FutureProvider.family<List<LookupCourier>, String>((ref, category) async {
  final couriers = await ref.watch(couriersProvider.future);
  return couriers.where((c) => c.category == category).toList();
});

class _Lookups {
  final List<LookupPurpose> purposes;
  final List<LookupDeliveryType> deliveryTypes;
  final List<LookupCourier> couriers;
  final List<LookupLocation> locations;

  _Lookups({
    required this.purposes,
    required this.deliveryTypes,
    required this.couriers,
    required this.locations,
  });
}

class _LookupsRepository {
  final Dio dio;

  _LookupsRepository(this.dio);

  Future<_Lookups> getAllLookups() async {
    try {
      final purposesResponse = await dio.get(ApiEndpoints.lookupPurposes);
      final deliveryTypesResponse = await dio.get(ApiEndpoints.lookupDeliveryTypes);
      final couriersResponse = await dio.get(ApiEndpoints.lookupCouriers);
      final locationsResponse = await dio.get(ApiEndpoints.lookupLocations);

      final purposesList = (purposesResponse.data as List)
          .map((e) => LookupPurpose.fromJson(e as Map<String, dynamic>))
          .toList();

      final deliveryTypesList = (deliveryTypesResponse.data as List)
          .map((e) => LookupDeliveryType.fromJson(e as Map<String, dynamic>))
          .toList();

      final couriersList = (couriersResponse.data as List)
          .map((e) => LookupCourier.fromJson(e as Map<String, dynamic>))
          .toList();

      final locationsList = (locationsResponse.data as List)
          .map((e) => LookupLocation.fromJson(e as Map<String, dynamic>))
          .toList();

      return _Lookups(
        purposes: purposesList,
        deliveryTypes: deliveryTypesList,
        couriers: couriersList,
        locations: locationsList,
      );
    } on DioException catch (e) {
      throw e.message ?? 'Failed to load lookups';
    }
  }
}
