type GoogleCredentialResponse = {
  credential?: string
}

type GooglePromptNotification = {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void
        }
      }
    }
  }
}

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  import.meta.env.REACT_APP_GOOGLE_CLIENT_ID ??
  ''

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let googleSdkPromise: Promise<void> | null = null

const ensureGoogleSdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google OAuth is not available.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (!googleSdkPromise) {
    googleSdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google?.accounts?.id) {
          resolve()
        } else {
          googleSdkPromise = null
          reject(new Error('Google OAuth SDK loaded without the accounts API.'))
        }
      }
      script.onerror = () => {
        googleSdkPromise = null
        reject(new Error('Failed to load Google OAuth SDK.'))
      }
      document.head.appendChild(script)
    })
  }

  return googleSdkPromise
}

export const isGoogleOAuthReady = () =>
  Boolean(googleClientId && typeof window !== 'undefined' && window.google?.accounts?.id)

export async function getGoogleIdToken() {
  if (!googleClientId) {
    throw new Error('Missing Google client ID.')
  }

  await ensureGoogleSdk()

  return new Promise<string>((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google OAuth is not available.'))
      return
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: GoogleCredentialResponse) => {
        if (response?.credential) {
          resolve(response.credential)
        } else {
          reject(new Error('Google did not return a valid credential.'))
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    window.google.accounts.id.prompt((notification?: GooglePromptNotification) => {
      if (!notification) return
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google sign-in was cancelled.'))
      }
    })
  })
}

export {}
