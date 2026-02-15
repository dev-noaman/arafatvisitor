import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme.dart';
import '../../../core/models/user.dart';
import '../../../core/utils/date_format.dart';
import '../../../core/utils/role_utils.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/dashboard.dart';
import '../providers/dashboard_provider.dart';

/// Current Visitors List widget
class CurrentVisitorsList extends ConsumerWidget {
  const CurrentVisitorsList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final visitorsAsync = ref.watch(currentVisitorsProvider);
    final authStateAsync = ref.watch(authStateProvider);
    final userRole = authStateAsync.value?.user?.role;

    return visitorsAsync.when(
      data: (visitors) {
        if (visitors == null || visitors.isEmpty) {
          return const _EmptyState();
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: visitors.length,
          separatorBuilder: (context, index) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final visitor = visitors[index];
            final canUserCheckout = RoleUtils.canApprove(userRole);

            return _CurrentVisitorCard(
              visitor: visitor,
              canCheckout: canUserCheckout,
              onCheckout: () => _handleCheckout(context, ref, visitor.id),
            );
          },
        );
      },
      loading: () => const _LoadingState(),
      error: (error, stack) => _ErrorState(
        error: error.toString(),
        onRetry: () => ref.invalidate(currentVisitorsProvider),
      ),
    );
  }

  Future<void> _handleCheckout(
    BuildContext context,
    WidgetRef ref,
    String visitId,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Check Out Visitor'),
        content: const Text('Are you sure you want to check out this visitor?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.primaryColor),
            child: const Text('Check Out'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref
            .read(dashboardNotifierProvider.notifier)
            .checkOutVisitor(int.parse(visitId));
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Visitor checked out successfully'),
              backgroundColor: AppTheme.successColor,
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to check out visitor: ${e.toString()}'),
              backgroundColor: AppTheme.errorColor,
            ),
          );
        }
      }
    }
  }
}

class _CurrentVisitorCard extends StatelessWidget {
  const _CurrentVisitorCard({
    super.key,
    required this.visitor,
    required this.canCheckout,
    required this.onCheckout,
  });

  final CurrentVisitor visitor;
  final bool canCheckout;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Visitor name and company
            Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: AppTheme.statusCheckedIn,
                  child: Icon(Icons.person, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        visitor.visitorName,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        visitor.visitorCompany,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Host and check-in time
            Row(
              children: [
                Icon(Icons.business, size: 16, color: AppTheme.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${visitor.hostName} • ${visitor.hostCompany}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: AppTheme.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  'Checked in: ${DateUtils.formatTime(visitor.checkInAt)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                const Spacer(),
                if (visitor.sessionId != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.infoColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.qr_code,
                          size: 14,
                          color: AppTheme.infoColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'ID: ${visitor.sessionId}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppTheme.infoColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            // Checkout button
            if (canCheckout)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onCheckout,
                  icon: const Icon(Icons.logout, size: 18),
                  label: const Text('Check Out'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.warningColor,
                    side: const BorderSide(color: AppTheme.warningColor),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(Icons.people_outline, size: 48, color: AppTheme.textSecondary),
          const SizedBox(height: 16),
          Text(
            'No Current Visitors',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'No visitors are currently checked in',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error, required this.onRetry});

  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(Icons.error_outline, size: 48, color: AppTheme.errorColor),
          const SizedBox(height: 16),
          Text(
            'Failed to load current visitors',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
