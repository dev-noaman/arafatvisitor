/**
 * VisitorsListScreen
 * List all visitors with pagination and search/filter
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisitors } from '../../hooks/useVisitors';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { VisitorCard } from '../../components/visitor/VisitorCard';
import { EmptyState } from '../../components/common/EmptyState';

const STATUS_FILTERS = ['ALL', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT'];

export default function VisitorsListScreen() {
  const navigation = useNavigation<any>();
  const { isConnected } = useNetworkStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 500);
  }, []);

  const { visitors, isLoading, error, refetch } = useVisitors({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const handleVisitorPress = (visitor: any) => {
    navigation.navigate('VisitorDetail', { sessionId: visitor.sessionId });
  };

  const renderVisitor = ({ item }: { item: any }) => (
    <VisitorCard visitor={item} onPress={() => handleVisitorPress(item)} />
  );

  const resultCountText = isConnected
    ? `Showing ${visitors.length} ${visitors.length !== 1 ? 'visitors' : 'visitor'}`
    : 'Offline — showing cached results';

  function renderContent() {
    if (isLoading && visitors.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color="#465FFF" />
        </View>
      );
    }

    if (error && visitors.length === 0) {
      return (
        <EmptyState
          title="Failed to load visitors"
          description={isConnected ? 'Something went wrong.' : 'You are offline.'}
          icon="⚠️"
          actionLabel="Retry"
          onAction={refetch}
        />
      );
    }

    if (visitors.length === 0 && !isLoading) {
      return (
        <EmptyState
          title={
            debouncedSearch
              ? `No visitors found for "${debouncedSearch}"`
              : 'No visitors found'
          }
          icon="👤"
        />
      );
    }

    return (
      <FlatList
        data={visitors}
        renderItem={renderVisitor}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 pb-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#465FFF" />
        }
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg" edges={['top']}>
      {/* Header & Search */}
      <View className="px-6 py-4 bg-white dark:bg-dark-bg z-10 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-3xl font-outfit-bold text-gray-900 dark:text-white mb-6">
          Visits
        </Text>

        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            className={`h-12 bg-gray-50 dark:bg-dark-card rounded-2xl px-5 text-base font-outfit text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-brand-500 ${!isConnected ? 'opacity-50' : ''}`}
            placeholder={isConnected ? 'Search visitors...' : 'Search disabled offline'}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearchChange}
            editable={isConnected}
            autoCapitalize="none"
          />
        </View>

        {/* Filter Chips */}
        <View className="flex-row flex-wrap gap-2.5">
          {STATUS_FILTERS.map((status) => {
            const isActive = statusFilter === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full border ${isActive
                  ? 'bg-brand-600 border-brand-600'
                  : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700'
                  }`}
              >
                <Text
                  className={`text-xs font-outfit-bold tracking-wide ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result Count */}
        {!isLoading && !error && (
          <Text className="text-xs font-outfit text-gray-400 dark:text-gray-500 mt-4 ml-1">
            {resultCountText}
          </Text>
        )}
      </View>

      {/* List Content */}
      <View className="flex-1 bg-gray-50 dark:bg-dark-bg px-4 pt-4">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
