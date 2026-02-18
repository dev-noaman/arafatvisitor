/**
 * QRGeneratorModal
 * Modal for displaying and sharing QR codes for visitors
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { API_BASE_URL } from '../../services/api';
import { colors } from '../../theme/colors';

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
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white dark:bg-dark-card rounded-2xl p-6 w-[90%] max-w-[400px]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white">
              Visitor QR Code
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <MaterialIcons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Visitor Name */}
          {visitorName && (
            <Text className="text-base font-outfit text-gray-500 dark:text-gray-400 mb-4">
              {visitorName}
            </Text>
          )}

          {/* Content */}
          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={colors.brand[500]} />
              <Text className="mt-4 text-base font-outfit text-gray-500 dark:text-gray-400">
                Loading QR code...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center py-8">
              <Text className="text-base font-outfit text-error-500 mb-4 text-center">{error}</Text>
              <TouchableOpacity
                className="bg-brand-500 px-6 py-3 rounded-full"
                onPress={loadQRCode}
              >
                <Text className="text-white font-outfit-bold text-base">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : qrImageUri ? (
            <View className="items-center py-4">
              <Image
                source={{
                  uri: qrImageUri,
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }}
                style={{ width: 250, height: 250, borderRadius: 8 }}
                resizeMode="contain"
              />
              <Text className="mt-4 text-sm font-outfit text-gray-400 dark:text-gray-500 text-center">
                Show this QR code to the visitor for check-in
              </Text>
            </View>
          ) : null}

          {/* Done Button */}
          <TouchableOpacity
            className="mt-4 bg-brand-500 py-3.5 rounded-full items-center"
            onPress={onClose}
          >
            <Text className="text-white font-outfit-bold text-base">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
