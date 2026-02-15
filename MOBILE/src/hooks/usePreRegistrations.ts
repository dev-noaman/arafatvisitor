/**
 * usePreRegistrations Hook
 * React Query hooks for pre-registration management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPreRegistrations,
  createPreRegistration,
  approvePreRegistration,
  rejectPreRegistration,
  reApprovePreRegistration,
} from '../services/endpoints/preregistrations';
import type { GetPreRegistrationsParams, CreatePreRegistrationRequest } from '../types/api';

export const usePreRegistrations = (params: GetPreRegistrationsParams) => {
  return useQuery({
    queryKey: ['pre-registrations', params],
    queryFn: () => getPreRegistrations(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePreRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePreRegistrationRequest) => createPreRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useApprovePreRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePreRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useRejectPreRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectPreRegistration(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useReApprovePreRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reApprovePreRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};
