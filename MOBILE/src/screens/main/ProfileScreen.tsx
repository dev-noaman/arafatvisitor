/**
 * ProfileScreen
 * User profile, dark mode toggle, change password, logout
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrator',
      RECEPTION: 'Reception',
      HOST: 'Host',
      STAFF: 'Staff',
    };
    return labels[role] || role;
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-bg">
      <ScrollView contentContainerClassName="pb-10">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-gray-800">
          <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="items-center p-6 m-4 bg-white dark:bg-dark-elem rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <View className="w-24 h-24 rounded-full bg-brand-500 justify-center items-center mb-4 shadow-lg shadow-brand-200 dark:shadow-none">
            <Text className="text-4xl font-outfit-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white mb-1 text-center">
            {user?.name || 'Unknown'}
          </Text>
          <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 mb-3">
            {user?.email || ''}
          </Text>
          <View className="bg-brand-50 dark:bg-brand-900/20 px-4 py-1.5 rounded-full">
            <Text className="text-xs font-outfit-bold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
              {getRoleLabel(user?.role || '')}
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View className="px-4 mb-2">
          <Text className="text-sm font-outfit-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-2">
            Preferences
          </Text>
          <View className="bg-white dark:bg-dark-elem rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <View className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🌙</Text>
                <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d1d5db', true: '#818cf8' }}
                thumbColor={isDarkMode ? '#465FFF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-outfit-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-2">
            Account
          </Text>
          <View className="bg-white dark:bg-dark-elem rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <TouchableOpacity
              className="flex-row justify-between items-center p-4 active:bg-gray-50 dark:active:bg-gray-800"
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🔒</Text>
                <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">Change Password</Text>
              </View>
              <Text className="text-gray-400 dark:text-gray-500 text-lg">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4">
          <TouchableOpacity
            className="flex-row justify-center items-center bg-error-50 dark:bg-error-900/20 p-4 rounded-xl active:bg-error-100 dark:active:bg-error-900/40"
            onPress={handleLogout}
          >
            <Text className="text-lg mr-2">🚪</Text>
            <Text className="text-base font-outfit-bold text-error-600 dark:text-error-400">Logout</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs font-outfit text-gray-400 dark:text-gray-500 mt-8 mb-4">
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
