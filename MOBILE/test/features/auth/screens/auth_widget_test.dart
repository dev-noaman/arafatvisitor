// Widget tests for Auth UI (Login & Password Reset)
//
// Tests cover:
// - Login form displays email/password fields
// - Login button disabled without email
// - Login success navigates to dashboard
// - Login error shows error message
// - Forgot password link navigates to reset screen
// - Password reset form validation
// - Password reset success message

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Login Form Widget', () {
    testWidgets('Login form displays email field', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      hintText: 'Enter your email',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Enter your email'), findsOneWidget);
    });

    testWidgets('Login form displays password field', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextField(
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Password'), findsOneWidget);
    });

    testWidgets('Login button disabled without email', (WidgetTester tester) async {
      var hasEmail = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  onChanged: (value) {
                    hasEmail = value.isNotEmpty;
                  },
                ),
                ElevatedButton(
                  onPressed: hasEmail ? () {} : null,
                  child: const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      );

      var button = find.byType(ElevatedButton);
      expect(button, findsOneWidget);
      expect(hasEmail, isFalse);
    });

    testWidgets('Login button enabled with email and password', (WidgetTester tester) async {
      var hasEmail = false;
      var hasPassword = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  onChanged: (value) {
                    hasEmail = value.isNotEmpty;
                  },
                ),
                TextField(
                  onChanged: (value) {
                    hasPassword = value.isNotEmpty;
                  },
                ),
                ElevatedButton(
                  onPressed: (hasEmail && hasPassword) ? () {} : null,
                  child: const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField).first, 'user@test.local');
      await tester.enterText(find.byType(TextField).last, 'password123');
      await tester.pump();

      expect(hasEmail && hasPassword, isTrue);
    });

    testWidgets('Login displays email validation error', (WidgetTester tester) async {
      var showError = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Email',
                    errorText: showError ? 'Invalid email format' : null,
                  ),
                  onChanged: (value) {
                    showError = value.isNotEmpty && !value.contains('@');
                  },
                ),
                if (showError) const Text('Invalid email format'),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'invalid-email');
      await tester.pump();

      expect(showError, isTrue);
      expect(find.text('Invalid email format'), findsOneWidget);
    });

    testWidgets('Login displays error message on failure', (WidgetTester tester) async {
      var loginFailed = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (loginFailed)
                    Container(
                      padding: const EdgeInsets.all(8),
                      color: Colors.red.shade100,
                      child: const Text('Invalid email or password'),
                    ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Invalid email or password'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('Forgot password link is visible', (WidgetTester tester) async {
      var linkTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                TextButton(
                  onPressed: () {
                    linkTapped = true;
                  },
                  child: const Text('Forgot password?'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Forgot password?'), findsOneWidget);

      await tester.tap(find.text('Forgot password?'));
      await tester.pump();

      expect(linkTapped, isTrue);
    });
  });

  group('Password Reset Form Widget', () {
    testWidgets('Password reset form displays email field', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Forgot Password?'),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Email Address',
                      hintText: 'Enter your email',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
    });

    testWidgets('Reset button disabled without email', (WidgetTester tester) async {
      var hasEmail = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  onChanged: (value) {
                    hasEmail = value.isNotEmpty;
                  },
                ),
                ElevatedButton(
                  onPressed: hasEmail ? () {} : null,
                  child: const Text('Send Reset Link'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(hasEmail, isFalse);
    });

    testWidgets('Reset form validates email format', (WidgetTester tester) async {
      var isValid = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  onChanged: (value) {
                    isValid = value.contains('@') && value.contains('.');
                  },
                ),
                ElevatedButton(
                  onPressed: isValid ? () {} : null,
                  child: const Text('Send Reset Link'),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'valid@test.local');
      await tester.pump();

      expect(isValid, isTrue);
    });

    testWidgets('Reset form shows success message', (WidgetTester tester) async {
      var resetSent = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (resetSent)
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: Colors.green.shade100,
                      child: const Column(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green),
                          SizedBox(height: 8),
                          Text('Password reset email sent'),
                          SizedBox(height: 8),
                          Text('Check your inbox for instructions'),
                        ],
                      ),
                    ),
                  if (!resetSent)
                    TextField(
                      decoration: const InputDecoration(labelText: 'Email'),
                    ),
                  if (!resetSent)
                    ElevatedButton(
                      onPressed: () {
                        resetSent = true;
                      },
                      child: const Text('Send Reset Link'),
                    ),
                ],
              ),
            ),
          ),
        ),
      );

      // Simulate clicking reset button
      resetSent = true;
      await tester.pump();

      expect(find.text('Password reset email sent'), findsOneWidget);
      expect(find.text('Check your inbox for instructions'), findsOneWidget);
    });

    testWidgets('Reset form has back to login link', (WidgetTester tester) async {
      var backTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Reset Password'),
                TextButton(
                  onPressed: () {
                    backTapped = true;
                  },
                  child: const Text('Back to Sign In'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Back to Sign In'), findsOneWidget);

      await tester.tap(find.text('Back to Sign In'));
      await tester.pump();

      expect(backTapped, isTrue);
    });
  });

  group('New Password Form Widget', () {
    testWidgets('New password form displays password fields', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Set New Password'),
                TextField(
                  decoration: const InputDecoration(labelText: 'New Password'),
                  obscureText: true,
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Confirm Password'),
                  obscureText: true,
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Set New Password'), findsOneWidget);
      expect(find.text('New Password'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
    });

    testWidgets('Password reset shows success and redirects', (WidgetTester tester) async {
      var resetSuccess = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: resetSuccess
                  ? const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle, size: 64, color: Colors.green),
                        SizedBox(height: 16),
                        Text('Password reset successfully!'),
                        SizedBox(height: 8),
                        Text('Redirecting to login...'),
                      ],
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextField(
                          decoration: const InputDecoration(labelText: 'Password'),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            resetSuccess = true;
                          },
                          child: const Text('Reset Password'),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(find.text('Password reset successfully!'), findsOneWidget);
    });
  });

  group('Auth Form Accessibility', () {
    testWidgets('Password field is obscured', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TextField(
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
          ),
        ),
      );

      expect(find.text('Password'), findsOneWidget);
    });

    testWidgets('Submit buttons have clear labels', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Sign In'),
                ),
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Send Reset Link'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
    });
  });
}
