/**
 * useChangePassword Hook
 * React Query mutation for password change
 */

import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../services/endpoints/profile';
import type { ChangePasswordRequest } from '../types/api';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};
