/**
 * ForgotPasswordScreen
 * Enter email to receive a password reset link
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormInput } from '../../components/common/FormInput';
import { LoadingButton } from '../../components/common/LoadingButton';
import { toast } from '../../components/common/Toast';
import { forgotPassword } from '../../services/endpoints/auth';
import { validateEmail } from '../../utils/validation';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

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
      <View className="flex-1 bg-gray-50 dark:bg-dark-bg justify-center items-center px-8">
        <View className="w-20 h-20 rounded-full bg-success-50 dark:bg-success-900/20 items-center justify-center mb-6">
          <MaterialIcons name="mark-email-read" size={40} color="#12B76A" />
        </View>
        <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white mb-3 text-center">
          Check Your Email
        </Text>
        <Text className="text-base font-outfit text-gray-500 dark:text-gray-400 text-center leading-6 mb-8">
          We've sent a password reset link to {email}. Please check your inbox
          and follow the instructions to reset your password.
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={18} color="#465FFF" />
          <Text className="text-brand-500 font-outfit-bold text-base ml-1">Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-dark-bg"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md self-center">
          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#465FFF" />
            <Text className="text-brand-500 font-outfit-bold text-base ml-1">Back to Sign In</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-brand-500/10 rounded-2xl items-center justify-center mb-4">
              <MaterialIcons name="lock-reset" size={36} color="#465FFF" />
            </View>
            <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white mb-2">
              Forgot Password
            </Text>
            <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 leading-5 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
            icon="mail"
          />
          <LoadingButton
            title="Send Reset Link"
            onPress={handleSubmit}
            isLoading={isLoading}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
