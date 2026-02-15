/**
 * Login Screen
 * Login page with email/password form, validation, loading state, error messages
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginForm } from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading, error } = useAuth();
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
    } catch (err) {
      // Error is already handled by useAuth hook
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-8 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm self-center">
            {/* App Branding */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-brand-100 rounded-2xl items-center justify-center mb-6">
                <Text className="text-4xl font-outfit-bold text-brand-600">A</Text>
              </View>

              <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white mb-3 text-center">
                Welcome back
              </Text>
              <Text className="text-base font-outfit text-gray-500 dark:text-gray-400 text-center">
                Sign in to manage visitors
              </Text>
            </View>

            {/* Login Form */}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
              <View className="mt-6 p-4 bg-error-50 dark:bg-error-500/10 border-l-4 border-error-500 rounded-r-xl">
                <Text className="text-error-500 text-sm font-outfit-medium">{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              className="mt-8 items-center"
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-brand-600 font-outfit-medium text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-12 items-center">
              <Text className="text-xs font-outfit text-gray-400 dark:text-gray-600">
                Powered by Arafat VMS
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
