// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Dashboard provider

@ProviderFor(DashboardNotifier)
final dashboardProvider = DashboardNotifierProvider._();

/// Dashboard provider
final class DashboardNotifierProvider
    extends $NotifierProvider<DashboardNotifier, DashboardData> {
  /// Dashboard provider
  DashboardNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dashboardProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dashboardNotifierHash();

  @$internal
  @override
  DashboardNotifier create() => DashboardNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DashboardData value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DashboardData>(value),
    );
  }
}

String _$dashboardNotifierHash() => r'97a49b73f3d245f6e1a2fc28a8d7b6ea161dc21f';

/// Dashboard provider

abstract class _$DashboardNotifier extends $Notifier<DashboardData> {
  DashboardData build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<DashboardData, DashboardData>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<DashboardData, DashboardData>,
              DashboardData,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

/// Dashboard data provider (convenience)

@ProviderFor(dashboardKpis)
final dashboardKpisProvider = DashboardKpisProvider._();

/// Dashboard data provider (convenience)

final class DashboardKpisProvider
    extends $FunctionalProvider<DashboardKpis?, DashboardKpis?, DashboardKpis?>
    with $Provider<DashboardKpis?> {
  /// Dashboard data provider (convenience)
  DashboardKpisProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dashboardKpisProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dashboardKpisHash();

  @$internal
  @override
  $ProviderElement<DashboardKpis?> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  DashboardKpis? create(Ref ref) {
    return dashboardKpis(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DashboardKpis? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DashboardKpis?>(value),
    );
  }
}

String _$dashboardKpisHash() => r'c02c4978bc617329a27edbc24af221b48f7523d7';

/// Pending approvals provider (convenience)

@ProviderFor(pendingApprovals)
final pendingApprovalsProvider = PendingApprovalsProvider._();

/// Pending approvals provider (convenience)

final class PendingApprovalsProvider
    extends
        $FunctionalProvider<
          List<PendingApproval>?,
          List<PendingApproval>?,
          List<PendingApproval>?
        >
    with $Provider<List<PendingApproval>?> {
  /// Pending approvals provider (convenience)
  PendingApprovalsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'pendingApprovalsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$pendingApprovalsHash();

  @$internal
  @override
  $ProviderElement<List<PendingApproval>?> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  List<PendingApproval>? create(Ref ref) {
    return pendingApprovals(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<PendingApproval>? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<PendingApproval>?>(value),
    );
  }
}

String _$pendingApprovalsHash() => r'4a61471e34fc7c70dc17e66bf4cfe70079e78238';

/// Current visitors provider (convenience)

@ProviderFor(currentVisitors)
final currentVisitorsProvider = CurrentVisitorsProvider._();

/// Current visitors provider (convenience)

final class CurrentVisitorsProvider
    extends
        $FunctionalProvider<
          List<CurrentVisitor>?,
          List<CurrentVisitor>?,
          List<CurrentVisitor>?
        >
    with $Provider<List<CurrentVisitor>?> {
  /// Current visitors provider (convenience)
  CurrentVisitorsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'currentVisitorsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$currentVisitorsHash();

  @$internal
  @override
  $ProviderElement<List<CurrentVisitor>?> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  List<CurrentVisitor>? create(Ref ref) {
    return currentVisitors(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<CurrentVisitor>? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<CurrentVisitor>?>(value),
    );
  }
}

String _$currentVisitorsHash() => r'8e7594d2015f88d2aec07fc59cac15d114dc04a0';

/// Received deliveries provider (convenience)

@ProviderFor(receivedDeliveries)
final receivedDeliveriesProvider = ReceivedDeliveriesProvider._();

/// Received deliveries provider (convenience)

final class ReceivedDeliveriesProvider
    extends
        $FunctionalProvider<
          List<ReceivedDelivery>?,
          List<ReceivedDelivery>?,
          List<ReceivedDelivery>?
        >
    with $Provider<List<ReceivedDelivery>?> {
  /// Received deliveries provider (convenience)
  ReceivedDeliveriesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'receivedDeliveriesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$receivedDeliveriesHash();

  @$internal
  @override
  $ProviderElement<List<ReceivedDelivery>?> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  List<ReceivedDelivery>? create(Ref ref) {
    return receivedDeliveries(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(List<ReceivedDelivery>? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<List<ReceivedDelivery>?>(value),
    );
  }
}

String _$receivedDeliveriesHash() =>
    r'fa76e2bd3ece025dcff4cfbfb9aa1b7d8fc943a8';

/// Charts data provider (convenience)

@ProviderFor(chartsData)
final chartsDataProvider = ChartsDataProvider._();

/// Charts data provider (convenience)

final class ChartsDataProvider
    extends
        $FunctionalProvider<
          Map<String, dynamic>?,
          Map<String, dynamic>?,
          Map<String, dynamic>?
        >
    with $Provider<Map<String, dynamic>?> {
  /// Charts data provider (convenience)
  ChartsDataProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'chartsDataProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$chartsDataHash();

  @$internal
  @override
  $ProviderElement<Map<String, dynamic>?> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  Map<String, dynamic>? create(Ref ref) {
    return chartsData(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Map<String, dynamic>? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Map<String, dynamic>?>(value),
    );
  }
}

String _$chartsDataHash() => r'1d05fe50c2dee7ef2ff97d7627cbfffb7dbfb47f';
