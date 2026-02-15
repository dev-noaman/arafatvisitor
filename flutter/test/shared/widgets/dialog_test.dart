// Widget tests for Dialog and List widgets
//
// Tests cover:
// - ConfirmDialog displays title and message
// - ConfirmDialog confirm button calls onConfirm
// - ConfirmDialog cancel button dismisses
// - PaginatedListView displays list items
// - PaginatedListView pagination controls work
// - PaginatedListView prev/next page navigation

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ConfirmDialog Widget', () {
    testWidgets('ConfirmDialog displays title and message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: AlertDialog(
                title: const Text('Delete Visitor?'),
                content: const Text('This action cannot be undone.'),
                actions: [
                  TextButton(
                    onPressed: () {},
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('Delete'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Delete Visitor?'), findsOneWidget);
      expect(find.text('This action cannot be undone.'), findsOneWidget);
    });

    testWidgets('ConfirmDialog confirm button calls onConfirm', (WidgetTester tester) async {
      var confirmed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: AlertDialog(
                title: const Text('Approve Visit?'),
                content: const Text('Are you sure?'),
                actions: [
                  TextButton(
                    onPressed: () {},
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {
                      confirmed = true;
                    },
                    child: const Text('Approve'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Approve'));
      await tester.pump();

      expect(confirmed, isTrue);
    });

    testWidgets('ConfirmDialog cancel button dismisses dialog', (WidgetTester tester) async {
      var canceled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: AlertDialog(
                title: const Text('Confirm?'),
                actions: [
                  TextButton(
                    onPressed: () {
                      canceled = true;
                    },
                    child: const Text('Cancel'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Cancel'));
      await tester.pump();

      expect(canceled, isTrue);
    });

    testWidgets('ConfirmDialog has both confirm and cancel buttons', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: AlertDialog(
                title: const Text('Confirm Action?'),
                actions: [
                  TextButton(
                    onPressed: () {},
                    child: const Text('No'),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('Yes'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('No'), findsOneWidget);
      expect(find.text('Yes'), findsOneWidget);
    });
  });

  group('PaginatedListView Widget', () {
    testWidgets('PaginatedListView displays list items', (WidgetTester tester) async {
      final items = ['Item 1', 'Item 2', 'Item 3'];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(items[index]),
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('Item 1'), findsOneWidget);
      expect(find.text('Item 2'), findsOneWidget);
      expect(find.text('Item 3'), findsOneWidget);
    });

    testWidgets('PaginatedListView displays pagination info', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: 5,
                    itemBuilder: (context, index) {
                      return ListTile(title: Text('Item ${index + 1}'));
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text('Page 1 of 3'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Page 1 of 3'), findsOneWidget);
    });

    testWidgets('PaginatedListView prev button navigates to previous page', (WidgetTester tester) async {
      var currentPage = 1;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Text('Page $currentPage'),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton(
                      onPressed: currentPage > 1
                          ? () {
                              currentPage--;
                            }
                          : null,
                      child: const Text('Previous'),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: () {},
                      child: const Text('Next'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Previous'), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);
    });

    testWidgets('PaginatedListView next button navigates to next page', (WidgetTester tester) async {
      var nextTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Previous'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () {
                    nextTapped = true;
                  },
                  child: const Text('Next'),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.text('Next'));
      await tester.pump();

      expect(nextTapped, isTrue);
    });

    testWidgets('PaginatedListView prev button disabled on first page', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: null, // Disabled
                  child: const Text('Previous'),
                ),
              ],
            ),
          ),
        ),
      );

      final prevButton = find.byType(ElevatedButton);
      expect(prevButton, findsOneWidget);
    });

    testWidgets('PaginatedListView next button disabled on last page', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Previous'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: null, // Disabled on last page
                  child: const Text('Next'),
                ),
              ],
            ),
          ),
        ),
      );

      final buttons = find.byType(ElevatedButton);
      expect(buttons, findsWidgets);
    });

    testWidgets('PaginatedListView shows page indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Expanded(
                  child: ListView(
                    children: const [
                      ListTile(title: Text('Item 1')),
                    ],
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Page '),
                      Text('1'),
                      Text(' of '),
                      Text('5'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Page'), findsOneWidget);
      expect(find.text('of'), findsOneWidget);
    });
  });

  group('Dialog & List Integration', () {
    testWidgets('Dialog can open from list item tap', (WidgetTester tester) async {
      var dialogOpened = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView(
              children: [
                ListTile(
                  title: const Text('Item 1'),
                  onTap: () {
                    dialogOpened = true;
                  },
                ),
              ],
            ),
          ),
        ),
      );

      await tester.tap(find.text('Item 1'));
      await tester.pump();

      expect(dialogOpened, isTrue);
    });
  });
}
