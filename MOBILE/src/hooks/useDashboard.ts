/**
 * useDashboard Hook
 * React Query hooks for dashboard data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardKPIs,
  getPendingApprovals,
  getCurrentVisitors,
  approveVisit,
  rejectVisit,
  checkOutVisitor,
  type PendingApprovalItem,
} from '../services/endpoints/dashboard';

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: getDashboardKPIs,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 30000,
  });
};

export const usePendingApprovals = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'pending-approvals', { page, limit }],
    queryFn: () => getPendingApprovals(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCurrentVisitors = (limit = 50) => {
  return useQuery({
    queryKey: ['dashboard', 'current-visitors', { limit }],
    queryFn: () => getCurrentVisitors(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useApproveVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveVisit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useRejectVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectVisit(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useCheckOutVisitor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => checkOutVisitor(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};
