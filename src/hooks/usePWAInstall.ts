import { useState, useEffect, useCallback } from 'react'
import type { BeforeInstallPromptEvent } from '@/types/pwa'

interface UsePWAInstallReturn {
  canInstall: boolean
  install: () => Promise<boolean>
  dismiss: () => void
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function handler(e: BeforeInstallPromptEvent) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDeferredPrompt(null)
    setDismissed(true)
  }, [])

  return {
    canInstall: deferredPrompt !== null && !dismissed,
    install,
    dismiss,
  }
}
