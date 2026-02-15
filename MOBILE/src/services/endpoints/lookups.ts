/**
 * Lookups API endpoints
 */

import { apiClient } from '../api';
import type {
  GetPurposesResponse,
  GetDeliveryTypesResponse,
  GetCouriersResponse,
  GetLocationsResponse,
} from '../../types/api';

export const getPurposes = async (): Promise<GetPurposesResponse> => {
  const response = await apiClient.get('/admin/api/lookups/purposes');
  return response.data;
};

export const getDeliveryTypes = async (): Promise<GetDeliveryTypesResponse> => {
  const response = await apiClient.get('/admin/api/lookups/delivery-types');
  return response.data;
};

export const getCouriers = async (): Promise<GetCouriersResponse> => {
  const response = await apiClient.get('/admin/api/lookups/couriers');
  return response.data;
};

export const getLocations = async (): Promise<GetLocationsResponse> => {
  const response = await apiClient.get('/admin/api/lookups/locations');
  return response.data;
};
