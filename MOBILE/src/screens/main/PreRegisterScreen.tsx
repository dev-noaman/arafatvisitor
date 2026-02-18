/**
 * PreRegisterScreen
 * Pre-registration list and form for creating new pre-registrations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePreRegistrations, useCreatePreRegistration } from '../../hooks/usePreRegistrations';
import { useHosts } from '../../hooks/useHosts';
import { usePurposes } from '../../hooks/useLookups';
import { FormInput } from '../../components/common/FormInput';
import { DateTimePicker } from '../../components/common/DateTimePicker';
import { LoadingButton } from '../../components/common/LoadingButton';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { toast } from '../../components/common/Toast';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { validateEmail, validateRequired } from '../../utils/validation';
import type { PreRegistration, Host } from '../../types';

type ViewMode = 'list' | 'form';

export default function PreRegisterScreen() {
  const navigation = useNavigation<any>();
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const user = useAuthStore((s) => s.user);

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // List data
  const { data: preRegs, isLoading, refetch } = usePreRegistrations({
    page: 1,
    limit: 50,
    status: 'PENDING_APPROVAL',
  });

  // Form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [hostId, setHostId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lookups
  const { data: hostsData } = useHosts({ limit: 100 });
  const { data: purposesData } = usePurposes();
  const createMutation = useCreatePreRegistration();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'RECEPTION';

  const resetForm = () => {
    setVisitorName('');
    setVisitorEmail('');
    setVisitorPhone('');
    setVisitorCompany('');
    setHostId('');
    setPurpose('');
    setExpectedDate(new Date());
    setNotes('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameResult = validateRequired(visitorName, 'Name');
    if (!nameResult.isValid) newErrors.visitorName = nameResult.error!;
    const emailReq = validateRequired(visitorEmail, 'Email');
    if (!emailReq.isValid) {
      newErrors.visitorEmail = emailReq.error!;
    } else {
      const emailVal = validateEmail(visitorEmail);
      if (!emailVal.isValid) newErrors.visitorEmail = emailVal.error!;
    }
    const phoneResult = validateRequired(visitorPhone, 'Phone');
    if (!phoneResult.isValid) newErrors.visitorPhone = phoneResult.error!;
    const companyResult = validateRequired(visitorCompany, 'Company');
    if (!companyResult.isValid) newErrors.visitorCompany = companyResult.error!;
    if (!hostId) newErrors.hostId = 'Please select a host';
    if (!purpose) newErrors.purpose = 'Purpose is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await createMutation.mutateAsync({
        visitorName,
        visitorEmail,
        visitorPhone,
        visitorCompany,
        hostId,
        expectedDate: expectedDate.toISOString(),
        purpose,
        notes: notes || undefined,
      });
      toast.show('Pre-registration created successfully!', 'success');
      resetForm();
      setViewMode('list');
      refetch();
    } catch (error: any) {
      toast.show(error?.message || 'Failed to create pre-registration', 'error');
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <View className="flex-1 bg-white dark:bg-dark-bg">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-gray-800">
          <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white">Pre-Registrations</Text>
          {canCreate && (
            <TouchableOpacity
              className="bg-brand-500 px-4 py-2.5 rounded-full shadow-sm active:bg-brand-600 flex-row items-center"
              onPress={() => setViewMode('form')}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text className="text-white font-outfit-bold text-sm ml-1">Add Visitor</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#465FFF" />
          </View>
        ) : !preRegs?.data?.length ? (
          <EmptyState title="No pending pre-registrations" icon="assignment" />
        ) : (
          <FlatList
            data={preRegs.data}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#465FFF" />}
            contentContainerClassName="p-4"
            renderItem={({ item }: { item: PreRegistration }) => (
              <TouchableOpacity
                className="bg-white dark:bg-dark-card p-4 mb-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex-row items-center justify-between"
                onPress={() => navigation.navigate('PreRegDetail', { preReg: item })}
                activeOpacity={0.7}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-base font-outfit-bold text-gray-900 dark:text-white mb-1">
                    {item.visitorName}
                  </Text>
                  <Text className="text-sm font-outfit text-gray-500 dark:text-gray-400 mb-1">
                    {item.visitorCompany}
                  </Text>
                  <Text className="text-xs font-outfit text-gray-400 dark:text-gray-500">
                    Host: {item.host?.name || item.hostName || 'N/A'}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  // Form View
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-white dark:bg-dark-bg"
    >
      <ScrollView
        contentContainerClassName="pb-10"
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-row items-center px-6 pt-6 pb-2">
          <TouchableOpacity
            onPress={() => { resetForm(); setViewMode('list'); }}
            className="mr-4 flex-row items-center"
          >
            <MaterialIcons name="arrow-back" size={20} color="#465FFF" />
            <Text className="text-brand-600 font-outfit-bold text-base ml-1">Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white">Pre-register Visitor</Text>
        </View>

        <View className="p-6 gap-4">
          <FormInput
            label="Visitor Name"
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Enter visitor name"
            error={errors.visitorName}
            icon="person"
          />
          <FormInput
            label="Email"
            value={visitorEmail}
            onChangeText={setVisitorEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.visitorEmail}
            icon="mail"
          />
          <FormInput
            label="Phone"
            value={visitorPhone}
            onChangeText={setVisitorPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            error={errors.visitorPhone}
            icon="phone"
          />
          <FormInput
            label="Company"
            value={visitorCompany}
            onChangeText={setVisitorCompany}
            placeholder="Enter company name"
            error={errors.visitorCompany}
            icon="apartment"
          />

          {/* Host Picker */}
          <View className="mb-2">
            <Text className="text-sm font-outfit-medium text-gray-700 dark:text-gray-300 mb-2">Host *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {hostsData?.data?.map((host: Host) => (
                <TouchableOpacity
                  key={host.id}
                  className={`px-4 py-2 rounded-full border mr-2 ${hostId === host.id
                      ? 'bg-brand-500 border-brand-500'
                      : 'bg-transparent border-gray-200 dark:border-gray-700'
                    }`}
                  onPress={() => setHostId(host.id)}
                >
                  <Text
                    className={`text-sm font-outfit-medium ${hostId === host.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {host.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.hostId && (
              <Text className="text-error-500 text-xs mt-1 font-outfit">{errors.hostId}</Text>
            )}
          </View>

          {/* Purpose Picker */}
          <View className="mb-2">
            <Text className="text-sm font-outfit-medium text-gray-700 dark:text-gray-300 mb-2">Purpose *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {purposesData?.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  className={`px-4 py-2 rounded-full border mr-2 ${purpose === p.label
                      ? 'bg-brand-500 border-brand-500'
                      : 'bg-transparent border-gray-200 dark:border-gray-700'
                    }`}
                  onPress={() => setPurpose(p.label)}
                >
                  <Text
                    className={`text-sm font-outfit-medium ${purpose === p.label ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.purpose && (
              <Text className="text-error-500 text-xs mt-1 font-outfit">{errors.purpose}</Text>
            )}
          </View>

          <DateTimePicker
            label="Expected Arrival"
            value={expectedDate}
            onChange={setExpectedDate}
            minimumDate={new Date()}
          />

          <FormInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            multiline
          />

          <View className="mt-4">
            <LoadingButton
              title="Submit Pre-registration"
              onPress={handleSubmit}
              isLoading={createMutation.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
