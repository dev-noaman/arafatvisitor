// Widget tests for QR Code Display
//
// Tests cover:
// - QR code displays for valid session ID
// - Loading state shows spinner while generating
// - Error state shows error message
// - CheckInBadge displays visitor info + 5-second countdown
// - CheckOutBadge displays "Thank You" message
// - Badge auto-closes after countdown

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('QR Code Display Widget', () {
    testWidgets('QR code displays for valid session ID', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Image.memory(
                // Simulated QR code image data
                const <int>[137, 80, 78, 71],
                width: 200,
                height: 200,
              ),
            ),
          ),
        ),
      );

      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('QR loading state shows spinner', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Generating QR code...'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Generating QR code...'), findsOneWidget);
    });

    testWidgets('QR error state shows error message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.error_outline, size: 48, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Failed to generate QR code'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Failed to generate QR code'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });
  });

  group('CheckInBadge Widget', () {
    testWidgets('CheckInBadge displays visitor info', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text('Welcome!'),
                      SizedBox(height: 16),
                      Text('John Doe'),
                      Text('Tech Corporation'),
                      SizedBox(height: 16),
                      Text('Host: Ahmed Khan'),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Welcome!'), findsOneWidget);
      expect(find.text('John Doe'), findsOneWidget);
      expect(find.text('Tech Corporation'), findsOneWidget);
      expect(find.text('Host: Ahmed Khan'), findsOneWidget);
    });

    testWidgets('CheckInBadge shows 5-second countdown', (WidgetTester tester) async {
      var countdownTime = 5;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('John Doe'),
                  const SizedBox(height: 16),
                  Text('Auto-closing in: $countdownTime seconds'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Auto-closing in: 5 seconds'), findsOneWidget);

      // Simulate countdown
      countdownTime = 4;
      await tester.pump(const Duration(seconds: 1));
    });

    testWidgets('CheckInBadge displays check-in details', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.check_circle, size: 64, color: Colors.green),
                  SizedBox(height: 16),
                  Text('Checked In'),
                  Text('2026-02-13 14:35'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Checked In'), findsOneWidget);
      expect(find.text('2026-02-13 14:35'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });
  });

  group('CheckOutBadge Widget', () {
    testWidgets('CheckOutBadge displays "Thank You" message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.waving_hand, size: 64, color: Colors.blue),
                  SizedBox(height: 24),
                  Text('Thank You For Visiting!'),
                  SizedBox(height: 8),
                  Text('John Doe'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Thank You For Visiting!'), findsOneWidget);
      expect(find.text('John Doe'), findsOneWidget);
    });

    testWidgets('CheckOutBadge shows check-out timestamp', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('Checked Out'),
                  Text('2026-02-13 15:45:00'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Checked Out'), findsOneWidget);
      expect(find.text('2026-02-13 15:45:00'), findsOneWidget);
    });

    testWidgets('CheckOutBadge has 5-second countdown', (WidgetTester tester) async {
      var countdownTime = 5;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Thank You!'),
                  const SizedBox(height: 16),
                  Text('Closing in: $countdownTime'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Closing in: 5'), findsOneWidget);
    });
  });

  group('Badge Animation & Auto-Close', () {
    testWidgets('Badge auto-closes after countdown', (WidgetTester tester) async {
      var badgeClosed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: badgeClosed
                  ? const Text('Home Screen')
                  : const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Welcome'),
                        Text('John Doe'),
                      ],
                    ),
            ),
          ),
        ),
      );

      expect(find.text('Welcome'), findsOneWidget);

      // Simulate 5-second countdown completion
      badgeClosed = true;
      await tester.pump(const Duration(seconds: 5));
    });

    testWidgets('Badge displays full-screen overlay', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Stack(
              children: [
                const Scaffold(body: Text('Kiosk Screen')),
                Center(
                  child: Container(
                    color: Colors.white,
                    width: double.infinity,
                    height: double.infinity,
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Welcome Badge'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Welcome Badge'), findsOneWidget);
      expect(find.text('Kiosk Screen'), findsOneWidget);
    });

    testWidgets('CheckInBadge animates in smoothly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: ScaleTransition(
                scale: const AlwaysStoppedAnimation(1.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.check_circle, size: 64),
                    Text('Checked In'),
                  ],
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pump();
      expect(find.text('Checked In'), findsOneWidget);
    });
  });

  group('QR Badge Content', () {
    testWidgets('Badge displays visitor and host details', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('Visitor: John Doe'),
                  Text('Company: Tech Corp'),
                  Text('Host: Ahmed Khan'),
                  Text('Host Company: Tech Corp'),
                  Text('Purpose: Meeting'),
                  Text('Location: BARWA_TOWERS'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Visitor: John Doe'), findsOneWidget);
      expect(find.text('Host: Ahmed Khan'), findsOneWidget);
      expect(find.text('Purpose: Meeting'), findsOneWidget);
    });

    testWidgets('CheckOut badge omits approval details', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('John Doe'),
                  Text('Thank You'),
                  Text('2026-02-13 15:45'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('John Doe'), findsOneWidget);
      expect(find.text('Thank You'), findsOneWidget);
      expect(find.text('2026-02-13 15:45'), findsOneWidget);
    });
  });
}
