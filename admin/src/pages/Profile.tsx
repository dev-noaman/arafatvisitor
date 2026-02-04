import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  ProfileCard,
  ProfileForm,
  PasswordChangeForm,
  PreferencesForm,
} from '@/components/profile'
import { profileService } from '@/services'
import type { User, ProfileFormData, PreferencesFormData } from '@/types'
import type { ChangePasswordData } from '@/services/profile'

export default function Profile() {
  const { success, error } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<PreferencesFormData | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true)
      try {
        const response = await profileService.getProfile()
        setUser(response.data || (response as any))
      } catch (err: any) {
        error(err?.message || 'Failed to load profile')
      } finally {
        setIsProfileLoading(false)
      }
    }

    const fetchPreferences = async () => {
      try {
        const response = await profileService.getPreferences()
        setPreferences(response.data || (response as any))
      } catch {
        // Preferences might not exist, that's okay
        setPreferences({
          theme: 'auto',
          language: 'en',
          notificationsEnabled: true,
        })
      }
    }

    fetchProfile()
    fetchPreferences()
  }, [])

  // Handle profile update
  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsProfileLoading(true)
    try {
      const response = await profileService.updateProfile(data)
      setUser(response.data || (response as any))
      success('Profile updated successfully')
    } catch (err: any) {
      error(err?.message || 'Failed to update profile')
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (data: ChangePasswordData) => {
    setIsPasswordLoading(true)
    try {
      await profileService.changePassword(data)
      success('Password changed successfully')
    } catch (err: any) {
      error(err?.message || 'Failed to change password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  // Handle preferences update
  const handlePreferencesUpdate = async (data: PreferencesFormData) => {
    setIsPreferencesLoading(true)
    try {
      const response = await profileService.updatePreferences(data)
      setPreferences(response.data || (response as any))
      success('Preferences saved successfully')
    } catch (err: any) {
      error(err?.message || 'Failed to save preferences')
    } finally {
      setIsPreferencesLoading(false)
    }
  }

  if (isProfileLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-300 rounded w-1/3" />
            <div className="bg-white rounded-lg shadow p-6 h-32" />
            <div className="bg-white rounded-lg shadow p-6 h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load profile. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <ProfileCard user={user} isLoading={isProfileLoading} />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 flex gap-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Profile Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'password'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Security
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Preferences
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Update your name and contact information
                  </p>
                </div>
                <ProfileForm user={user} onSubmit={handleProfileUpdate} isLoading={isProfileLoading} />
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Update your password to keep your account secure
                  </p>
                </div>
                <PasswordChangeForm onSubmit={handlePasswordChange} isLoading={isPasswordLoading} />
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Customize your experience and notification settings
                  </p>
                </div>
                <PreferencesForm
                  initialData={preferences || undefined}
                  onSubmit={handlePreferencesUpdate}
                  isLoading={isPreferencesLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
