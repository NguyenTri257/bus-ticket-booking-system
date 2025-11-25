import { useEffect, useState } from 'react'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const isBrowser = typeof window !== 'undefined'

export function useGoogleOAuthReady() {
  const [isReady, setIsReady] = useState(() => (isBrowser ? Boolean(window.google?.accounts?.id) : false))

  useEffect(() => {
    if (!isBrowser || isReady) return

    const handleLoaded = () => setIsReady(Boolean(window.google?.accounts?.id))

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', handleLoaded)
      return () => existingScript.removeEventListener('load', handleLoaded)
    }

    const script = document.createElement('script')
    script.id = 'google-oauth-script'
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', handleLoaded)
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoaded)
    }
  }, [isReady])

  return isReady
}
