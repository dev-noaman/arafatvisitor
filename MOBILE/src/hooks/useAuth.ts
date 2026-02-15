/**
 * useAuth Hook
 * Custom hook for authentication state and token refresh logic
 */

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/api';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from '../types/api';

/**
 * useAuth hook
 * Provides authentication state and actions
 */
export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    loadAuth,
    updateToken,
    updateUser,
    setLoading,
    setError,
  } = useAuthStore();

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
      // Backend returns { token, user } — token is the JWT access token
      // Refresh token is set via httpOnly cookie (not in response body)
      await setAuth(response.data.user, response.data.token, '');

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, setError]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      // Call logout endpoint if authenticated
      if (accessToken) {
        await apiClient.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear auth regardless of API call result
      await clearAuth();
      setLoading(false);
    }
  }, [accessToken, clearAuth, setLoading]);

  /**
   * Refresh token function
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      return false;
    }

    try {
      // Refresh token is sent via httpOnly cookie automatically
      const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh');
      updateToken(response.data.token, '');

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear auth and redirect to login
      await clearAuth();
      return false;
    }
  }, [refreshToken, updateToken, clearAuth]);

  /**
   * Load auth on mount
   */
  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    refreshAccessToken,
    updateUser,
  };
};
