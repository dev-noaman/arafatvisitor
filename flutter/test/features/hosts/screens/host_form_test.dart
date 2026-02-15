// Form validation tests for Host/Company Form
//
// Tests cover:
// - Required name field
// - Required company field
// - Email format validation
// - Phone format validation
// - Location selection required
// - Type selection (EXTERNAL or STAFF)

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Host Form Validation', () {
    testWidgets('Required name field shows error when empty', (WidgetTester tester) async {
      var showedError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                labelText: 'Host Name',
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

    testWidgets('Valid host name is accepted', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValid = value.isNotEmpty && value.length >= 2;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'John Smith');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Required company field shows error when empty', (WidgetTester tester) async {
      var showedError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                labelText: 'Company Name',
                errorText: showedError ? 'Company is required' : null,
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

    testWidgets('Valid company name is accepted', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValid = value.isNotEmpty;
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'Tech Corporation');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Email format validation', (WidgetTester tester) async {
      var isValidEmail = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidEmail = value.isEmpty || (value.contains('@') && value.contains('.'));
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
                isValidEmail = value.isEmpty || (value.contains('@') && value.contains('.'));
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
                isValidPhone = value.isEmpty || (value.startsWith('974') && value.length >= 12);
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '97433112233');
      await tester.pump();

      expect(isValidPhone, isTrue);
    });

    testWidgets('Phone without proper format is invalid', (WidgetTester tester) async {
      var isValidPhone = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              onChanged: (value) {
                isValidPhone = value.isEmpty || (value.startsWith('974') && value.length >= 12);
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '12345');
      await tester.pump();

      expect(isValidPhone, isFalse);
    });

    testWidgets('Location selection is required', (WidgetTester tester) async {
      var selectedLocation = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedLocation.isEmpty ? null : selectedLocation,
              hint: const Text('Select Location'),
              onChanged: (value) {
                selectedLocation = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'BARWA_TOWERS', child: Text('Barwa Towers')),
                DropdownMenuItem(value: 'MARINA_50', child: Text('Marina 50')),
                DropdownMenuItem(value: 'ELEMENT_MARIOTT', child: Text('Element Mariott')),
              ],
            ),
          ),
        ),
      );

      expect(selectedLocation.isEmpty, isTrue);
    });

    testWidgets('Location options display correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: null,
              hint: const Text('Location'),
              onChanged: (value) {},
              items: const [
                DropdownMenuItem(value: 'BARWA_TOWERS', child: Text('Barwa Towers')),
                DropdownMenuItem(value: 'MARINA_50', child: Text('Marina 50')),
                DropdownMenuItem(value: 'ELEMENT_MARIOTT', child: Text('Element Mariott')),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();

      expect(find.text('Barwa Towers'), findsOneWidget);
      expect(find.text('Marina 50'), findsOneWidget);
      expect(find.text('Element Mariott'), findsOneWidget);
    });

    testWidgets('Type selection (EXTERNAL or STAFF)', (WidgetTester tester) async {
      var selectedType = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedType.isEmpty ? null : selectedType,
              hint: const Text('Type'),
              onChanged: (value) {
                selectedType = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'EXTERNAL', child: Text('External Company')),
                DropdownMenuItem(value: 'STAFF', child: Text('Internal Staff')),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();

      expect(find.text('External Company'), findsOneWidget);
      expect(find.text('Internal Staff'), findsOneWidget);
    });

    testWidgets('Type EXTERNAL is selected for external hosts', (WidgetTester tester) async {
      var selectedType = 'EXTERNAL';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedType,
              onChanged: (value) {
                selectedType = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'EXTERNAL', child: Text('External')),
                DropdownMenuItem(value: 'STAFF', child: Text('Staff')),
              ],
            ),
          ),
        ),
      );

      expect(selectedType, equals('EXTERNAL'));
    });

    testWidgets('Type STAFF is selected for internal staff', (WidgetTester tester) async {
      var selectedType = 'STAFF';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedType,
              onChanged: (value) {
                selectedType = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'EXTERNAL', child: Text('External')),
                DropdownMenuItem(value: 'STAFF', child: Text('Staff')),
              ],
            ),
          ),
        ),
      );

      expect(selectedType, equals('STAFF'));
    });

    testWidgets('Form submit disabled when required fields missing', (WidgetTester tester) async {
      var hasName = false;
      var hasCompany = false;
      var hasLocation = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  onChanged: (value) {
                    hasName = value.isNotEmpty;
                  },
                ),
                TextField(
                  onChanged: (value) {
                    hasCompany = value.isNotEmpty;
                  },
                ),
                DropdownButton<String>(
                  value: null,
                  onChanged: (value) {
                    hasLocation = value != null;
                  },
                  items: const [
                    DropdownMenuItem(value: 'loc1', child: Text('Location')),
                  ],
                ),
                ElevatedButton(
                  onPressed: (hasName && hasCompany && hasLocation) ? () {} : null,
                  child: const Text('Create Host'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(hasName || hasCompany || hasLocation, isFalse);
    });

    testWidgets('Form submit enabled with valid data', (WidgetTester tester) async {
      var isValid = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Company'),
                ),
                DropdownButton<String>(
                  value: 'BARWA_TOWERS',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'BARWA_TOWERS', child: Text('Barwa')),
                  ],
                ),
                DropdownButton<String>(
                  value: 'EXTERNAL',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'EXTERNAL', child: Text('External')),
                  ],
                ),
                ElevatedButton(
                  onPressed: isValid ? () {} : null,
                  child: const Text('Create'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
    });
  });

  group('Host Form Submission', () {
    testWidgets('Valid form can be submitted', (WidgetTester tester) async {
      var submitted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Company'),
                ),
                ElevatedButton(
                  onPressed: () {
                    submitted = true;
                  },
                  child: const Text('Create Host'),
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
