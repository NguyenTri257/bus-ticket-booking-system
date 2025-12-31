import { strongPasswordPattern } from '../lib/validation'
import { request } from './auth'
/**
 * Change user password
 */
export const changeUserPassword = async (data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<{ success?: boolean; message?: string }> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('New password and confirm password do not match.')
  }
  if (!strongPasswordPattern.test(data.newPassword)) {
    throw new Error(
      'New password must include upper, lower, number, special char, min 8 chars.'
    )
  }
  const response = await request('/users/change-password', {
    method: 'POST',
    body: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    },
  })
  return response.data || response
}

interface NotificationPreference {
  email: boolean
  sms: boolean
}

interface UserPreferences {
  notifications: {
    bookingConfirmations: NotificationPreference
    tripReminders: NotificationPreference
    tripUpdates: NotificationPreference
    promotionalEmails: boolean
  }
}

interface UserProfile {
  userId: string | number
  email: string
  phone: string
  fullName: string
  role: string
  avatar?: string
  emailVerified: boolean
  phoneVerified: boolean
  preferences: UserPreferences
  createdAt: string
}

/**
 * Get current user's profile with preferences
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await request('/auth/me', { method: 'GET' })
    return response.data || response
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Update user's profile and preferences
 */
export const updateUserProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const body = { ...profileData }
    const response = await request('/auth/me', {
      method: 'PUT',
      body,
    })
    return response.data || response
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Helper: convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get default user preferences template
 */
export const getDefaultPreferences = (): UserPreferences => {
  return {
    notifications: {
      bookingConfirmations: { email: true, sms: false },
      tripReminders: { email: true, sms: false },
      tripUpdates: { email: true, sms: false },
      promotionalEmails: false,
    },
  }
}
