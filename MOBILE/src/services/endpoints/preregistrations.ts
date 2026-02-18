/**
 * Pre-Registration API endpoints
 */

import { apiClient } from '../api';
import type { PreRegistration, PaginatedResponse } from '../../types';
import type {
  GetPreRegistrationsParams,
  CreatePreRegistrationRequest,
  UpdatePreRegistrationRequest,
} from '../../types/api';

export const getPreRegistrations = async (
  params: GetPreRegistrationsParams
): Promise<PaginatedResponse<PreRegistration>> => {
  const response = await apiClient.get('/admin/api/pre-registrations', { params });
  return response.data;
};

export const createPreRegistration = async (
  data: CreatePreRegistrationRequest
): Promise<PreRegistration> => {
  const response = await apiClient.post('/admin/api/pre-registrations', data);
  return response.data;
};

export const updatePreRegistration = async (
  id: string,
  data: UpdatePreRegistrationRequest
): Promise<PreRegistration> => {
  const response = await apiClient.put(`/admin/api/pre-registrations/${id}`, data);
  return response.data;
};

export const deletePreRegistration = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/admin/api/pre-registrations/${id}`);
  return response.data;
};

export const approvePreRegistration = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/pre-registrations/${id}/approve`);
  return response.data;
};

export const rejectPreRegistration = async (
  id: string,
  reason?: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/pre-registrations/${id}/reject`, { reason });
  return response.data;
};

export const reApprovePreRegistration = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/pre-registrations/${id}/re-approve`);
  return response.data;
};
