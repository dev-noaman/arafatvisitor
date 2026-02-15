/**
 * OfflineBanner Component
 * Shows when device is offline, disappears on reconnect
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { colors } from '../../theme';
import { useUIStore } from '../../store/uiStore';

export const OfflineBanner: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  if (networkStatus.isConnected && networkStatus.isInternetReachable) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.warning[500],
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: isDarkMode ? colors.dark.text.primary : colors.light.text.primary,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        You are offline. Some features may be limited.
      </Text>
    </View>
  );
};
