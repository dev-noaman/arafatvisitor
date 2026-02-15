/**
 * useLookups Hook
 * React Query hooks for lookup data (purposes, delivery types, couriers, locations)
 */

import { useQuery } from '@tanstack/react-query';
import { getPurposes, getDeliveryTypes, getCouriers, getLocations } from '../services/endpoints/lookups';

export const usePurposes = () => {
  return useQuery({
    queryKey: ['lookups', 'purposes'],
    queryFn: getPurposes,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 120,
  });
};

export const useDeliveryTypes = () => {
  return useQuery({
    queryKey: ['lookups', 'delivery-types'],
    queryFn: getDeliveryTypes,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  });
};

export const useCouriers = () => {
  return useQuery({
    queryKey: ['lookups', 'couriers'],
    queryFn: getCouriers,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['lookups', 'locations'],
    queryFn: getLocations,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  });
};
