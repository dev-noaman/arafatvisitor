import { useState } from 'react'
import { z } from 'zod'

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
  initialData?: PreferencesFormData
  onSubmit: (data: PreferencesFormData) => Promise<void>
  isLoading?: boolean
}

export default function PreferencesForm({
  initialData,
  onSubmit,
  isLoading,
}: PreferencesFormProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(initialData?.theme || 'auto')
  const [language, setLanguage] = useState(initialData?.language || 'en')
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialData?.notificationsEnabled !== false
  )

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      theme,
      language,
      notificationsEnabled,
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Theme Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Theme Preference</label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as const).map((themeOption) => (
            <button
              key={themeOption}
              type="button"
              onClick={() => setTheme(themeOption)}
              disabled={isLoading}
              className={`p-4 rounded-lg border-2 transition ${
                theme === themeOption
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-2">
                {themeOption === 'light' && (
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v3m0 14v3M4.22 4.22l2.12 2.12m9.32 9.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m9.32-9.32l2.12-2.12" />
                  </svg>
                )}
                {themeOption === 'dark' && (
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
                {themeOption === 'auto' && (
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                )}
                <span className="text-xs font-medium capitalize">{themeOption}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="ar">العربية (Arabic)</option>
          <option value="fr">Français (French)</option>
        </select>
      </div>

      {/* Notifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Notifications</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Enable system notifications</span>
          </label>
          <p className="text-xs text-gray-600 ml-7">
            Receive notifications for important updates and events
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  )
}
