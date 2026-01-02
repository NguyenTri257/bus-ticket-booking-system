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

export type { UserPreferences }

export interface UserProfile {
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
    console.log(
      '[updateUserProfile] Sending body:',
      JSON.stringify(body, null, 2)
    )
    console.log(
      '[updateUserProfile] preferences:',
      JSON.stringify(body.preferences, null, 2)
    )
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

// ===== User Service APIs (profile) =====
/**
 * Get current user's profile (user-service)
 */
export const getUserProfileUserService = async (): Promise<UserProfile> => {
  try {
    const response = await request('/users/profile', { method: 'GET' })
    return response.data || response
  } catch (error) {
    console.error('Error fetching user profile (user-service):', error)
    throw error
  }
}

/**
 * Update user's profile (user-service)
 */
// CŨ: Gửi JSON (base64 hoặc url)
// export const updateUserProfileUserService = async (
//   profileData: Partial<UserProfile>
// ): Promise<UserProfile> => {
//   try {
//     const body = { ...profileData }
//     const response = await request('/users/profile', {
//       method: 'PUT',
//       body,
//     })
//     return response.data || response
//   } catch (error) {
//     console.error('Error updating user profile (user-service):', error)
//     throw error
//   }
// }

// MỚI: Gửi FormData nếu có avatarFile (file), còn lại gửi JSON như cũ
import { requestFormData } from './auth'
export const updateUserProfileUserService = async (
  profileData: Partial<UserProfile> & { avatar?: File }
): Promise<UserProfile> => {
  try {
    // Fix: Check if File is defined and avatar is a File
    // Type guard: check if avatar is a File (for environments where instanceof may fail)
    // Type guard: check if avatar is a File without using 'any' or 'instanceof'
    const isFile =
      profileData.avatar &&
      typeof profileData.avatar === 'object' &&
      Object.prototype.toString.call(profileData.avatar) === '[object File]'
    if (isFile) {
      const formData = new FormData()
      formData.append('fullName', profileData.fullName || '')
      formData.append('phone', profileData.phone || '')
      formData.append('avatar', profileData.avatar as File)
      const response = await requestFormData('/users/profile', {
        method: 'PUT',
        body: formData,
      })
      return response.data || response
    } else {
      // fallback: gửi JSON nếu không có file (giữ lại cho các trường hợp không upload ảnh)
      const body = { ...profileData }
      const response = await request('/users/profile', {
        method: 'PUT',
        body,
      })
      return response.data || response
    }
  } catch (error) {
    console.error('Error updating user profile (user-service):', error)
    throw error
  }
}
