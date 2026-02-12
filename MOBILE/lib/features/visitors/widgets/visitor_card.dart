import 'package:flutter/material.dart';

import '../../../core/models/visit.dart';
import '../../../core/utils/date_format.dart';
import 'status_badge.dart';

class VisitorCard extends StatelessWidget {
  final Visit visit;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final VoidCallback? onQr;
  final bool showEditButton;
  final bool showDeleteButton;
  final bool showQrButton;

  const VisitorCard({
    super.key,
    required this.visit,
    this.onEdit,
    this.onDelete,
    this.onQr,
    this.showEditButton = false,
    this.showDeleteButton = false,
    this.showQrButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        visit.visitorName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        visit.visitorCompany,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                StatusBadge(status: visit.status),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (visit.host != null) ...[
                        Text(
                          'Host: ${visit.host!.name}',
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                      ],
                      Text(
                        'Date: ${formatDate(visit.expectedDate)}',
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (showQrButton && onQr != null)
                      IconButton(
                        icon: const Icon(Icons.qr_code_2),
                        color: Colors.indigo,
                        iconSize: 20,
                        onPressed: onQr,
                        tooltip: 'QR Code',
                      ),
                    if (showEditButton && onEdit != null)
                      IconButton(
                        icon: const Icon(Icons.edit),
                        color: Colors.blue,
                        iconSize: 20,
                        onPressed: onEdit,
                        tooltip: 'Edit',
                      ),
                    if (showDeleteButton && onDelete != null)
                      IconButton(
                        icon: const Icon(Icons.delete),
                        color: Colors.red,
                        iconSize: 20,
                        onPressed: onDelete,
                        tooltip: 'Delete',
                      ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
