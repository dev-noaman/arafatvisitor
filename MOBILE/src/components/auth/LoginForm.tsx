/**
 * LoginForm Component
 * Email + password form with Zod validation and login button
 */

import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FormInput } from '../common';
import { LoadingButton } from '../common';
import { useUIStore } from '../../store/uiStore';
import { validateEmail, validatePassword } from '../../utils/validation';

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
  const [showPassword, setShowPassword] = useState(false);
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
        icon="mail"
        containerStyle={{ marginBottom: 20 }}
      />
      <FormInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoComplete="password"
        error={errors.password}
        editable={!isLoading}
        icon="lock"
        rightElement={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color={isDarkMode ? '#6B7280' : '#9CA3AF'}
            />
          </TouchableOpacity>
        }
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
