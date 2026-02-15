/**
 * StatusBadge Component
 * Color-coded status badge for visitor visits
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { VisitStatus } from '../../types';

interface StatusBadgeProps {
  status: VisitStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {

  const getStatusColor = (): string => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return 'bg-warning-50 dark:bg-warning-900/20';
      case 'APPROVED':
        return 'bg-success-50 dark:bg-success-900/20';
      case 'CHECKED_IN':
        return 'bg-brand-50 dark:bg-brand-900/20';
      case 'CHECKED_OUT':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-error-50 dark:bg-error-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTextColor = (): string => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return 'text-warning-700 dark:text-warning-400';
      case 'APPROVED':
        return 'text-success-700 dark:text-success-400';
      case 'CHECKED_IN':
        return 'text-brand-700 dark:text-brand-400';
      case 'CHECKED_OUT':
        return 'text-gray-700 dark:text-gray-400';
      case 'REJECTED':
      case 'CANCELLED':
        return 'text-error-700 dark:text-error-400';
      default:
        return 'text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'CHECKED_IN':
        return 'Checked In';
      case 'CHECKED_OUT':
        return 'Checked Out';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full self-start ${getStatusColor()}`}>
      <Text className={`text-[10px] font-outfit-bold uppercase tracking-wider ${getTextColor()}`}>
        {getStatusText()}
      </Text>
    </View>
  );
};
