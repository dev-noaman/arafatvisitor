import 'package:flutter/material.dart';
import '../models/user.dart';

/// Role utility functions
/// Provides role-based UI helpers
class RoleUtils {
  RoleUtils._();

  /// Check if user has a specific role
  static bool hasRole(UserRole? role, List<UserRole>? userRoles) {
    if (role == null || userRoles == null) return false;
    return userRoles.contains(role);
  }

  /// Check if user has any of given roles
  static bool hasAnyRole(UserRole? role, List<UserRole>? userRoles) {
    if (role == null || userRoles == null) return false;
    return userRoles.any((r) => userRoles.contains(r));
  }

  /// Check if user has all of given roles
  static bool hasAllRoles(List<UserRole>? roles) {
    if (roles == null || roles.isEmpty) return false;
    return roles.every((r) => roles.contains(r));
  }

  /// Get user role display name
  static String getRoleDisplayName(UserRole role) {
    switch (role) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.reception:
        return 'Reception';
      case UserRole.host:
        return 'Host';
      case UserRole.staff:
        return 'Staff';
      default:
        return 'User';
    }
  }

  /// Get role color for UI
  static Color getRoleColor(UserRole role, bool isDarkMode) {
    switch (role) {
      case UserRole.admin:
        return isDarkMode ? Colors.purple.shade200 : Colors.purple.shade400;
      case UserRole.reception:
        return isDarkMode ? Colors.teal.shade200 : Colors.teal.shade400;
      case UserRole.host:
        return isDarkMode ? Colors.orange.shade200 : Colors.orange.shade400;
      case UserRole.staff:
        return isDarkMode ? Colors.green.shade200 : Colors.green.shade400;
      default:
        return isDarkMode ? Colors.grey.shade200 : Colors.grey.shade400;
    }
  }

  /// Check if user can approve visits
  static bool canApprove(UserRole? role) {
    return role == UserRole.admin || role == UserRole.reception;
  }

  /// Check if user can create visitors
  static bool canCreateVisitor(UserRole? role) {
    return role == UserRole.admin ||
        role == UserRole.reception ||
        role == UserRole.host;
  }

  /// Check if user can create deliveries
  static bool canCreateDelivery(UserRole? role) {
    return role == UserRole.admin || role == UserRole.reception;
  }

  /// Check if user can delete
  static bool canDelete(UserRole? role) {
    return role == UserRole.admin;
  }

  /// Check if user is company scoped
  static bool isCompanyScoped(UserRole? role) {
    return role == UserRole.host;
  }
}
