import { api } from './api'
import type { Settings } from '@/types'

export interface SmtpSettingsFormData {
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPassword?: string
  smtpFrom?: string
}

export interface WhatsAppSettingsFormData {
  whatsappApiKey?: string
  whatsappPhoneNumber?: string
}

export interface TestEmailData {
  recipientEmail: string
}

export interface TestWhatsAppData {
  recipientPhone: string
}

export const getSettings = async () => {
  const response = await api.get<Settings>('/admin/api/settings')
  return response
}

export const updateSmtpSettings = async (data: SmtpSettingsFormData) => {
  const response = await api.put<Settings>('/admin/api/settings/smtp', data)
  return response
}

export const updateWhatsAppSettings = async (data: WhatsAppSettingsFormData) => {
  const response = await api.put<Settings>('/admin/api/settings/whatsapp', data)
  return response
}

export const testEmailSettings = async (data: TestEmailData) => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/admin/api/settings/test-email',
    data
  )
  return response
}

export const testWhatsAppSettings = async (data: TestWhatsAppData) => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/admin/api/settings/test-whatsapp',
    data
  )
  return response
}

export const getSmtpStatusIcon = (
  settings: Settings
): { status: 'configured' | 'incomplete' | 'empty'; color: string } => {
  if (!settings.smtpHost) {
    return { status: 'empty', color: 'text-gray-400' }
  }
  if (
    settings.smtpHost &&
    settings.smtpPort &&
    settings.smtpUser &&
    settings.smtpFrom
  ) {
    return { status: 'configured', color: 'text-green-600' }
  }
  return { status: 'incomplete', color: 'text-yellow-600' }
}

export const getWhatsAppStatusIcon = (
  settings: Settings
): { status: 'configured' | 'incomplete' | 'empty'; color: string } => {
  if (!settings.whatsappApiKey) {
    return { status: 'empty', color: 'text-gray-400' }
  }
  if (settings.whatsappApiKey && settings.whatsappPhoneNumber) {
    return { status: 'configured', color: 'text-green-600' }
  }
  return { status: 'incomplete', color: 'text-yellow-600' }
}

// Export settingsService object for components that import { settingsService }
export const settingsService = {
  getSettings,
  updateSmtpSettings,
  updateWhatsAppSettings,
  testEmailSettings,
  testWhatsAppSettings,
  getSmtpStatusIcon,
  getWhatsAppStatusIcon,
}
