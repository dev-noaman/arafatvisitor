/**
 * useNetworkStatus Hook
 * Custom hook for network connectivity detection using NetInfo API
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
  details: any;
}

/**
 * useNetworkStatus hook
 * Provides real-time network status information
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    details: null,
  });

  useEffect(() => {
    // On web, use navigator.onLine (NetInfo is unreliable on web)
    if (Platform.OS === 'web') {
      const updateOnlineStatus = () => {
        setNetworkStatus({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: navigator.onLine ? 'wifi' : 'none',
          details: null,
        });
      };
      updateOnlineStatus();
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    // Native: use NetInfo
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });
    });

    NetInfo.fetch().then((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};
