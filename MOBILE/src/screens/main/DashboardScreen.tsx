/**
 * DashboardScreen
 * Main dashboard matching Stitch design specs
 * Features: KPI cards with left border accent, 2-button quick actions, recent activity
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDashboardKPIs, usePendingApprovals, useCurrentVisitors } from '../../hooks/useDashboard';
import { StatusBadge } from '../../components/visitor/StatusBadge';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const user = useAuthStore((s) => s.user);

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

  if (kpisLoading && !kpis) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-dark-bg p-8">
        <ActivityIndicator size="large" color="#465FFF" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400 font-outfit">Loading dashboard...</Text>
      </View>
    );
  }

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
      {/* Sticky Header — per Stitch */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white">Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465FFF" />}
      >
        {/* Greeting — per Stitch */}
        <View className="px-6 mb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400 font-outfit mb-1">{dateStr}</Text>
          <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Welcome'}
          </Text>
        </View>

        {/* KPI Grid — per Stitch: 2x2 with border-l-4 accent */}
        <View className="flex-row flex-wrap px-4 gap-3 mb-8">
          <KpiCard
            title="Today's Visitors"
            value={kpis?.visitsToday ?? 0}
            iconName="group"
            borderColor="#0BA5EC"
            iconBg="bg-blue-light-50"
            iconColor="#0BA5EC"
          />
          <KpiCard
            title="Checked In"
            value={currentVisitors?.length ?? 0}
            iconName="login"
            borderColor="#12B76A"
            iconBg="bg-success-50"
            iconColor="#12B76A"
          />
          <KpiCard
            title="Today's Deliveries"
            value={kpis?.deliveriesToday ?? 0}
            iconName="local-shipping"
            borderColor="#F79009"
            iconBg="bg-warning-50"
            iconColor="#F79009"
          />
          <KpiCard
            title="Pending Approval"
            value={pendingData?.length ?? 0}
            iconName="pending-actions"
            borderColor="#F04438"
            iconBg="bg-error-50"
            iconColor="#F04438"
          />
        </View>

        {/* Quick Actions — per Stitch: 2 buttons, primary filled + outlined */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-outfit-semibold text-gray-900 dark:text-white mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-brand-500 rounded-xl"
              style={{ shadowColor: '#465FFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 }}
              onPress={() => navigation.getParent()?.navigate('QRScanTab')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
              <Text className="text-white font-outfit-medium">Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-white dark:bg-dark-card border border-brand-500 rounded-xl"
              onPress={() => navigation.navigate('PreRegisterList')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="person-add" size={20} color="#465FFF" />
              <Text className="text-brand-500 font-outfit-medium">Pre-Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity — per Stitch */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-outfit-semibold text-gray-900 dark:text-white">Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('VisitorsTab')}>
              <Text className="text-sm text-brand-500 font-outfit-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {pendingData?.map((visit: any) => (
              <VisitorItem
                key={`pending-${visit.id}`}
                visitor={visit}
                statusOverride="PENDING_APPROVAL"
                onPress={() => navigateToVisitor(visit)}
              />
            ))}

            {currentVisitors?.map((visitor: any) => (
              <VisitorItem
                key={`current-${visitor.id}`}
                visitor={visitor}
                statusOverride="CHECKED_IN"
                onPress={() => navigateToVisitor(visitor)}
              />
            ))}

            {(!currentVisitors?.length && !pendingData?.length) && (
              <View className="bg-white dark:bg-dark-card rounded-xl p-8 items-center border border-gray-100 dark:border-gray-800">
                <Text className="text-gray-400 dark:text-gray-500 font-outfit">No recent activity</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// KPI Card — per Stitch: white card, left colored border, icon in colored bg
const KpiCard = ({ title, value, iconName, borderColor, iconBg, iconColor }: any) => (
  <View
    className="w-[48%] bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-gray-800"
    style={{
      borderLeftWidth: 4,
      borderLeftColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    }}
  >
    <View className={`w-10 h-10 rounded-lg items-center justify-center mb-2 ${iconBg}`}>
      <MaterialIcons name={iconName} size={20} color={iconColor} />
    </View>
    <Text className="text-xs text-gray-500 dark:text-gray-400 font-outfit-medium">{title}</Text>
    <Text className="text-2xl font-outfit-bold text-gray-900 dark:text-white mt-1">{value}</Text>
  </View>
);

// Visitor Item — per Stitch: white card with avatar initials, name, subtitle, time
const VisitorItem = ({ visitor, statusOverride, onPress }: any) => {
  const initials = visitor.visitorName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-gray-800"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 bg-blue-light-50 rounded-full items-center justify-center mr-4">
        <Text className="text-blue-light-700 font-outfit-bold text-sm">{initials}</Text>
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-sm font-outfit-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {visitor.visitorName}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 font-outfit mt-0.5" numberOfLines={1}>
          {visitor.visitorCompany || visitor.hostName}
        </Text>
      </View>
      <StatusBadge status={statusOverride || visitor.status} />
    </TouchableOpacity>
  );
};
