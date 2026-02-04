# Phase 14: Quick Reference Guide

## Accessing the Profile Page

URL: `http://localhost:3000/admin/profile`

The profile page is accessible to all authenticated users.

## File Locations

```
admin/src/
├── services/
│   ├── profile.ts (NEW)
│   └── index.ts (UPDATED - added profileService export)
├── components/
│   └── profile/ (NEW DIRECTORY)
│       ├── ProfileCard.tsx
│       ├── ProfileForm.tsx
│       ├── PasswordChangeForm.tsx
│       ├── PreferencesForm.tsx
│       └── index.ts
├── pages/
│   └── Profile.tsx (UPDATED)
└── types/
    └── index.ts (UPDATED - added ProfileFormData, PreferencesFormData)

PHASE14_SUMMARY.md (NEW - comprehensive documentation)
```

## Component Import Examples

```typescript
// Import all profile components
import {
  ProfileCard,
  ProfileForm,
  PasswordChangeForm,
  PreferencesForm,
} from '@/components/profile'

// Import profile service
import { profileService } from '@/services'

// Use in component
const response = await profileService.getProfile()
const updated = await profileService.updateProfile({ name: 'John' })
const result = await profileService.changePassword({
  oldPassword: 'old',
  newPassword: 'new',
  confirmPassword: 'new'
})
```

## API Service Functions

### Profile Management
```typescript
// Get current user profile
const profile = await profileService.getProfile()
// Returns: User object with id, email, name, role, status, timestamps

// Update profile
await profileService.updateProfile({ name: 'New Name', phone: '+1234567890' })
// Returns: Updated User object

// Change password
await profileService.changePassword({
  oldPassword: 'current',
  newPassword: 'new',
  confirmPassword: 'new'
})
// Returns: { success: true, message: 'Password changed successfully' }
```

### Preferences Management
```typescript
// Get preferences
const prefs = await profileService.getPreferences()
// Returns: { theme: 'auto', language: 'en', notificationsEnabled: true }

// Update preferences
await profileService.updatePreferences({
  theme: 'dark',
  language: 'ar',
  notificationsEnabled: false
})
// Returns: Updated preferences object
```

## Component Props

### ProfileCard
```typescript
interface ProfileCardProps {
  user: User
  isLoading?: boolean
}
```

### ProfileForm
```typescript
interface ProfileFormProps {
  user: User
  onSubmit: (data: ProfileFormData) => Promise<void>
  isLoading?: boolean
}

interface ProfileFormData {
  name?: string
  phone?: string
}
```

### PasswordChangeForm
```typescript
interface PasswordChangeFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>
  isLoading?: boolean
}

interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
```

### PreferencesForm
```typescript
interface PreferencesFormProps {
  initialData?: PreferencesFormData
  onSubmit: (data: PreferencesFormData) => Promise<void>
  isLoading?: boolean
}

interface PreferencesFormData {
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  notificationsEnabled?: boolean
}
```

## Backend API Contract

### Endpoints Required

```
GET /admin/api/profile
Response: { data: User }

PUT /admin/api/profile
Body: { name?: string, phone?: string }
Response: { data: User }

POST /admin/api/profile/change-password
Body: { oldPassword: string, newPassword: string }
Response: { data: { success: boolean, message: string } }

GET /admin/api/profile/preferences
Response: { data: PreferencesFormData }

PUT /admin/api/profile/preferences
Body: { theme?: string, language?: string, notificationsEnabled?: boolean }
Response: { data: PreferencesFormData }
```

## Validation Rules

### Profile Form
- Name: 2-100 characters (required)
- Phone: optional string
- Email: read-only (not in form)

### Password Form
- Old Password: required (non-empty)
- New Password: minimum 8 characters
- Confirm Password: must match new password exactly

### Preferences Form
- Theme: 'light' | 'dark' | 'auto' (optional)
- Language: any string (optional)
- Notifications: boolean (optional)

## Toast Notifications

The component uses `useToast()` for notifications:

