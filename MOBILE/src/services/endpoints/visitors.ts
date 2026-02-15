/**
 * Visitors Endpoints
 * Visitor CRUD and check-in/out API calls
 */

import { apiClient } from '../api';
import type {
  GetVisitorsParams,
  CreateVisitRequest,
  UpdateVisitRequest,
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  GetVisitBySessionIdResponse,
} from '../../types/api';
import type { Visit, PaginatedResponse } from '../../types/index';

/**
 * Get visitors list
 * @param params - Query parameters
 * @returns Paginated list of visits
 */
export const getVisitors = async (
  params: GetVisitorsParams
): Promise<PaginatedResponse<Visit>> => {
  const response = await apiClient.get<PaginatedResponse<Visit>>('/admin/api/visitors', {
    params,
  });
  return response.data;
};

/**
 * Create a new visit
 * @param data - Visit data
 * @returns Created visit
 */
export const createVisit = async (
  data: CreateVisitRequest
): Promise<Visit> => {
  const response = await apiClient.post<Visit>('/admin/api/visitors', data);
  return response.data;
};

/**
 * Get visit by ID
 * @param id - Visit ID
 * @returns Visit details
 */
export const getVisitById = async (id: string): Promise<Visit> => {
  const response = await apiClient.get<Visit>(`/admin/api/visitors/${id}`);
  return response.data;
};

/**
 * Update visit
 * @param id - Visit ID
 * @param data - Updated visit data
 * @returns Updated visit
 */
export const updateVisit = async (
  id: string,
  data: UpdateVisitRequest
): Promise<Visit> => {
  const response = await apiClient.put<Visit>(`/admin/api/visitors/${id}`, data);
  return response.data;
};

/**
 * Delete visit
 * @param id - Visit ID
 * @returns Success response
 */
export const deleteVisit = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/admin/api/visitors/${id}`);
  return response.data;
};

/**
 * Check in visitor
 * @param sessionId - Visit session ID
 * @returns Success response
 */
export const checkIn = async (
  sessionId: string
): Promise<CheckInResponse> => {
  const response = await apiClient.post<CheckInResponse>(
    `/visits/${sessionId}/checkin`,
    {} as CheckInRequest
  );
  return response.data;
};

/**
 * Check out visitor
 * @param sessionId - Visit session ID
 * @returns Success response
 */
export const checkOut = async (
  sessionId: string
): Promise<CheckOutResponse> => {
  const response = await apiClient.post<CheckOutResponse>(
    `/visits/${sessionId}/checkout`,
    {} as CheckOutRequest
  );
  return response.data;
};

/**
 * Get visit by session ID (public endpoint)
 * @param sessionId - Visit session ID
 * @returns Visit details
 */
export const getVisitBySessionId = async (
  sessionId: string
): Promise<GetVisitBySessionIdResponse> => {
  const response = await apiClient.get<GetVisitBySessionIdResponse>(
    `/visits/pass/${sessionId}`
  );
  return response.data;
};
