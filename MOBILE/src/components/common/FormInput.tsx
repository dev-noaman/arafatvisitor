import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: any;
  icon?: string;
  rightElement?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  icon,
  rightElement,
  style,
  ...props
}) => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  return (
    <View className="mb-4" style={containerStyle}>
      {label && (
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </Text>
      )}
      <View className="relative">
        {icon && (
          <View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
            <MaterialIcons
              name={icon as any}
              size={20}
              color={isDarkMode ? colors.gray[400] : colors.gray[400]}
            />
          </View>
        )}
        <TextInput
          className={`w-full ${icon ? 'pl-12' : 'px-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-3 rounded-xl border text-base ${error
              ? 'border-error-500 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            } ${props.editable === false ? 'opacity-60' : ''
            } text-gray-900 dark:text-white`}
          placeholderTextColor={isDarkMode ? colors.dark.text.muted : colors.gray[400]}
          style={style}
          {...props}
        />
        {rightElement && (
          <View className="absolute right-3 top-0 bottom-0 z-10 justify-center">
            {rightElement}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-xs text-error-500 mt-1.5">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          {helperText}
        </Text>
      )}
    </View>
  );
};
