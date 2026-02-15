/**
 * EmptyState Component
 * Displays when there are no results or data
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8 min-h-[300px]">
      <Text className="text-6xl mb-4">{icon}</Text>
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
