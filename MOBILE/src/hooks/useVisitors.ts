/**
 * useVisitors Hook
 * React Query hook for visitors list with pagination (page, search, status filters)
 */

import { useQuery } from '@tanstack/react-query';
import { getVisitors } from '../services/endpoints/visitors';
import type { Visit } from '../types';

interface UseVisitorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * useVisitors hook
 * Fetches visitors list with pagination, search, and status filtering
 */
export const useVisitors = (params: UseVisitorsParams = {}) => {
  const queryKey = ['visitors', params.page, params.limit, params.search, params.status];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getVisitors(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    visitors: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};
