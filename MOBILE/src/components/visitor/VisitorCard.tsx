/**
 * VisitorCard Component
 * Visitor list item showing name, company, status, host in compact format
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { useUIStore } from '../../store/uiStore';
import type { Visit } from '../../types';

interface VisitorCardProps {
  visitor: Visit;
  onPress: () => void;
}

export const VisitorCard: React.FC<VisitorCardProps> = ({ visitor, onPress }) => {
  const initials = visitor.visitorName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white dark:bg-dark-card p-4 rounded-2xl mb-3 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-4">
        <Text className="text-gray-600 dark:text-gray-300 font-outfit-bold text-sm">
          {initials}
        </Text>
      </View>

      <View className="flex-1 mr-2">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-base font-outfit-bold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
            {visitor.visitorName}
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 font-outfit" numberOfLines={1}>
          {visitor.visitorCompany || `Host: ${visitor.hostName || 'N/A'}`}
        </Text>
      </View>

      <StatusBadge status={visitor.status} />
    </TouchableOpacity>
  );
};
