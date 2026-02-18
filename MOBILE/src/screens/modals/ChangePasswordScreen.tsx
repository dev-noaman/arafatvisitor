/**
 * ChangePasswordScreen
 * Change password form
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useChangePassword } from '../../hooks/useChangePassword';
import { FormInput } from '../../components/common/FormInput';
import { LoadingButton } from '../../components/common/LoadingButton';
import { toast } from '../../components/common/Toast';

export default function ChangePasswordScreen({ navigation }: any) {
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
        className="flex-1 bg-gray-50 dark:bg-dark-bg"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6">
          <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white mb-1">
            Change Password
          </Text>
          <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 mb-6">
            Enter your current password and choose a new one.
          </Text>
        </View>

        <View className="px-6">
          <FormInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            error={errors.currentPassword}
            icon="lock"
          />
          <FormInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password (min 6 chars)"
            secureTextEntry
            error={errors.newPassword}
            icon="lock"
          />
          <FormInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock"
          />
          <View className="mt-4">
            <LoadingButton
              title="Change Password"
              onPress={handleSubmit}
              isLoading={changePasswordMutation.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
