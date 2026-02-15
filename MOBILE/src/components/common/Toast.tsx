/**
 * Toast Component
 * Toast/snackbar notifications for success/error messages
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  visible: boolean;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  visible,
  onDismiss,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-success-500';
      case 'error': return 'bg-error-500';
      case 'warning': return 'bg-warning-500';
      case 'info':
      default: return 'bg-brand-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info':
      default: return 'ℹ';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      className={`absolute top-12 left-4 right-4 flex-row items-center px-4 py-3 rounded-xl shadow-lg z-50 ${getBackgroundColor()}`}
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Text className="text-white text-lg font-bold">{getIcon()}</Text>
      <Text className="flex-1 text-white font-outfit-medium text-sm ml-3">
        {message}
      </Text>
    </Animated.View>
  );
};

/**
 * Toast Manager - Singleton for managing toasts
 */
class ToastManager {
  private static instance: ToastManager;
  private listeners: Array<(toast: { message: string; type: ToastType }) => void> = [];

  private constructor() { }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  public subscribe(
    listener: (toast: { message: string; type: ToastType }) => void
  ) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public show(message: string, type: ToastType = 'info') {
    this.listeners.forEach((listener) => listener({ message, type }));
  }
}

export const toast = ToastManager.getInstance();
