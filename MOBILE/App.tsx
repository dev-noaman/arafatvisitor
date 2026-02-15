import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner, Toast, toast, ToastType } from './src/components/common';
import { useUIStore } from './src/store/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const loadPreferences = useUIStore((state) => state.loadPreferences);

  // Toast state
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    loadPreferences();

    // Subscribe to toast events
    const unsubscribe = toast.subscribe(({ message, type }) => {
      setToastConfig({ visible: true, message, type });
    });

    return unsubscribe;
  }, []);

  const handleDismissToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}>
          <OfflineBanner />
          <RootNavigator />
          <Toast
            visible={toastConfig.visible}
            message={toastConfig.message}
            type={toastConfig.type}
            onDismiss={handleDismissToast}
          />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
