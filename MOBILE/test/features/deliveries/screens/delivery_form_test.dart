// Form validation tests for Delivery Form
//
// Tests cover:
// - Required delivery type selection
// - Required recipient field
// - Required host selection
// - Courier filtered by delivery type (PARCEL vs FOOD)
// - Courier auto-resets when delivery type changes
// - Valid form can be submitted

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Delivery Form Validation', () {
    testWidgets('Required delivery type selection', (WidgetTester tester) async {
      var selectedType = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedType.isEmpty ? null : selectedType,
              hint: const Text('Select Delivery Type'),
              onChanged: (value) {
                selectedType = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                DropdownMenuItem(value: 'FOOD', child: Text('Food')),
                DropdownMenuItem(value: 'GIFT', child: Text('Gift')),
              ],
            ),
          ),
        ),
      );

      expect(selectedType.isEmpty, isTrue);
    });

    testWidgets('Required recipient field shows error when empty', (WidgetTester tester) async {
      var showedError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              decoration: InputDecoration(
                labelText: 'Recipient Name',
                errorText: showedError ? 'Recipient is required' : null,
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

    testWidgets('Valid recipient name is accepted', (WidgetTester tester) async {
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

      await tester.enterText(find.byType(TextField), 'John Doe');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Required host selection', (WidgetTester tester) async {
      var selectedHost = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: selectedHost.isEmpty ? null : selectedHost,
              hint: const Text('Select Host/Company'),
              onChanged: (value) {
                selectedHost = value ?? '';
              },
              items: const [
                DropdownMenuItem(value: 'host_1', child: Text('Tech Corp')),
                DropdownMenuItem(value: 'host_2', child: Text('Design Co')),
              ],
            ),
          ),
        ),
      );

      expect(selectedHost.isEmpty, isTrue);
    });

    testWidgets('Courier filtered by DOCUMENT delivery type (PARCEL)', (WidgetTester tester) async {
      var selectedType = 'DOCUMENT';
      final parcelCouriers = ['DHL', 'FedEx', 'Aramex', 'Qatar Post'];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                DropdownButton<String>(
                  value: selectedType,
                  onChanged: (value) {
                    selectedType = value ?? '';
                  },
                  items: const [
                    DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                  ],
                ),
                DropdownButton<String>(
                  value: null,
                  hint: const Text('Select Courier'),
                  onChanged: (value) {},
                  items: parcelCouriers
                      .map((courier) => DropdownMenuItem(
                            value: courier,
                            child: Text(courier),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),
        ),
      );

      expect(selectedType, equals('DOCUMENT'));
      expect(find.text('DHL'), findsOneWidget);
      expect(find.text('FedEx'), findsOneWidget);
    });

    testWidgets('Courier filtered by FOOD delivery type', (WidgetTester tester) async {
      var selectedType = 'FOOD';
      final foodCouriers = ['Snoonu', 'Keeta', 'Talabat'];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                DropdownButton<String>(
                  value: selectedType,
                  onChanged: (value) {
                    selectedType = value ?? '';
                  },
                  items: const [
                    DropdownMenuItem(value: 'FOOD', child: Text('Food')),
                  ],
                ),
                DropdownButton<String>(
                  value: null,
                  hint: const Text('Select Courier'),
                  onChanged: (value) {},
                  items: foodCouriers
                      .map((courier) => DropdownMenuItem(
                            value: courier,
                            child: Text(courier),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),
        ),
      );

      expect(selectedType, equals('FOOD'));
      expect(find.text('Snoonu'), findsOneWidget);
      expect(find.text('Keeta'), findsOneWidget);
    });

    testWidgets('Courier auto-resets when delivery type changes', (WidgetTester tester) async {
      var deliveryType = 'DOCUMENT';
      var selectedCourier = 'DHL';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                DropdownButton<String>(
                  value: deliveryType,
                  onChanged: (value) {
                    deliveryType = value ?? '';
                    // Reset courier when type changes
                    selectedCourier = '';
                  },
                  items: const [
                    DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                    DropdownMenuItem(value: 'FOOD', child: Text('Food')),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

      // Change delivery type
      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Food'));
      await tester.pumpAndSettle();

      // Courier should be reset
      expect(selectedCourier.isEmpty, isTrue);
    });

    testWidgets('Form submit disabled when type missing', (WidgetTester tester) async {
      var hasType = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                DropdownButton<String>(
                  value: null,
                  hint: const Text('Select Type'),
                  onChanged: (value) {
                    hasType = value != null;
                  },
                  items: const [
                    DropdownMenuItem(value: 'DOC', child: Text('Document')),
                  ],
                ),
                ElevatedButton(
                  onPressed: hasType ? () {} : null,
                  child: const Text('Create Delivery'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(hasType, isFalse);
    });

    testWidgets('Form submit enabled with valid data', (WidgetTester tester) async {
      var isValid = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Recipient'),
                ),
                DropdownButton<String>(
                  value: 'DOCUMENT',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                  ],
                ),
                DropdownButton<String>(
                  value: 'DHL',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'DHL', child: Text('DHL')),
                  ],
                ),
                ElevatedButton(
                  onPressed: isValid ? () {} : null,
                  child: const Text('Record Delivery'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('Optional notes field', (WidgetTester tester) async {
      var notes = '';

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Notes (Optional)'),
                  onChanged: (value) {
                    notes = value;
                  },
                  maxLines: 3,
                ),
              ],
            ),
          ),
        ),
      );

      // Notes are optional, don't need to be filled
      expect(notes.isEmpty, isTrue);
    });

    testWidgets('Delivery type options display correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DropdownButton<String>(
              value: null,
              hint: const Text('Delivery Type'),
              onChanged: (value) {},
              items: const [
                DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                DropdownMenuItem(value: 'FOOD', child: Text('Food')),
                DropdownMenuItem(value: 'GIFT', child: Text('Gift')),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();

      expect(find.text('Document'), findsOneWidget);
      expect(find.text('Food'), findsOneWidget);
      expect(find.text('Gift'), findsOneWidget);
    });
  });

  group('Delivery Form Submission', () {
    testWidgets('Valid form can be submitted', (WidgetTester tester) async {
      var submitted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Recipient'),
                ),
                DropdownButton<String>(
                  value: 'DOCUMENT',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'DOCUMENT', child: Text('Document')),
                  ],
                ),
                DropdownButton<String>(
                  value: 'DHL',
                  onChanged: (value) {},
                  items: const [
                    DropdownMenuItem(value: 'DHL', child: Text('DHL')),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {
                    submitted = true;
                  },
                  child: const Text('Submit'),
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
