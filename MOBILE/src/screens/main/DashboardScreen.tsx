/**
 * DashboardScreen
 * Main dashboard with KPIs, pending approvals, and current visitors
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDashboardKPIs, usePendingApprovals, useCurrentVisitors } from '../../hooks/useDashboard';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { useUIStore } from '../../store/uiStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const isDarkMode = useUIStore((s) => s.isDarkMode);

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useDashboardKPIs();
  const { data: pendingData, refetch: refetchPending } = usePendingApprovals(1, 5);
  const { data: currentVisitors, refetch: refetchVisitors } = useCurrentVisitors(10);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchKpis(), refetchPending(), refetchVisitors()]);
    setRefreshing(false);
  };

  const navigateToVisitor = (visit: any) => {
    navigation.navigate('VisitorDetail', { sessionId: visit.sessionId || visit.id });
  };

  const LoadingState = () => (
    <View className="flex-1 justify-center items-center bg-white dark:bg-dark-bg p-8">
      <ActivityIndicator size="large" color="#465FFF" />
      <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard...</Text>
    </View>
  );

  if (kpisLoading && !kpis) return <LoadingState />;

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465FFF" />}
      >
        {/* Header */}
        <View className="px-6 mb-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-outfit uppercase tracking-wider mb-1">
            {dateStr}
          </Text>
          <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white">
            Good Morning, <Text className="text-brand-500">Admin</Text>
          </Text>
        </View>

        {/* KPI Grid */}
        <View className="flex-row flex-wrap px-4 gap-3 mb-8">
          <KpiCard
            title="Today's Visitors"
            value={kpis?.todaysVisitors || 0}
            icon="👥"
            color="brand"
          />
          <KpiCard
            title="Checked In"
            value={kpis?.checkedIn || 0}
            icon="📍"
            color="success"
          />
          <KpiCard
            title="Today's Deliveries"
            value="8" // Placeholder
            icon="📦"
            color="orange"
            isPlaceholder
          />
          <KpiCard
            title="Overstay"
            value="4" // Placeholder
            icon="⚠️"
            color="error"
            isPlaceholder
          />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            <View className="flex-row gap-4">
              <ActionButton
                title="Scan QR"
                icon="qr-code-scanner" // Material Icon name (conceptual)
                color="bg-brand-500"
                onPress={() => navigation.getParent()?.navigate('QRScanTab')}
              />
              <ActionButton
                title="Pre-Register"
                icon="assignment"
                color="bg-brand-600"
                onPress={() => navigation.getParent()?.navigate('PreRegisterTab')}
              />
              <ActionButton
                title="Visitors"
                icon="group"
                color="bg-gray-800"
                onPress={() => navigation.getParent()?.navigate('VisitorsTab')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View className="px-6">
          <Text className="text-xl font-outfit-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </Text>

          {/* Combined List for "Activity" feel */}
          <View>
            {/* Show pending first as priority */}
            {pendingData?.data?.map((visit: any) => (
              <VisitorItem
                key={`pending-${visit.id}`}
                visitor={visit}
                statusOverride="PENDING_APPROVAL"
                onPress={() => navigateToVisitor(visit)}
              />
            ))}

            {/* Then current visitors */}
            {currentVisitors?.map((visitor: any) => (
              <VisitorItem
                key={`current-${visitor.id}`}
                visitor={visitor}
                onPress={() => navigateToVisitor(visitor)}
              />
            ))}

            {(!currentVisitors?.length && !pendingData?.data?.length) && (
              <View className="bg-white dark:bg-dark-card rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-800">
                <Text className="text-gray-400 dark:text-gray-500 font-outfit">No recent activity</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
const KpiCard = ({ title, value, icon, color, isPlaceholder }: any) => {
  const textColors: any = {
    brand: 'text-brand-600 dark:text-brand-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  const bgColors: any = {
    brand: 'bg-brand-50 dark:bg-brand-900/20',
    success: 'bg-success-50 dark:bg-success-900/20',
    warning: 'bg-warning-50 dark:bg-warning-900/20',
    error: 'bg-error-50 dark:bg-error-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <View className="w-[48%] bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${bgColors[color] || bgColors.brand}`}>
        <Text className="text-lg">{icon}</Text>
      </View>
      <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white mb-1">{value}</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-outfit-medium">{title}</Text>
      {isPlaceholder && (
        <Text className="absolute top-4 right-4 text-[10px] text-gray-300">DEMO</Text>
      )}
    </View>
  );
};

const ActionButton = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity
    className={`${color} w-28 h-28 rounded-2xl justify-between p-4 shadow-lg shadow-brand-500/20`}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
      {/* Real icon would go here */}
      <Text className="text-white text-lg">⚡</Text>
    </View>
    <Text className="text-white font-outfit-bold text-sm">{title}</Text>
  </TouchableOpacity>
);

const VisitorItem = ({ visitor, statusOverride, onPress }: any) => {
  const initials = visitor.visitorName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white dark:bg-dark-card p-4 rounded-2xl mb-3 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-4">
        <Text className="text-gray-600 dark:text-gray-300 font-outfit-bold text-sm">{initials}</Text>
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-base font-outfit-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {visitor.visitorName}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 font-outfit mt-0.5" numberOfLines={1}>
          {visitor.visitorCompany || visitor.hostName}
        </Text>
      </View>
      <StatusBadge status={statusOverride || visitor.status} />
    </TouchableOpacity>
  );
};
