import 'package:flutter/material.dart';

/// QR scan screen
class QrScanScreen extends StatelessWidget {
  const QrScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR Scan')),
      body: const Center(child: Text('QR Scan Screen - Coming Soon')),
    );
  }
}
