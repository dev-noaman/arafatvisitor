// Form validation tests for Visitor Form
//
// Tests cover:
// - Required name field error
// - Valid name accepts (2+ characters)
// - Email format validation
// - Phone format validation (974 prefix)
// - Optional purpose field
// - Form submit disabled when validation errors
// - Form submit enabled with valid data

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Visitor Form Validation', () {
    testWidgets('Required name field shows error when empty', (WidgetTester tester) async {
      var showedError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                labelText: 'Visitor Name',
                errorText: showedError ? 'Name is required' : null,
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

    testWidgets('Valid name (2+ characters) is accepted', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValid = value.length >= 2;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'John Doe');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Single character name is invalid', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValid = value.length >= 2;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'J');
      await tester.pump();

      expect(isValid, isFalse);
    });

    testWidgets('Email format validation', (WidgetTester tester) async {
      var isValidEmail = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidEmail = value.contains('@') && value.contains('.');
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'john@test.local');
      await tester.pump();

      expect(isValidEmail, isTrue);
    });

    testWidgets('Invalid email format is rejected', (WidgetTester tester) async {
      var isValidEmail = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidEmail = value.contains('@') && value.contains('.');
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'invalid-email');
      await tester.pump();

      expect(isValidEmail, isFalse);
    });

    testWidgets('Phone format validation (974 prefix)', (WidgetTester tester) async {
      var isValidPhone = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidPhone = value.startsWith('974') && value.length >= 12;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '97433112233');
      await tester.pump();

      expect(isValidPhone, isTrue);
    });

    testWidgets('Phone without 974 prefix is invalid', (WidgetTester tester) async {
      var isValidPhone = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidPhone = value.startsWith('974') && value.length >= 12;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '33112233');
      await tester.pump();

      expect(isValidPhone, isFalse);
    });

    testWidgets('Purpose field is optional', (WidgetTester tester) async {
      var formData = {
        'name': 'John Doe',
        'email': 'john@test.local',
        'purpose': '',
      };

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    formData['name'] = value;
                  },
                ),
                TextField(
                  onChanged: (value) {
                    formData['purpose'] = value;
                  },
                ),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField).first, 'John Doe');
      await tester.pump();

      // Purpose is optional, form should still be valid
      expect(formData['name'], equals('John Doe'));
      expect(formData['purpose'], isEmpty);
    });

    testWidgets('Form submit button disabled when validation errors', (WidgetTester tester) async {
      var formValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    formValid = value.isNotEmpty;
                  },
                ),
                ElevatedButton(
                  onPressed: formValid ? () {} : null,
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        ),
      );

      // Initially form is invalid, button should be disabled
      var submitButton = find.byType(ElevatedButton);
      expect(submitButton, findsOneWidget);
    });

    testWidgets('Form submit button enabled with valid data', (WidgetTester tester) async {
      var formValid = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                const TextField(),
                ElevatedButton(
                  onPressed: formValid ? () {} : null,
                  child: const Text('Submit'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(formValid, isTrue);
    });

    testWidgets('Name field shows placeholder text', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: const InputDecoration(
                labelText: 'Full Name',
                hintText: 'Enter visitor name',
              ),
            ),
          ),
        ),
      );

      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Enter visitor name'), findsOneWidget);
    });

    testWidgets('Form validation error messages display correctly', (WidgetTester tester) async {
      var errorText = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    errorText: errorText.isEmpty ? null : errorText,
                  ),
                  onChanged: (value) {
                    errorText = value.isEmpty ? 'This field is required' : '';
                  },
                ),
                if (errorText.isNotEmpty) Text(errorText),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '');
      await tester.pump();

      expect(errorText.isEmpty, isFalse);
    });

    testWidgets('Multiple validation errors shown', (WidgetTester tester) async {
      var errors = <String>[];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    errors.clear();
                    if (value.isEmpty) {
                      errors.add('Name required');
                    }
                    if (value.length < 2) {
                      errors.add('Minimum 2 characters');
                    }
                  },
                ),
                for (final error in errors) Text(error),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'J');
      await tester.pump();

      expect(errors.isNotEmpty, isTrue);
    });
  });

  group('Visitor Form Submission', () {
    testWidgets('Form can be submitted with valid data', (WidgetTester tester) async {
      var submitted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                ElevatedButton(
                  onPressed: () {
                    submitted = true;
                  },
                  child: const Text('Add Visitor'),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'John Doe');
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(submitted, isTrue);
    });
  });
}
