/**
 * Profile API endpoints
 */

import { apiClient } from '../api';
import type { ChangePasswordRequest, ChangePasswordResponse } from '../../types/api';

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post('/admin/api/change-password', data);
  return response.data;
};
