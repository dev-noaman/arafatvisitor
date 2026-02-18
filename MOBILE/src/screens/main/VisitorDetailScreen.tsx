/**
 * VisitorDetailScreen
 * Matches Stitch design: centered avatar, info card with icon circles, timestamps grid, bottom actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useCheckOut } from '../../hooks/useCheckOut';
import { getVisitBySessionId } from '../../services/endpoints/visitors';
import type { VisitorPassResponse } from '../../types/api';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { LoadingButton } from '../../components/common/LoadingButton';
import { Toast, toast } from '../../components/common/Toast';
import { useUIStore } from '../../store/uiStore';

export default function VisitorDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const isDarkMode = useUIStore((s) => s.isDarkMode);

  const { sessionId } = route.params as { sessionId: string };
  const { checkIn, isLoading: isCheckingIn } = useCheckIn();
  const { checkOut, isLoading: isCheckingOut } = useCheckOut();

  const {
    data: visitor,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['visit', sessionId],
    queryFn: () => getVisitBySessionId(sessionId),
    enabled: !!sessionId,
  });

  const [toastState, setToastState] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false,
  });

  useEffect(() => {
    const unsubscribe = toast.subscribe(({ message, type }) => {
      setToastState({ message, type, visible: true });
    });
    return unsubscribe;
  }, []);

  const handleCheckIn = async () => {
    try {
      await checkIn({ sessionId });
      toast.show('Check-in successful!', 'success');
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to check in visitor';
      toast.show(errorMessage, 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({ sessionId });
      toast.show('Check-out successful!', 'success');
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to check out visitor';
      toast.show(errorMessage, 'error');
    }
  };

  const handleCallHost = () => {
    if (visitor?.host?.phone) {
      Linking.openURL(`tel:${visitor.host.phone}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-dark-bg p-8">
        <ActivityIndicator size="large" color="#465FFF" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400 font-outfit text-base">
          Loading visitor details...
        </Text>
      </View>
    );
  }

  if (error || !visitor) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-dark-bg p-8">
        <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white mb-4 text-center">
          Failed to load visitor details
        </Text>
        <LoadingButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const canCheckIn = visitor.status === 'APPROVED';
  const canCheckOut = visitor.status === 'CHECKED_IN';
  const isCompleted = visitor.status === 'CHECKED_OUT';

  const initials = visitor.visitor.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  const getStatusBgColor = () => {
    switch (visitor.status) {
      case 'CHECKED_IN': return 'bg-success-50 dark:bg-success-900/20';
      case 'APPROVED': return 'bg-brand-50 dark:bg-brand-900/20';
      case 'CHECKED_OUT': return 'bg-gray-100 dark:bg-gray-800';
      default: return 'bg-warning-50 dark:bg-warning-900/20';
    }
  };

  return (
    <>
      <Toast
        message={toastState.message}
        type={toastState.type}
        visible={toastState.visible}
        onDismiss={() => setToastState({ ...toastState, visible: false })}
      />
      <View className="flex-1 bg-white dark:bg-dark-bg">
        {/* Header — per Stitch */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity className="p-2 rounded-full" onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#E5E7EB' : '#1A1C1E'} />
          </TouchableOpacity>
          <Text className="text-lg font-outfit-semibold text-gray-900 dark:text-white">Visitor Details</Text>
          <View className="w-10" />
        </View>

        <ScrollView contentContainerClassName="pb-32 pt-4">
          {/* Avatar + Name + Status — per Stitch: centered */}
          <View className="items-center mb-6 px-4">
            <View
              className="w-24 h-24 rounded-full bg-brand-200 dark:bg-brand-900/30 items-center justify-center mb-4"
              style={{ borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            >
              <Text className="text-brand-500 text-3xl font-outfit-bold">{initials}</Text>
            </View>
            <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white mb-1">{visitor.visitor.name}</Text>
            <Text className="text-gray-400 font-outfit mb-3">{visitor.visitor.company || 'No Company'}</Text>
            <StatusBadge status={visitor.status} />
          </View>

          {/* Visitor Information Card — per Stitch: icon circles on left */}
          <View
            className="mx-4 bg-white dark:bg-dark-card rounded-xl p-5 mb-4 border border-gray-100 dark:border-gray-800"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-sm font-outfit-semibold text-gray-400 uppercase tracking-wider mb-4">Visitor Information</Text>
            <View className="gap-5">
              <DetailRow icon="mail" label="Email Address" value={visitor.visitor.email} />
              <DetailRow icon="call" label="Phone Number" value={visitor.visitor.phone} />
              <DetailRow icon="work" label="Purpose of Visit" value={visitor.purpose} />
              <DetailRow icon="person" label="Host" value={visitor.host?.name} />
            </View>
          </View>

          {/* Timestamps Card — per Stitch: 3-column grid */}
          <View
            className="mx-4 bg-white dark:bg-dark-card rounded-xl p-5 mb-4 border border-gray-100 dark:border-gray-800"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-sm font-outfit-semibold text-gray-400 uppercase tracking-wider mb-4">Timestamps</Text>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1 font-outfit">Expected</Text>
                <Text className="text-sm font-outfit-semibold text-gray-900 dark:text-white">
                  {visitor.expectedDate ? new Date(visitor.expectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
              </View>
              <View className="flex-1 border-l border-gray-100 dark:border-gray-700 pl-4">
                <Text className="text-xs text-gray-500 mb-1 font-outfit">Checked In</Text>
                <Text className="text-sm font-outfit-semibold text-success-500">
                  {visitor.checkInTimestamp ? new Date(visitor.checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
              </View>
              <View className="flex-1 border-l border-gray-100 dark:border-gray-700 pl-4">
                <Text className="text-xs text-gray-500 mb-1 font-outfit">Checked Out</Text>
                <Text className="text-sm font-outfit-semibold text-gray-400">
                  {visitor.checkOutTimestamp ? new Date(visitor.checkOutTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons — per Stitch: fixed, Call Host (outlined) + Check Out/In (filled) */}
        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white/95 dark:bg-dark-bg/95 border-t border-gray-100 dark:border-gray-800"
          style={{ paddingBottom: 24 }}
        >
          <View className="flex-row gap-3">
            {visitor.host?.phone && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 border border-brand-500 rounded-xl"
                onPress={handleCallHost}
              >
                <MaterialIcons name="call" size={20} color="#465FFF" />
                <Text className="text-brand-500 font-outfit-medium">Call Host</Text>
              </TouchableOpacity>
            )}
            {canCheckIn && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-success-500 rounded-xl"
                style={{ shadowColor: '#12B76A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
                onPress={handleCheckIn}
                disabled={isCheckingIn}
              >
                <MaterialIcons name="login" size={20} color="#fff" />
                <Text className="text-white font-outfit-medium">Check In</Text>
              </TouchableOpacity>
            )}
            {canCheckOut && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-error-500 rounded-xl"
                style={{ shadowColor: '#F04438', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
                onPress={handleCheckOut}
                disabled={isCheckingOut}
              >
                <MaterialIcons name="logout" size={20} color="#fff" />
                <Text className="text-white font-outfit-medium">Check Out</Text>
              </TouchableOpacity>
            )}
            {isCompleted && (
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 py-3.5 rounded-xl items-center">
                <Text className="text-gray-500 font-outfit-medium">Visit Completed</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

// Detail row with icon circle — per Stitch
const DetailRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => (
  <View className="flex-row items-start">
    <View className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 items-center justify-center mr-4">
      <MaterialIcons name={icon as any} size={20} color="#6B7280" />
    </View>
    <View>
      <Text className="text-xs text-gray-500 mb-0.5 font-outfit">{label}</Text>
      <Text className="text-sm font-outfit-medium text-gray-900 dark:text-white">{value || 'N/A'}</Text>
    </View>
  </View>
);
