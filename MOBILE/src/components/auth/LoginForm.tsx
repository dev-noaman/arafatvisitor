/**
 * LoginForm Component
 * Email + password form with Zod validation and login button
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { FormInput } from '../common';
import { LoadingButton } from '../common';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme';
import { validateEmail, validatePassword, validateRequired, hasValidationErrors } from '../../utils/validation';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error || '';
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error || '';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(email, password);
    }
  };

  return (
    <View className="w-full">
      <FormInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        editable={!isLoading}
        containerStyle={{ marginBottom: 20 }}
      />
      <FormInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        error={errors.password}
        editable={!isLoading}
        containerStyle={{ marginBottom: 8 }}
      />
      <LoadingButton
        title="Sign In"
        isLoading={isLoading}
        onPress={handleSubmit}
        className="mt-8"
      />
    </View>
  );
};
