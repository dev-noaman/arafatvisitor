/**
 * Dashboard API endpoints
 */

import { apiClient } from '../api';
import type { DashboardKPIs, Visit } from '../../types';

export interface PendingApprovalItem {
  id: string;
  sessionId: string;
  visitorName: string;
  visitorPhone?: string;
  hostName: string;
  hostCompany: string;
  expectedDate: string;
}

export const getDashboardKPIs = async (): Promise<DashboardKPIs> => {
  const response = await apiClient.get('/admin/api/dashboard/kpis');
  return response.data;
};

export const getPendingApprovals = async (
  page = 1,
  limit = 10
): Promise<PendingApprovalItem[]> => {
  const response = await apiClient.get('/admin/api/dashboard/pending-approvals', {
    params: { page, limit },
  });
  return response.data;
};

export const getCurrentVisitors = async (limit = 50): Promise<Visit[]> => {
  const response = await apiClient.get('/admin/api/dashboard/current-visitors', {
    params: { limit },
  });
  return response.data;
};

export const approveVisit = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/dashboard/approve/${id}`);
  return response.data;
};

export const rejectVisit = async (id: string, reason?: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/dashboard/reject/${id}`, { reason });
  return response.data;
};

export const checkOutVisitor = async (sessionId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/dashboard/checkout/${sessionId}`);
  return response.data;
};
