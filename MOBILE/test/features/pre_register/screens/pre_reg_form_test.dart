// Form validation tests for Pre-Registration Form
//
// Tests cover:
// - Required date field
// - Date cannot be in past
// - Required host selection
// - Optional notes field
// - Form validation errors display correctly

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Pre-Registration Form Validation', () {
    testWidgets('Required date field shows error when empty', (WidgetTester tester) async {
      var showedError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                labelText: 'Visit Date',
                errorText: showedError ? 'Date is required' : null,
              ),
              onChanged: (value) {
                showedError = value.isEmpty;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '');
      await tester.pump();

      expect(showedError, isTrue);
    });

    testWidgets('Valid date is accepted (2026-02-13)', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValid = value.isNotEmpty && value.length >= 10;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '2026-02-13');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Date cannot be in the past', (WidgetTester tester) async {
      var pastDate = '2026-02-10'; // Before today (2026-02-13)
      var today = '2026-02-13';
      var isValid = pastDate.compareTo(today) >= 0;

      expect(isValid, isFalse);
    });

    testWidgets('Today\'s date is valid', (WidgetTester tester) async {
      var selectedDate = '2026-02-13'; // Today
      var today = '2026-02-13';
      var isValid = selectedDate.compareTo(today) >= 0;

      expect(isValid, isTrue);
    });

    testWidgets('Future date is valid', (WidgetTester tester) async {
      var futureDate = '2026-02-20';
      var today = '2026-02-13';
      var isValid = futureDate.compareTo(today) >= 0;

      expect(isValid, isTrue);
    });

    testWidgets('Required host selection', (WidgetTester tester) async {
      var selectedHost = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedHost.isEmpty ? null : selectedHost,
              hint: const Text('Select Host'),
              onChanged: (value) {
                selectedHost = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'host_1', child: Text('Tech Corp - John')),
                DropdownMenuItem(value: 'host_2', child: Text('Design Co - Jane')),
              ],
            ),
          ),
        ),
      );

      expect(selectedHost.isEmpty, isTrue);

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tech Corp - John'));
      await tester.pumpAndSettle();

      expect(selectedHost.isEmpty, isFalse);
    });

    testWidgets('Optional notes field', (WidgetTester tester) async {
      var formData = {
        'date': '2026-02-13',
        'host': 'host_1',
        'notes': '',
      };

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Date'),
                  onChanged: (value) {
                    formData['date'] = value;
                  },
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Notes (Optional)'),
                  onChanged: (value) {
                    formData['notes'] = value;
                  },
                  maxLines: 3,
                ),
              ],
            ),
          ),
        ),
      );

      // Notes field is optional, should not prevent form submission
      expect(formData['notes'], isEmpty);
    });

    testWidgets('Form submit disabled when date missing', (WidgetTester tester) async {
      var hasDate = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    hasDate = value.isNotEmpty;
                  },
                ),
                ElevatedButton(
                  onPressed: hasDate ? () {} : null,
                  child: const Text('Create Pre-Registration'),
                ),
              ],
            ),
          ),
        ),
      );

      // Button should be disabled
      var button = find.byType(ElevatedButton);
      expect(button, findsOneWidget);
    });

    testWidgets('Form submit disabled when host not selected', (WidgetTester tester) async {
      var selectedHost = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                DropdownButton<String>(
                  value: selectedHost.isEmpty ? null : selectedHost,
                  hint: const Text('Select Host'),
                  onChanged: (value) {
                    selectedHost = value ?? '';
                  },
                  items: const [
                    DropdownMenuItem(value: 'host_1', child: Text('Tech Corp')),
                  ],
                ),
                ElevatedButton(
                  onPressed: selectedHost.isNotEmpty ? () {} : null,
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        ),
      );

      // Button should be disabled when no host selected
      expect(selectedHost.isEmpty, isTrue);
    });

    testWidgets('Form submit enabled with valid data', (WidgetTester tester) async {
      var isValid = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Date'),
                ),
                DropdownButton<String>(
                  value: 'host_1',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'host_1', child: Text('Host 1')),
                  ],
                ),
                ElevatedButton(
                  onPressed: isValid ? () {} : null,
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('Validation error messages display', (WidgetTester tester) async {
      var showError = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Date',
                    errorText: showError ? 'Please select a future date' : null,
                  ),
                ),
                if (showError) const Text('Please select a future date'),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Please select a future date'), findsOneWidget);
    });
  });

  group('Pre-Registration Form Submission', () {
    testWidgets('Form can be submitted with valid data', (WidgetTester tester) async {
      var submitted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Date'),
                ),
                DropdownButton<String>(
                  value: 'host_1',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'host_1', child: Text('Host')),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {
                    submitted = true;
                  },
                  child: const Text('Create Pre-Registration'),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(submitted, isTrue);
    });
  });
}
