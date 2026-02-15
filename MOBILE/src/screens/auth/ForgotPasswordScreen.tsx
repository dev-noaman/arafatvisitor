/**
 * ForgotPasswordScreen
 * Enter email to receive a password reset link
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormInput } from '../../components/common/FormInput';
import { LoadingButton } from '../../components/common/LoadingButton';
import { toast } from '../../components/common/Toast';
import { forgotPassword } from '../../services/endpoints/auth';
import { useUIStore } from '../../store/uiStore';
import { validateEmail } from '../../utils/validation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = validateEmail(email);
    if (!result.isValid) {
      setError(result.error!);
      return;
    }
    setError('');

    try {
      setIsLoading(true);
      await forgotPassword(email);
      setSent(true);
      toast.show('Reset link sent! Check your email.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to send reset link';
      toast.show(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.sentContainer}>
          <Text style={styles.sentIcon}>📧</Text>
          <Text style={[styles.sentTitle, { color: theme.text.primary }]}>
            Check Your Email
          </Text>
          <Text style={[styles.sentMessage, { color: theme.text.secondary }]}>
            We've sent a password reset link to {email}. Please check your inbox
            and follow the instructions to reset your password.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backLink, { color: colors.brand[500] }]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.brand[500] }]}>
            ‹ Back to Sign In
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Forgot Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
          />
          <LoadingButton
            title="Send Reset Link"
            onPress={handleSubmit}
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  backText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  form: {},
  submitButton: {
    marginTop: spacing[3],
  },
  sentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  sentIcon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  sentTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  sentMessage: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  backLink: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
