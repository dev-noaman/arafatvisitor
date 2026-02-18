/**
 * EmptyState Component
 * Displays when there are no results or data
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8 min-h-[300px]">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <MaterialIcons name={icon as any} size={36} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 text-center mb-6 leading-5">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-brand-500 font-outfit-bold text-base mt-2">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
