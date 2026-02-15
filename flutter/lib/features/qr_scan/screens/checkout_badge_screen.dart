import 'package:flutter/material.dart';

import '../../../core/models/visit.dart';
import '../../../core/utils/date_format.dart';

class CheckoutBadgeScreen extends StatefulWidget {
  final Visit visit;
  final VoidCallback onComplete;

  const CheckoutBadgeScreen({
    super.key,
    required this.visit,
    required this.onComplete,
  });

  @override
  State<CheckoutBadgeScreen> createState() => _CheckoutBadgeScreenState();
}

class _CheckoutBadgeScreenState extends State<CheckoutBadgeScreen> {
  late int _countdown;

  @override
  void initState() {
    super.initState();
    _countdown = 5;
    _startCountdown();
  }

  void _startCountdown() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _countdown--);
        if (_countdown > 0) {
          _startCountdown();
        } else {
          widget.onComplete();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF059669), Color(0xFF10B981)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.waving_hand, size: 80, color: Colors.white),
                const SizedBox(height: 24),
                const Text(
                  'Thank You For Visiting!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    textDirection: TextDirection.ltr,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailRow('Visitor:', widget.visit.visitorName),
                      _buildDetailRow('Company:', widget.visit.visitorCompany),
                      if (widget.visit.host != null) ...[
                        _buildDetailRow('Host:', widget.visit.host!.name),
                        _buildDetailRow(
                          'Host Company:',
                          widget.visit.host!.company,
                        ),
                      ],
                      _buildDetailRow(
                        'Check-out Time:',
                        formatDateTime(widget.visit.checkOutAt ?? DateTime.now()),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.2),
                  ),
                  child: Center(
                    child: Text(
                      _countdown.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF059669),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