```typescript
const { success, error } = useToast()

// Success
success('Profile updated successfully')

// Error
error('Failed to update profile')
```

## Loading States

Each form section has independent loading state:

```typescript
const [isProfileLoading, setIsProfileLoading] = useState(false)
const [isPasswordLoading, setIsPasswordLoading] = useState(false)
const [isPreferencesLoading, setIsPreferencesLoading] = useState(false)
```

When loading is true:
- Form inputs are disabled
- Submit button shows "Saving..." text
- User cannot interact with the form

## Tab Navigation

The Profile page has 3 tabs:

1. **Profile Information**
   - Edit name and phone
   - View email (read-only)
   - Profile card above

2. **Security**
   - Change password
   - Requires current password verification
   - Password visibility toggle

3. **Preferences**
   - Theme selector (Light/Dark/Auto)
   - Language chooser (En/Ar/Fr)
   - Notifications toggle

Tab state is managed by: `activeTab: 'profile' | 'password' | 'preferences'`

## Type Safety

All types are defined in:
- `admin/src/types/index.ts` - User, ProfileFormData, PreferencesFormData
- `admin/src/services/profile.ts` - ChangePasswordData

## Error Handling

### Client-Side Validation
- Zod schemas in form components
- Real-time error messages below fields
- Submit button disabled when errors exist

### Server-Side Errors
- Caught by try/catch in Profile page handlers
- Displayed as error toast
- No sensitive details exposed

### Network Errors
- Automatic redirect to login on 401
- Generic error message to user
- Error message displayed via toast

## Styling Details

### Colors
- Primary button: `bg-blue-600` hover `bg-blue-700`
- Security button: `bg-red-600` hover `bg-red-700`
- Disabled: `bg-gray-400`
- Role badges: Color-coded by role

### Layout
- Max width: 4xl (56rem)
- Responsive grid: 1-2 columns
- Tab layout: Full width with equal columns
- Card styling: White bg, rounded lg, shadow

### Spacing
- Section gaps: 8 (2rem)
- Form gaps: 6 (1.5rem)
- Field gaps: 4 (1rem)

## Testing the Implementation

### Manual Testing Checklist

- [ ] Navigate to /admin/profile
- [ ] Verify profile card shows user info
- [ ] Update name and save
- [ ] Verify email field is read-only
- [ ] Try invalid password (< 8 chars)
- [ ] Try mismatched password confirm
- [ ] Change theme to Dark
- [ ] Change language to Arabic
- [ ] Toggle notifications
- [ ] Verify all changes persist
- [ ] Test error scenarios
- [ ] Check toast notifications appear

### API Testing
- [ ] GET /admin/api/profile returns user
- [ ] PUT /admin/api/profile updates profile
- [ ] POST /admin/api/profile/change-password validates password
- [ ] GET /admin/api/profile/preferences returns prefs
- [ ] PUT /admin/api/profile/preferences saves prefs

## Known Limitations & Future Work

1. **No Profile Picture Upload**
   - Currently shows avatar with initials
   - Can add image upload in future

2. **No Activity Log**
   - Could show login history
   - Could show change timeline

3. **No Two-Factor Authentication**
   - Could add TOTP in Security tab

4. **No Session Management**
   - Could list active sessions
   - Could log out other sessions

5. **No Account Deactivation**
   - Could add dangerous action
   - Would need confirmation

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify API endpoint exists
- Check authentication token is present

### Loading state stuck
- Check network tab for failed requests
- Verify API response format
- Check error messages in console

### Toast not appearing
- Verify Sonner provider in App.tsx
- Check useToast hook is imported correctly
- Verify message is not empty string

### Validation errors not showing
- Check Zod schema matches form fields
- Verify errors are accessed with ?.message
- Check field names match schema

## Additional Resources

- See PHASE14_SUMMARY.md for comprehensive documentation
- See existing Phase 7-13 implementations for patterns
- Review admin/src/services for similar patterns
- Check admin/src/components for UI patterns
