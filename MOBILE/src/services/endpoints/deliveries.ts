/**
 * Deliveries API endpoints
 */

import { apiClient } from '../api';
import type { Delivery, PaginatedResponse } from '../../types';
import type { GetDeliveriesParams, CreateDeliveryRequest, UpdateDeliveryRequest } from '../../types/api';

export const getDeliveries = async (
  params?: GetDeliveriesParams
): Promise<PaginatedResponse<Delivery>> => {
  const response = await apiClient.get('/admin/api/deliveries', { params });
  return response.data;
};

export const createDelivery = async (data: CreateDeliveryRequest): Promise<Delivery> => {
  const response = await apiClient.post('/admin/api/deliveries', data);
  return response.data;
};

export const updateDelivery = async (
  id: string,
  data: UpdateDeliveryRequest
): Promise<Delivery> => {
  const response = await apiClient.put(`/admin/api/deliveries/${id}`, data);
  return response.data;
};

export const deleteDelivery = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/admin/api/deliveries/${id}`);
  return response.data;
};

export const markPickedUp = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/admin/api/deliveries/${id}/mark-picked-up`);
  return response.data;
};
