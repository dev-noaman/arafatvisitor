/**
 * useHosts Hook
 * React Query hooks for host search and listing
 */

import { useQuery } from '@tanstack/react-query';
import { getHosts, searchHosts } from '../services/endpoints/hosts';
import type { GetHostsParams } from '../types/api';

export const useHosts = (params?: GetHostsParams) => {
  return useQuery({
    queryKey: ['hosts', params],
    queryFn: () => getHosts(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchHosts = (search: string, type?: string) => {
  return useQuery({
    queryKey: ['hosts', 'search', { search, type }],
    queryFn: () => searchHosts(search, type),
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};
