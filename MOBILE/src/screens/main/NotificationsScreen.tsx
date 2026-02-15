/**
 * NotificationsScreen
 * Displays system and activity notifications
 * Currently uses mock data as backend support is pending
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../../components/common/EmptyState';
import { useUIStore } from '../../store/uiStore';

type NotificationType = 'visitor' | 'delivery' | 'system' | 'alert';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any; // For navigation params
}

// Mock Data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'visitor',
    title: 'Visitor Arrived',
    message: 'John Doe from Acme Corp has checked in.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    read: false,
    data: { screen: 'VisitorDetail', sessionId: 'mock-session-1' },
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Package Delivery',
    message: 'A package for reception has been delivered by FedEx.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'The visitor management system will undergo maintenance at midnight.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Overstay Alert',
    message: 'Visitor Sarah Smith has exceeded their expected visit duration.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 1 day 1 hr ago
    read: true,
    data: { screen: 'VisitorDetail', sessionId: 'mock-session-2' },
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetch
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handlePress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Navigate if applicable
    if (notification.type === 'visitor' && notification.data?.screen) {
      // Logic to navigate would go here
      // navigation.navigate(notification.data.screen, { sessionId: notification.data.sessionId });
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'visitor': return '👤';
      case 'delivery': return '📦';
      case 'alert': return '⚠️';
      case 'system':
      default: return '🔔';
    }
  };

  const getIconBgColor = (type: NotificationType) => {
    switch (type) {
      case 'visitor': return 'bg-brand-100 dark:bg-brand-900/30';
      case 'delivery': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'alert': return 'bg-error-100 dark:bg-error-900/30';
      case 'system':
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'visitor': return 'text-brand-600 dark:text-brand-400';
      case 'delivery': return 'text-blue-600 dark:text-blue-400';
      case 'alert': return 'text-error-600 dark:text-error-400';
      case 'system':
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex-row justify-between items-center px-6 pt-6 pb-4 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-gray-800">
        <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white">Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text className="text-brand-500 font-outfit-medium text-sm">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465FFF" />}
        contentContainerClassName="p-4 pb-20"
        ListEmptyComponent={<EmptyState title="No notifications" icon="🔔" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`flex-row p-4 mb-3 rounded-2xl border ${item.read
                ? 'bg-white dark:bg-dark-elem border-gray-100 dark:border-gray-800'
                : 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-900/30'
              }`}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            {/* Icon */}
            <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${getIconBgColor(item.type)}`}>
              <Text className={`text-xl ${getIconColor(item.type)}`}>{getIcon(item.type)}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <Text className={`text-base font-outfit-bold flex-1 mr-2 ${item.read ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                  {item.title}
                </Text>
                <Text className="text-xs font-outfit text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </Text>
              </View>
              <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 leading-5">
                {item.message}
              </Text>
            </View>

            {/* Unread Dot (optional, visually indicated by bg color but can add dot too) */}
            {!item.read && (
              <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
