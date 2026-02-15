/**
 * Hosts API endpoints
 */

import { apiClient } from '../api';
import type { Host, PaginatedResponse } from '../../types';
import type { GetHostsParams } from '../../types/api';

export const getHosts = async (
  params?: GetHostsParams
): Promise<PaginatedResponse<Host>> => {
  const response = await apiClient.get('/admin/api/hosts', { params });
  return response.data;
};

export const getHostById = async (id: string): Promise<Host> => {
  const response = await apiClient.get(`/admin/api/hosts/${id}`);
  return response.data;
};

export const searchHosts = async (
  search: string,
  type?: string
): Promise<PaginatedResponse<Host>> => {
  const response = await apiClient.get('/admin/api/hosts', {
    params: { search, type, limit: 50 },
  });
  return response.data;
};
