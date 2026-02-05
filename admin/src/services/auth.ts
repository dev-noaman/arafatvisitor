import { get, post } from './api'
import { User, LoginCredentials, LoginResponse } from '@/types'

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/auth/login', credentials)
  return (response as any).data || response
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await post<{ message: string }>('/auth/forgot-password', { email })
  return (response as any).data || response
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await post<{ message: string }>('/auth/reset-password', {
    token,
    newPassword,
  })
  return (response as any).data || response
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  const response = await get<User>('/admin/api/profile')
  return (response as any).data || response
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await post<User>('/admin/api/profile/update', data)
  return (response as any).data || response
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  userEmail: string
): Promise<{ message: string }> {
  const response = await post<{ message: string }>('/admin/api/change-password', {
    currentPassword,
    newPassword,
    userEmail,
  })
  return (response as any).data || response
}
