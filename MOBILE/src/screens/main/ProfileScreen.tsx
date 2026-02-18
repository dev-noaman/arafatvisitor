/**
 * ProfileScreen
 * Matches Stitch design: horizontal profile card, grouped settings sections, logout button
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
      {/* Header bar — per Stitch */}
      <View className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 py-3 items-center">
        <Text className="text-lg font-outfit-semibold text-gray-900 dark:text-white">Profile</Text>
      </View>

      <ScrollView contentContainerClassName="px-4 py-6 pb-24">
        {/* Profile Card — per Stitch: horizontal layout */}
        <View className="bg-white dark:bg-dark-card rounded-xl p-5 mb-6 flex-row items-center gap-4 border border-gray-200 dark:border-gray-800"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
        >
          <View className="w-16 h-16 rounded-full bg-brand-200 dark:bg-brand-900/30 items-center justify-center border-2 border-white"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
          >
            <Text className="text-brand-500 text-xl font-outfit-bold">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white mb-1">
              {user?.name || 'Unknown'}
            </Text>
            <Text className="text-sm font-outfit text-gray-400 dark:text-gray-500 mb-2">
              {user?.email || ''}
            </Text>
            <View className="bg-brand-500/10 self-start px-2.5 py-0.5 rounded-full">
              <Text className="text-xs font-outfit-medium text-brand-500">{getRoleLabel(user?.role || '')}</Text>
            </View>
          </View>
        </View>

        {/* Settings Groups — per Stitch: white card with sections */}
        <View className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
        >
          {/* Appearance */}
          <View className="p-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xs font-outfit-semibold text-gray-400 uppercase tracking-wider mb-3">Appearance</Text>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                  <MaterialIcons name="dark-mode" size={20} color={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                </View>
                <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#465FFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Account */}
          <View className="p-4">
            <Text className="text-xs font-outfit-semibold text-gray-400 uppercase tracking-wider mb-3">Account</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                  <MaterialIcons name="lock" size={20} color={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                </View>
                <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-2 mt-2">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                  <MaterialIcons name="info" size={20} color={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                </View>
                <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">App Version</Text>
              </View>
              <Text className="text-sm font-outfit text-gray-400">1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout — per Stitch: bordered error button */}
        <TouchableOpacity
          className="w-full flex-row items-center justify-center gap-2 py-3.5 border border-error-500 rounded-xl"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={20} color="#F04438" />
          <Text className="text-error-500 font-outfit-medium">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
