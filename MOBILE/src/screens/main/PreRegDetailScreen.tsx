/**
 * PreRegDetailScreen
 * Displays pre-registration details with approve/reject actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useApprovePreRegistration, useRejectPreRegistration, useReApprovePreRegistration } from '../../hooks/usePreRegistrations';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { LoadingButton } from '../../components/common/LoadingButton';
import { Toast, toast } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import type { PreRegistration } from '../../types';

export default function PreRegDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const preReg = route.params?.preReg as PreRegistration | undefined;

  const approveMutation = useApprovePreRegistration();
  const rejectMutation = useRejectPreRegistration();
  const reApproveMutation = useReApprovePreRegistration();

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

  const canApprove = user?.role === 'ADMIN' || user?.role === 'HOST' || user?.role === 'STAFF';

  const handleApprove = async () => {
    if (!preReg) return;
    try {
      await approveMutation.mutateAsync(preReg.id);
      toast.show('Pre-registration approved!', 'success');
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to approve pre-registration';
      toast.show(errorMessage, 'error');
    }
  };

  const handleReject = () => {
    if (!preReg) return;
    Alert.alert(
      'Reject Pre-Registration',
      'Are you sure you want to reject this visitor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync({ id: preReg.id });
              toast.show('Pre-registration rejected.', 'success');
              navigation.goBack();
            } catch (error: any) {
              const errorMessage =
                error?.response?.data?.message || error?.message || 'Failed to reject pre-registration';
              toast.show(errorMessage, 'error');
            }
          },
        },
      ],
    );
  };

  const handleReApprove = async () => {
    if (!preReg) return;
    try {
      await reApproveMutation.mutateAsync(preReg.id);
      toast.show('Pre-registration re-approved!', 'success');
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to re-approve pre-registration';
      toast.show(errorMessage, 'error');
    }
  };

  if (!preReg) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-dark-bg p-8">
        <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white mb-4">
          Pre-registration data not found
        </Text>
        <LoadingButton
          title="Go Back"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const isPending = preReg.status === 'PENDING_APPROVAL';
  const isRejected = preReg.status === 'REJECTED';
  const isApproved = preReg.status === 'APPROVED';
  const isActioning =
    approveMutation.isPending || rejectMutation.isPending || reApproveMutation.isPending;

  return (
    <>
      <Toast
        message={toastState.message}
        type={toastState.type}
        visible={toastState.visible}
        onDismiss={() => setToastState({ ...toastState, visible: false })}
      />
      <ScrollView className="flex-1 bg-gray-50 dark:bg-dark-bg">
        {/* Back button */}
        <TouchableOpacity
          className="flex-row items-center px-6 pt-6"
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#465FFF" />
          <Text className="text-brand-500 font-outfit-bold text-base ml-1">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white flex-1">
            Pre-Registration Details
          </Text>
          <StatusBadge status={preReg.status} />
        </View>

        {/* Detail Rows */}
        <View className="px-6">
          <DetailRow label="Visitor Name" value={preReg.visitorName} />
          <DetailRow label="Email" value={preReg.visitorEmail || 'N/A'} />
          <DetailRow label="Phone" value={preReg.visitorPhone || 'N/A'} />
          <DetailRow label="Company" value={preReg.visitorCompany || 'N/A'} />
          <DetailRow label="Host" value={preReg.host?.name || preReg.hostName || 'N/A'} />
          <DetailRow label="Purpose" value={preReg.purpose || 'N/A'} />
          <DetailRow
            label="Expected Date"
            value={(preReg.expectedDate || preReg.expectedArrivalDate)
              ? new Date((preReg.expectedDate || preReg.expectedArrivalDate)!).toLocaleString()
              : 'N/A'}
          />
          {preReg.location && <DetailRow label="Location" value={preReg.location} />}
          {preReg.notes && <DetailRow label="Notes" value={preReg.notes} />}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around px-6 py-6 gap-3">
          {isPending && canApprove && (
            <>
              <View className="flex-1">
                <LoadingButton
                  title="Approve"
                  onPress={handleApprove}
                  isLoading={approveMutation.isPending}
                  disabled={isActioning}
                  variant="success"
                />
              </View>
              <View className="flex-1">
                <LoadingButton
                  title="Reject"
                  onPress={handleReject}
                  isLoading={rejectMutation.isPending}
                  disabled={isActioning}
                  variant="danger"
                />
              </View>
            </>
          )}
          {isRejected && canApprove && (
            <View className="flex-1">
              <LoadingButton
                title="Re-Approve"
                onPress={handleReApprove}
                isLoading={reApproveMutation.isPending}
                disabled={isActioning}
                variant="primary"
              />
            </View>
          )}
          {isApproved && (
            <View className="flex-1">
              <LoadingButton
                title="Approved"
                onPress={() => {}}
                disabled
                variant="success"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="py-4 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-xs font-outfit text-gray-500 dark:text-gray-400 mb-1">{label}</Text>
    <Text className="text-base font-outfit-medium text-gray-900 dark:text-white">{value}</Text>
  </View>
);
