import { useState, useEffect } from 'react'
import {
  SmtpSettingsForm,
  WhatsAppSettingsForm,
  SettingsCard,
  TestEmailModal,
  TestWhatsAppModal,
} from '@/components/settings'
import { settingsService, type SmtpSettingsFormData, type WhatsAppSettingsFormData } from '@/services/settings'
import { useToast } from '@/hooks'
import type { Settings } from '@/types'

export default function Settings() {
  const { success, error } = useToast()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false)
  const [isTestWhatsAppModalOpen, setIsTestWhatsAppModalOpen] = useState(false)

  // Fetch settings
  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const data = await settingsService.getSettings()
      setSettings(data)
    } catch (err) {
      error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Handle SMTP settings submit
  const handleSmtpSubmit = async (data: SmtpSettingsFormData) => {
    setIsSaving(true)
    try {
      const updated = await settingsService.updateSmtpSettings(data)
      setSettings(updated)
      success('SMTP settings saved successfully')
    } catch (err) {
      error('Failed to save SMTP settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle WhatsApp settings submit
  const handleWhatsAppSubmit = async (data: WhatsAppSettingsFormData) => {
    setIsSaving(true)
    try {
      const updated = await settingsService.updateWhatsAppSettings(data)
      setSettings(updated)
      success('WhatsApp settings saved successfully')
    } catch (err) {
      error('Failed to save WhatsApp settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle test email
  const handleTestEmail = async (data: { recipientEmail: string }) => {
    setIsTesting(true)
    try {
      await settingsService.testEmailSettings(data)
      success(`Test email sent to ${data.recipientEmail}`)
      setIsTestEmailModalOpen(false)
    } catch (err) {
      error('Failed to send test email. Check your settings.')
    } finally {
      setIsTesting(false)
    }
  }

  // Handle test WhatsApp
  const handleTestWhatsApp = async (data: { recipientPhone: string }) => {
    setIsTesting(true)
    try {
      await settingsService.testWhatsAppSettings(data)
      success(`Test message sent to ${data.recipientPhone}`)
      setIsTestWhatsAppModalOpen(false)
    } catch (err) {
      error('Failed to send test message. Check your settings.')
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load settings</p>
      </div>
    )
  }

  const smtpStatus = settingsService.getSmtpStatusIcon(settings)
  const whatsappStatus = settingsService.getWhatsAppStatusIcon(settings)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure email and messaging services</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* SMTP Settings Card */}
        <SettingsCard
          title="Email (SMTP) Configuration"
          description="Configure email settings for sending notifications and alerts"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          status={smtpStatus.status}
          statusColor={smtpStatus.color}
        >
          <SmtpSettingsForm
            initialData={settings}
            onSubmit={handleSmtpSubmit}
            onTest={() => setIsTestEmailModalOpen(true)}
            isLoading={isSaving}
            isTesting={isTesting}
          />
        </SettingsCard>

        {/* WhatsApp Settings Card */}
        <SettingsCard
          title="WhatsApp Configuration"
          description="Configure WhatsApp integration for sending messages"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          }
          status={whatsappStatus.status}
          statusColor={whatsappStatus.color}
        >
          <WhatsAppSettingsForm
            initialData={settings}
            onSubmit={handleWhatsAppSubmit}
            onTest={() => setIsTestWhatsAppModalOpen(true)}
            isLoading={isSaving}
            isTesting={isTesting}
          />
        </SettingsCard>
      </div>

      {/* Info Section */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Configuration Tips</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Save your settings before testing</li>
              <li>Use the Test buttons to verify your configuration works</li>
              <li>Keep your API keys and passwords secure</li>
              <li>Ensure all required fields are filled for the service to work</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      <TestEmailModal
        isOpen={isTestEmailModalOpen}
        onClose={() => setIsTestEmailModalOpen(false)}
        onSubmit={handleTestEmail}
        isLoading={isTesting}
      />

      {/* Test WhatsApp Modal */}
      <TestWhatsAppModal
        isOpen={isTestWhatsAppModalOpen}
        onClose={() => setIsTestWhatsAppModalOpen(false)}
        onSubmit={handleTestWhatsApp}
        isLoading={isTesting}
      />
    </div>
  )
}
