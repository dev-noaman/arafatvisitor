/**
 * Auth Endpoints
 * Authentication API calls
 */

import { apiClient } from '../api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../../types/api';

/**
 * Login
 * @param credentials - Email and password
 * @returns Login response with tokens and user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

/**
 * Logout
 * @returns Success response
 */
export const logout = async (): Promise<{ success: boolean }> => {
  const response = await apiClient.post<{ success: boolean }>('/api/auth/logout');
  return response.data;
};

/**
 * Refresh token
 * @param refreshToken - Refresh token
 * @returns New access and refresh tokens
 */
export const refreshToken = async (
  _refreshToken: string
): Promise<RefreshTokenResponse> => {
  // Refresh token is sent via httpOnly cookie automatically
  const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh');
  return response.data;
};

/**
 * Forgot password
 * @param email - User email
 * @returns Success response with message
 */
export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
    email,
  });
  return response.data;
};

/**
 * Reset password
 * @param token - Reset token
 * @param newPassword - New password
 * @returns Success response with message
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>('/api/auth/reset-password', {
    token,
    newPassword,
  } as ResetPasswordRequest);
  return response.data;
};
