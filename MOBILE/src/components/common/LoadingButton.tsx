import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface LoadingButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-500';
      case 'secondary':
        return 'bg-gray-500';
      case 'danger':
        return 'bg-error-500';
      case 'success':
        return 'bg-success-500';
      default:
        return 'bg-brand-500';
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row justify-center items-center py-3.5 px-6 rounded-xl min-h-[48px] ${getVariantClasses()} ${disabled || isLoading ? 'opacity-60' : 'opacity-100'
        }`}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={style}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className="text-white text-base font-semibold text-center font-outfit-bold">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
