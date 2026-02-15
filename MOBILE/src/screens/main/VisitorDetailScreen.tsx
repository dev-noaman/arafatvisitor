/**
 * VisitorDetailScreen
 * Displays visitor details with Check In/Out buttons
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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useCheckOut } from '../../hooks/useCheckOut';
import { getVisitBySessionId } from '../../services/endpoints/visitors';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { LoadingButton } from '../../components/common/LoadingButton';
import { Toast, toast } from '../../components/common/Toast';
import { useUIStore } from '../../store/uiStore';
import type { Visit } from '../../types';

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
    if (visitor?.hostPhone) {
      Linking.openURL(`tel:${visitor.hostPhone}`);
    }
  };

  const handleEmailHost = () => {
    if (visitor?.hostEmail) {
      Linking.openURL(`mailto:${visitor.hostEmail}`);
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

  return (
    <>
      <Toast
        message={toastState.message}
        type={toastState.type}
        visible={toastState.visible}
        onDismiss={() => setToastState({ ...toastState, visible: false })}
      />
      <View className="flex-1 bg-white dark:bg-dark-bg">
        <ScrollView contentContainerClassName="pb-10">
          {/* Header Area */}
          <View className="bg-white dark:bg-dark-bg px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            {/* Back button */}
            <TouchableOpacity
              className="mb-6 flex-row items-center"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-brand-600 font-outfit-bold text-base">‹ Back</Text>
            </TouchableOpacity>

            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white mb-2">
                  {visitor.visitorName}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 font-outfit text-base">
                  {visitor.visitorCompany || 'No Company'}
                </Text>
              </View>
              <StatusBadge status={visitor.status} />
            </View>
          </View>

          {/* Details Sections */}
          <View className="p-6">
            <InfoSection label="Contact Info">
              <InfoRow label="Phone" value={visitor.visitorPhone} />
              <InfoRow label="Email" value={visitor.visitorEmail} />
            </InfoSection>

            <InfoSection label="Visit Details">
              <InfoRow label="Purpose" value={visitor.purpose} />
              <InfoRow label="Expected Date" value={visitor.expectedDate ? new Date(visitor.expectedDate).toLocaleString() : 'N/A'} />
              {visitor.checkInAt && (
                <InfoRow label="Checked In" value={new Date(visitor.checkInAt).toLocaleString()} />
              )}
              {visitor.checkOutAt && (
                <InfoRow label="Checked Out" value={new Date(visitor.checkOutAt).toLocaleString()} />
              )}
            </InfoSection>

            <InfoSection label="Host Information">
              <InfoRow label="Host Name" value={visitor.hostName} className="mb-4" />

              {/* Host Actions */}
              <View className="flex-row gap-3 mt-2">
                {visitor.hostPhone && (
                  <TouchableOpacity
                    className="flex-1 border border-brand-500 rounded-xl py-3 items-center"
                    onPress={handleCallHost}
                  >
                    <Text className="text-brand-600 font-outfit-bold text-sm">📞 Call Host</Text>
                  </TouchableOpacity>
                )}
                {visitor.hostEmail && (
                  <TouchableOpacity
                    className="flex-1 border border-brand-500 rounded-xl py-3 items-center"
                    onPress={handleEmailHost}
                  >
                    <Text className="text-brand-600 font-outfit-bold text-sm">✉️ Email Host</Text>
                  </TouchableOpacity>
                )}
              </View>
            </InfoSection>
          </View>
        </ScrollView>

        {/* Action Buttons (Fixed Bottom) */}
        {(canCheckIn || canCheckOut || isCompleted) && (
          <View className="p-6 bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-gray-800 safe-bottom">
            {canCheckIn && (
              <LoadingButton
                title="Check In Visitor"
                onPress={handleCheckIn}
                isLoading={isCheckingIn}
                variant="success"
              />
            )}
            {canCheckOut && (
              <LoadingButton
                title="Check Out Visitor"
                onPress={handleCheckOut}
                isLoading={isCheckingOut}
                variant="danger"
              />
            )}
            {isCompleted && (
              <View className="bg-gray-100 dark:bg-gray-800 py-4 rounded-xl items-center">
                <Text className="text-gray-500 font-outfit-medium">Visit Completed</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}

// Helper Components
const InfoSection = ({ label, children }: any) => (
  <View className="mb-8">
    <Text className="text-sm font-outfit-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
      {label}
    </Text>
    {children}
  </View>
);

const InfoRow = ({ label, value, className }: any) => (
  <View className={`mb-4 ${className || ''}`}>
    <Text className="text-xs text-gray-500 dark:text-gray-400 font-outfit mb-1">{label}</Text>
    <Text className="text-base text-gray-900 dark:text-white font-outfit-medium">
      {value || 'N/A'}
    </Text>
  </View>
);
