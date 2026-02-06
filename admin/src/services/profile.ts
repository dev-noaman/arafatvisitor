import { api } from './api'
import type { User } from '@/types'

export interface ProfileFormData {
  name?: string
  phone?: string
}

export interface PreferencesFormData {
  theme?: 'light' | 'dark'
  notificationsEnabled?: boolean
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await api.get<User>('/admin/api/profile')
  return response
}

/**
 * Update user profile
 */
export const updateProfile = async (data: ProfileFormData) => {
  const response = await api.put<User>('/admin/api/profile', data)
  return response
}

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/admin/api/profile/change-password',
    {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    }
  )
  return response
}

/**
 * Get user preferences
 */
export const getPreferences = async () => {
  const response = await api.get<PreferencesFormData>('/admin/api/profile/preferences')
  return response
}

/**
 * Update user preferences
 */
export const updatePreferences = async (data: PreferencesFormData) => {
  const response = await api.put<PreferencesFormData>('/admin/api/profile/preferences', data)
  return response
}
