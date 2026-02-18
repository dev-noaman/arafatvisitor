/**
 * Login Screen
 * Matches Stitch design: centered form, MaterialIcons branding, bottom gradient bar
 */

import React from 'react';
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
import { LoginForm } from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
    } catch (err) {
      // Error is already handled by useAuth hook
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md self-center">
            {/* App Branding — per Stitch: icon in primary bg + title */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 bg-brand-500/10 rounded-2xl items-center justify-center mb-4">
                <MaterialIcons name="admin-panel-settings" size={36} color="#465FFF" />
              </View>
              <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white tracking-tight">
                Arafat Visitor
              </Text>
            </View>

            {/* Login heading — per Stitch */}
            <View className="mb-8 items-center">
              <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white mb-2">
                Login
              </Text>
              <Text className="text-base font-outfit text-gray-400 dark:text-gray-500">
                Sign in to manage visitors
              </Text>
            </View>

            {/* Login Form */}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
              <View className="mt-4 p-4 bg-error-50 dark:bg-error-500/10 border-l-4 border-error-500 rounded-r-xl">
                <Text className="text-error-500 text-sm font-outfit-medium">{error}</Text>
              </View>
            )}

            {/* Forgot Password — per Stitch */}
            <TouchableOpacity
              className="mt-6 items-end"
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-brand-500 font-outfit-medium text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom gradient bar — per Stitch design */}
      <View className="h-1 bg-brand-800" />
    </View>
  );
};
