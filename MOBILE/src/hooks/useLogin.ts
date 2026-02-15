/**
 * useLogin Hook
 * React Query mutation for login with error handling + auto-token-save
 */

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { login as loginApi } from '../services/endpoints/auth';
import type { LoginRequest } from '../types/api';

/**
 * useLogin hook
 * Handles login with React Query mutation
 */
export const useLogin = () => {
  const { setAuth, setLoading, setError } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await loginApi(credentials);
        // Backend returns { token, user } — token is the JWT access token
        // Refresh token is set via httpOnly cookie (not in response body)
        await setAuth(response.user, response.token, '');
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};
