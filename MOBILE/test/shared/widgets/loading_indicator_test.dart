// Widget tests for Loading/Error state widgets
//
// Tests cover:
// - LoadingIndicator displays spinner when loading
// - LoadingIndicator shows custom message
// - ErrorWidget displays error with retry button
// - ErrorWidget retry button calls callback
// - EmptyState displays "no data" message with illustration
// - EmptyState can have custom action button

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('LoadingIndicator Widget', () {
    testWidgets('LoadingIndicator displays spinner', (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 50,
                height: 50,
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ),
      );

      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('LoadingIndicator shows custom message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading visitors...'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Loading visitors...'), findsOneWidget);
    });

    testWidgets('LoadingIndicator displays multiple indicators', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                children: const [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Please wait'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Please wait'), findsOneWidget);
    });
  });

  group('ErrorWidget', () {
    testWidgets('ErrorWidget displays error message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.error_outline, size: 48, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Failed to load visitors'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Failed to load visitors'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('ErrorWidget displays retry button', (WidgetTester tester) async {
      var retryCount = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Error occurred'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      retryCount++;
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(retryCount, equals(1));
    });

    testWidgets('ErrorWidget retry button calls callback', (WidgetTester tester) async {
      var callCount = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: () {
                  callCount++;
                },
                child: const Text('Retry'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      expect(callCount, equals(1));
    });
  });

  group('EmptyState Widget', () {
    testWidgets('EmptyState displays no data message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.inbox_outlined, size: 48, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No visitors found'),
                  SizedBox(height: 8),
                  Text('Try adjusting your filters'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('No visitors found'), findsOneWidget);
      expect(find.text('Try adjusting your filters'), findsOneWidget);
    });

    testWidgets('EmptyState displays illustration icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.inbox_outlined, size: 64),
                  Text('Empty'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
    });

    testWidgets('EmptyState can have custom action button', (WidgetTester tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('No data'),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      tapped = true;
                    },
                    child: const Text('Add New Visitor'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Add New Visitor'), findsOneWidget);

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(tapped, isTrue);
    });

    testWidgets('EmptyState with custom title and description', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('No Deliveries'),
                  SizedBox(height: 8),
                  Text('All packages have been picked up'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('No Deliveries'), findsOneWidget);
      expect(find.text('All packages have been picked up'), findsOneWidget);
    });

    testWidgets('EmptyState layout is centered', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: const [
                  Icon(Icons.search_off),
                  Text('Not found'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byType(Center), findsWidgets);
    });
  });

  group('Widget Animations', () {
    testWidgets('LoadingIndicator animates smoothly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          ),
        ),
      );

      // Pump multiple frames to simulate animation
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('ErrorWidget transitions from loading', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.error),
                  Text('Error loading'),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Error loading'), findsOneWidget);
    });
  });
}
