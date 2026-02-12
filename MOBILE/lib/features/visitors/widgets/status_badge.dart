import 'package:flutter/material.dart';

import '../../../core/models/visit.dart';

class StatusBadge extends StatelessWidget {
  final VisitStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (backgroundColor, textColor, label) = switch (status) {
      VisitStatus.preRegistered => (Colors.grey[200], Colors.grey[700], 'PRE-REG'),
      VisitStatus.pendingApproval => (Colors.amber[100], Colors.amber[800], 'PENDING'),
      VisitStatus.rejected => (Colors.red[100], Colors.red[700], 'REJECTED'),
      VisitStatus.approved => (Colors.green[100], Colors.green[700], 'APPROVED'),
      VisitStatus.checkedIn => (Colors.blue[100], Colors.blue[700], 'CHECKED IN'),
      VisitStatus.checkedOut => (Colors.grey[300], Colors.grey[700], 'CHECKED OUT'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
