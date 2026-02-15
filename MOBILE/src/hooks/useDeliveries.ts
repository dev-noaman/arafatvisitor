/**
 * useDeliveries Hook
 * React Query hooks for delivery management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeliveries, markPickedUp } from '../services/endpoints/deliveries';
import type { GetDeliveriesParams } from '../types/api';

export const useDeliveries = (params?: GetDeliveriesParams) => {
  return useQuery({
    queryKey: ['deliveries', params],
    queryFn: () => getDeliveries(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMarkPickedUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markPickedUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
