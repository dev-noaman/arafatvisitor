/// API endpoint constants for Arafat VMS backend
class ApiEndpoints {
  // Base URL - will be configured from environment or runtime
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  // Auth endpoints
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Dashboard endpoints
  static const String dashboardKpis = '/dashboard/kpis';
  static const String pendingApprovals = '/dashboard/pending-approvals';
  static const String currentVisitors = '/dashboard/current-visitors';
  static const String receivedDeliveries = '/dashboard/received-deliveries';

  // Visit actions
  static String approveVisit(int visitId) => '/visits/$visitId/approve';
  static String rejectVisit(int visitId) => '/visits/$visitId/reject';
  static String checkInVisit(int visitId) => '/visits/$visitId/check-in';
  static String checkOutVisit(int visitId) => '/visits/$visitId/check-out';

  // Visitors endpoints
  static const String visitors = '/visitors';
  static String visitor(int id) => '/visitors/$id';

  // Pre-registration endpoints
  static const String preRegistrations = '/pre-registrations';
  static String preRegistration(int id) => '/pre-registrations/$id';

  // Deliveries endpoints
  static const String deliveries = '/deliveries';
  static String delivery(int id) => '/deliveries/$id';
  static String receiveDelivery(int id) => '/deliveries/$id/receive';

  // Hosts endpoints
  static const String hosts = '/hosts';
  static String host(int id) => '/hosts/$id';

  // Users endpoints
  static const String users = '/users';
  static String user(int id) => '/users/$id';
  static const String changePassword = '/users/change-password';
  static const String updateProfile = '/users/profile';

  // Lookups endpoints
  static const String purposes = '/lookups/purposes';
  static const String deliveryTypes = '/lookups/delivery-types';
  static const String couriers = '/lookups/couriers';
  static const String locations = '/lookups/locations';

  // QR Code endpoints
  static String generateQrCode(int visitId) => '/qr/$visitId/generate';
  static const String validateQrCode = '/qr/validate';

  /// Get full URL for an endpoint
  static String fullUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }
}
