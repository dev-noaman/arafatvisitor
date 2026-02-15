/**
 * PreRegDetailScreen
 * Displays pre-registration details with approve/reject actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useApprovePreRegistration, useRejectPreRegistration, useReApprovePreRegistration } from '../../hooks/usePreRegistrations';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { LoadingButton } from '../../components/common/LoadingButton';
import { Toast, toast } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { PreRegistration } from '../../types';

export default function PreRegDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text.primary }]}>
          Pre-registration data not found
        </Text>
        <LoadingButton
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }}
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
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backText, { color: colors.brand[500] }]}>&#8249; Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Pre-Registration Details</Text>
          <StatusBadge status={preReg.status} />
        </View>

        {/* Visitor Info */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Visitor Name</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.visitorName}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Email</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.visitorEmail || 'N/A'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Phone</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.visitorPhone || 'N/A'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Company</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.visitorCompany || 'N/A'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Host</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.hostName || 'N/A'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Purpose</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.purpose || 'N/A'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Expected Date</Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {preReg.expectedArrivalDate
              ? new Date(preReg.expectedArrivalDate).toLocaleString()
              : 'N/A'}
          </Text>
        </View>

        {preReg.location && (
          <View style={[styles.section, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Location</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {preReg.location}
            </Text>
          </View>
        )}

        {preReg.notes && (
          <View style={[styles.section, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Notes</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {preReg.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isPending && canApprove && (
            <>
              <LoadingButton
                title="Approve"
                onPress={handleApprove}
                isLoading={approveMutation.isPending}
                disabled={isActioning}
                variant="success"
                style={styles.actionButton}
              />
              <LoadingButton
                title="Reject"
                onPress={handleReject}
                isLoading={rejectMutation.isPending}
                disabled={isActioning}
                variant="danger"
                style={styles.actionButton}
              />
            </>
          )}
          {isRejected && canApprove && (
            <LoadingButton
              title="Re-Approve"
              onPress={handleReApprove}
              isLoading={reApproveMutation.isPending}
              disabled={isActioning}
              variant="primary"
              style={styles.actionButton}
            />
          )}
          {isApproved && (
            <LoadingButton
              title="Approved"
              onPress={() => {}}
              disabled
              variant="success"
              style={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  backButton: { padding: spacing.lg, paddingBottom: 0 },
  backText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: { flex: 1 },
});
