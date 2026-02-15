import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
} from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: any;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
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
      <TextInput
        className={`w-full px-4 py-3 rounded-xl border text-base ${error
            ? 'border-error-500 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          } ${props.editable === false ? 'opacity-60' : ''
          } text-gray-900 dark:text-white`}
        placeholderTextColor={isDarkMode ? colors.dark.text.muted : colors.gray[400]}
        style={style}
        {...props}
      />
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
