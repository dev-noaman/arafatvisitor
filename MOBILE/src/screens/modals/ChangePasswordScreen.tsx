/**
 * ChangePasswordScreen
 * Change password form
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useChangePassword } from '../../hooks/useChangePassword';
import { FormInput } from '../../components/common/FormInput';
import { LoadingButton } from '../../components/common/LoadingButton';
import { toast } from '../../components/common/Toast';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function ChangePasswordScreen({ navigation }: any) {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.show('Password changed successfully', 'success');
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.message || error?.response?.data?.message || 'Failed to change password';
      toast.show(msg, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Change Password</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Enter your current password and choose a new one.
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            error={errors.currentPassword}
          />
          <FormInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password (min 6 chars)"
            secureTextEntry
            error={errors.newPassword}
          />
          <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            error={errors.confirmPassword}
          />
          <LoadingButton
            title="Change Password"
            onPress={handleSubmit}
            isLoading={changePasswordMutation.isPending}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
  },
  form: { padding: spacing.lg },
  submitButton: { marginTop: spacing.lg },
});
