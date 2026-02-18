import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoadingButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-500 shadow-lg shadow-brand-500/20';
      case 'secondary':
        return 'bg-gray-500';
      case 'danger':
        return 'bg-error-500';
      case 'success':
        return 'bg-success-500';
      default:
        return 'bg-brand-500 shadow-lg shadow-brand-500/20';
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row justify-center items-center py-3.5 px-6 rounded-xl min-h-[52px] ${getVariantClasses()} ${disabled || isLoading ? 'opacity-60' : 'opacity-100'
        } ${className || ''}`}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={style}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View className="flex-row items-center">
          {icon && (
            <MaterialIcons name={icon as any} size={20} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text className="text-white text-base font-semibold text-center font-outfit-bold">
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
