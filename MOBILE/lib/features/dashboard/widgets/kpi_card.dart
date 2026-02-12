import 'package:flutter/material.dart';

import '../../../app/theme.dart';

/// KPI Card widget for displaying dashboard metrics
class KpiCard extends StatelessWidget {
  const KpiCard({
    super.key,
    required this.icon,
    required this.label,
    required this.count,
    this.backgroundColor,
    this.iconColor,
    this.labelColor,
    this.countColor,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final int count;
  final Color? backgroundColor;
  final Color? iconColor;
  final Color? labelColor;
  final Color? countColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveBackgroundColor = backgroundColor ?? AppTheme.primaryColor;
    final effectiveIconColor = iconColor ?? Colors.white;
    final effectiveLabelColor = labelColor ?? AppTheme.textSecondary;
    final effectiveCountColor = countColor ?? Colors.white;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: effectiveBackgroundColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: effectiveBackgroundColor.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: effectiveIconColor, size: 32),
                if (onTap != null)
                  Icon(
                    Icons.chevron_right,
                    color: effectiveIconColor.withOpacity(0.7),
                    size: 20,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            // Count
            Text(
              count.toString(),
              style: theme.textTheme.headlineMedium?.copyWith(
                color: effectiveCountColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            // Label
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: effectiveCountColor.withOpacity(0.9),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pre-configured KPI card for Total Hosts
class TotalHostsCard extends StatelessWidget {
  const TotalHostsCard({super.key, required this.count, this.onTap});

  final int count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return KpiCard(
      icon: Icons.business,
      label: 'Total Hosts',
      count: count,
      backgroundColor: AppTheme.primaryColor,
      onTap: onTap,
    );
  }
}

/// Pre-configured KPI card for Visits Today
class VisitsTodayCard extends StatelessWidget {
  const VisitsTodayCard({super.key, required this.count, this.onTap});

  final int count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return KpiCard(
      icon: Icons.people,
      label: 'Visits Today',
      count: count,
      backgroundColor: AppTheme.secondaryColor,
      onTap: onTap,
    );
  }
}

/// Pre-configured KPI card for Deliveries Today
class DeliveriesTodayCard extends StatelessWidget {
  const DeliveriesTodayCard({super.key, required this.count, this.onTap});

  final int count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return KpiCard(
      icon: Icons.local_shipping,
      label: 'Deliveries Today',
      count: count,
      backgroundColor: AppTheme.accentColor,
      iconColor: Colors.black87,
      countColor: Colors.black87,
      onTap: onTap,
    );
  }
}
