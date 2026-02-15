import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/visitors/screens/visitors_list_screen.dart';
import '../features/pre_register/screens/pre_register_list_screen.dart';
import '../features/deliveries/screens/deliveries_list_screen.dart';
import '../features/qr_scan/screens/qr_scan_screen.dart';
import '../features/hosts/screens/hosts_list_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/more/screens/more_screen.dart';
import '../shared/widgets/app_scaffold.dart';

/// App router configuration using GoRouter
/// Handles navigation for the entire app
class AppRouter {
  AppRouter._();

  // Route paths
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String dashboard = '/dashboard';
  static const String visitors = '/visitors';
  static const String preRegister = '/pre-register';
  static const String deliveries = '/deliveries';
  static const String qrScan = '/qr-scan';
  static const String hosts = '/hosts';
  static const String profile = '/profile';
  static const String more = '/more';

  /// Router configuration
  static final GoRouter router = GoRouter(
    initialLocation: login,
    debugLogDiagnostics: true,
    routes: [
      // Auth routes
      GoRoute(
        path: login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // Main app routes with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppScaffold(
            currentIndex: navigationShell.currentIndex,
            navigationShell: navigationShell,
            child: navigationShell,
          );
        },
        branches: [
          // Branch 0: Dashboard
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: dashboard,
                name: 'dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),

          // Branch 1: Visitors
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: visitors,
                name: 'visitors',
                builder: (context, state) => const VisitorsListScreen(),
              ),
            ],
          ),

          // Branch 2: Pre-Register
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: preRegister,
                name: 'preRegister',
                builder: (context, state) => const PreRegisterListScreen(),
              ),
            ],
          ),

          // Branch 3: Deliveries
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: deliveries,
                name: 'deliveries',
                builder: (context, state) => const DeliveriesListScreen(),
              ),
            ],
          ),

          // Branch 4: More (contains QR Scan, Hosts, Profile)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: qrScan,
                name: 'qrScan',
                builder: (context, state) => const QrScanScreen(),
              ),
              GoRoute(
                path: hosts,
                name: 'hosts',
                builder: (context, state) => const HostsListScreen(),
              ),
              GoRoute(
                path: profile,
                name: 'profile',
                builder: (context, state) => const ProfileScreen(),
              ),
              GoRoute(
                path: more,
                name: 'more',
                builder: (context, state) => const MoreScreen(),
              ),
            ],
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => _errorScreen(context, state.error),
  );

  /// Error screen for invalid routes
  static Widget _errorScreen(BuildContext context, Object? error) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'An error occurred: ${error?.toString() ?? "Unknown error"}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go(login),
              child: const Text('Go to Login'),
            ),
          ],
        ),
      ),
    );
  }
}
