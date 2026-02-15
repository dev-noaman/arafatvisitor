/**
 * QRScannerScreen
 * Screen for scanning QR codes to check in visitors
 * Includes manual ID entry fallback for cases where QR scanning is not possible
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// Web-safe: camera and haptics are native-only
const isWeb = Platform.OS === 'web';

const Haptics = {
  notificationAsync: async (_type?: any) => { },
  NotificationFeedbackType: { Success: 'success' as const, Error: 'error' as const, Warning: 'warning' as const },
};
if (!isWeb) {
  const mod = require('expo-haptics');
  Haptics.notificationAsync = mod.notificationAsync;
  Haptics.NotificationFeedbackType = mod.NotificationFeedbackType;
}
import { useNavigation } from '@react-navigation/native';
import { parseAndValidateQRCode } from '../../utils/qrParser';
import { getVisitBySessionId, checkIn } from '../../services/endpoints/visitors';
import { toast } from '../../components/common/Toast';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = SCREEN_WIDTH * 0.7;

// Conditionally import camera (native only)
let CameraView: any = null;
let useCameraPermissions: any = () => [{ granted: false }, () => { }];
if (!isWeb) {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
}

export default function QRScannerScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error'>('success');
  const [showResult, setShowResult] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualId, setManualId] = useState('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  /**
   * Core session processing logic shared by QR scan and manual entry.
   * Fetches visitor data, validates status, and performs check-in.
   */
  const processSessionId = async (sessionId: string) => {
    try {
      // Fetch visitor data
      const visitor = await getVisitBySessionId(sessionId);

      if (visitor.status === 'CHECKED_IN') {
        throw new Error('Visitor is already checked in');
      }
      if (visitor.status === 'CHECKED_OUT') {
        throw new Error('Visitor has already checked out');
      }
      if (visitor.status !== 'APPROVED') {
        throw new Error(`Cannot check in: visitor status is ${visitor.status}`);
      }

      // Auto check-in
      await checkIn(sessionId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success result
      setResultMessage(`${visitor.visitorName} checked in successfully!`);
      setResultType('success');
      setShowResult(true);

      // Auto-reset after 5 seconds
      setTimeout(() => {
        setShowResult(false);
        setScanned(false);
        setProcessing(false);
        setResultMessage('');
      }, 5000);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = error.message || 'Failed to process session ID';
      setResultMessage(msg);
      setResultType('error');
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setScanned(false);
        setProcessing(false);
        setResultMessage('');
      }, 3000);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      // Parse QR payload
      const qrToken = parseAndValidateQRCode(data);
      if (!qrToken) {
        throw new Error('Invalid QR code format');
      }

      // Haptic feedback on successful scan
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await processSessionId(qrToken.sessionId);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = error.message || 'Failed to process QR code';
      setResultMessage(msg);
      setResultType('error');
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setScanned(false);
        setProcessing(false);
        setResultMessage('');
      }, 3000);
    }
  };

  const handleManualSubmit = async () => {
    const trimmedId = manualId.trim();
    if (!trimmedId) {
      toast.show('Please enter a session ID', 'error');
      return;
    }

    // Close the modal and start processing
    setShowManualEntry(false);
    setScanned(true);
    setProcessing(true);

    await processSessionId(trimmedId);
    setManualId('');
  };

  const handleManualCancel = () => {
    setShowManualEntry(false);
    setManualId('');
  };

  // Web: show manual entry only (no camera)
  if (isWeb) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center p-6">
        {showResult ? (
          <View className={`p-8 rounded-2xl items-center ${resultType === 'success' ? 'bg-success-500' : 'bg-error-500'}`}>
            <Text className="text-6xl text-white mb-4">{resultType === 'success' ? '✓' : '✕'}</Text>
            <Text className="text-xl font-outfit-bold text-white text-center mb-2">{resultMessage}</Text>
          </View>
        ) : (
          <View className="w-full max-w-md items-center">
            <Text className="text-5xl text-gray-400 mb-4">⊞</Text>
            <Text className="text-white font-outfit text-center mb-6">
              QR scanning requires a native device.{'\n'}Use manual entry instead.
            </Text>
            <TextInput
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white font-outfit mb-4"
              placeholder="Enter session ID"
              placeholderTextColor="#9CA3AF"
              value={manualId}
              onChangeText={setManualId}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleManualSubmit}
            />
            <TouchableOpacity
              className={`w-full py-3 rounded-xl items-center ${!manualId.trim() ? 'bg-brand-500/50' : 'bg-brand-500'}`}
              onPress={handleManualSubmit}
              disabled={!manualId.trim() || processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-outfit-bold">Check In</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white font-outfit">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-6">
        <Text className="text-white font-outfit text-center mb-4">
          Camera permission is required to scan QR codes.{'\n'}
          Please enable it in your device settings.
        </Text>
        <TouchableOpacity
          className="bg-brand-500 px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-outfit-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show result overlay
  if (showResult) {
    return (
      <View className={`flex-1 justify-center items-center p-8 ${resultType === 'success' ? 'bg-success-500' : 'bg-error-500'}`}>
        <Text className="text-7xl text-white mb-6">
          {resultType === 'success' ? '✓' : '✕'}
        </Text>
        <Text className="text-2xl font-outfit-bold text-white text-center mb-2">{resultMessage}</Text>
        {resultType === 'success' && (
          <Text className="text-white/80 font-outfit text-sm">Returning to scanner...</Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1, width: '100%' }}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View className="flex-1 justify-center items-center bg-black/30">
          {processing ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-white font-outfit mt-4">Processing...</Text>
            </View>
          ) : (
            <>
              <View className="relative border-2 border-white/20 rounded-3xl" style={{ width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE }}>
                {/* Corners */}
                <View className="absolute top-[-2] left-[-2] w-6 h-6 border-l-4 border-t-4 border-brand-500 rounded-tl-lg" />
                <View className="absolute top-[-2] right-[-2] w-6 h-6 border-r-4 border-t-4 border-brand-500 rounded-tr-lg" />
                <View className="absolute bottom-[-2] left-[-2] w-6 h-6 border-l-4 border-b-4 border-brand-500 rounded-bl-lg" />
                <View className="absolute bottom-[-2] right-[-2] w-6 h-6 border-r-4 border-b-4 border-brand-500 rounded-br-lg" />

                {/* Scanning Line */}
                <Animated.View
                  className="absolute left-2 right-2 h-[2px] bg-brand-500 shadow-lg shadow-brand-500"
                  style={{
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCAN_BOX_SIZE - 4],
                        }),
                      },
                    ],
                  }}
                />
              </View>
              <Text className="text-white font-outfit text-center mt-8 px-8 bg-black/40 py-2 rounded-full overflow-hidden">
                Position QR code within the frame
              </Text>
            </>
          )}
        </View>
      </CameraView>

      {/* Manual ID Entry Button */}
      {!processing && (
        <TouchableOpacity
          className="absolute bottom-10 self-center bg-black/60 px-6 py-4 rounded-full border border-white/20 backdrop-blur-md"
          onPress={() => setShowManualEntry(true)}
          activeOpacity={0.8}
        >
          <Text className="text-white font-outfit-bold text-base">Enter ID Manually</Text>
        </TouchableOpacity>
      )}

      {/* Manual ID Entry Modal */}
      <Modal
        visible={showManualEntry}
        animationType="fade"
        transparent
        onRequestClose={handleManualCancel}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center bg-black/80"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="bg-white dark:bg-dark-elem rounded-2xl p-6 w-[90%] max-w-sm">
            {/* Modal Header */}
            <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white mb-1">Manual ID Entry</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-outfit mb-6">
              Enter the visitor's session ID to check in
            </Text>

            {/* Session ID Input */}
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white font-outfit mb-6"
              placeholder="Enter session ID"
              placeholderTextColor="#9CA3AF"
              value={manualId}
              onChangeText={setManualId}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="go"
              onSubmitEditing={handleManualSubmit}
            />

            {/* Modal Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 items-center"
                onPress={handleManualCancel}
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 dark:text-gray-300 font-outfit-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${!manualId.trim() ? 'bg-brand-200 dark:bg-brand-900/30' : 'bg-brand-500'}`}
                onPress={handleManualSubmit}
                activeOpacity={0.7}
                disabled={!manualId.trim()}
              >
                <Text className="text-white font-outfit-bold">Check In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
