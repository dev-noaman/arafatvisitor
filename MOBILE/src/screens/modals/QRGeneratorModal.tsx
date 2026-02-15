/**
 * QRGeneratorModal
 * Modal for displaying and sharing QR codes for visitors
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { toast } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { API_BASE_URL } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface QRGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  visitId: string;
  visitorName?: string;
}

export default function QRGeneratorModal({
  visible,
  onClose,
  visitId,
  visitorName,
}: QRGeneratorModalProps) {
  const [qrImageUri, setQrImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.accessToken);
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (visible && visitId) {
      loadQRCode();
    }
    if (!visible) {
      setQrImageUri(null);
      setError(null);
    }
  }, [visible, visitId]);

  const loadQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Build QR code image URL from backend
      const uri = `${API_BASE_URL}/admin/api/qr/${visitId}`;
      setQrImageUri(uri);
    } catch (err: any) {
      setError(err.message || 'Failed to load QR code');
      toast.show('Failed to load QR code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Visitor QR Code
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.text.secondary }]}>
                X
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visitor Name */}
          {visitorName && (
            <Text style={[styles.visitorName, { color: theme.text.secondary }]}>
              {visitorName}
            </Text>
          )}

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand[500]} />
              <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
                Loading QR code...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadQRCode}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : qrImageUri ? (
            <View style={styles.qrContainer}>
              <Image
                source={{
                  uri: qrImageUri,
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={[styles.hint, { color: theme.text.muted }]}>
                Show this QR code to the visitor for check-in
              </Text>
            </View>
          ) : null}

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.brand[500] }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    padding: spacing.xs,
  },
  visitorName: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
  },
  qrContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  hint: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error[500],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brand[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  doneButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
