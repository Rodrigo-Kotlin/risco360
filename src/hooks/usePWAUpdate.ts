import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/useToast'

export interface UsePWAUpdateReturn {
  updateAvailable: boolean
  update: () => Promise<void>
  dismiss: () => void
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const isUpdated = localStorage.getItem('pwa_updated')
    if (isUpdated === 'true') {
      localStorage.removeItem('pwa_updated')
      toast('Aplicação atualizada com sucesso', 'success')
    }
  }, [toast])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return

    let registration: ServiceWorkerRegistration | undefined
    let installingWorker: ServiceWorker | null = null

    const handleStateChange = () => {
      if (installingWorker && installingWorker.state === 'installed') {
        setUpdateAvailable(true)
      }
    }

    const handleUpdateFound = () => {
      if (registration) {
        if (installingWorker) {
          installingWorker.removeEventListener('statechange', handleStateChange)
        }
        installingWorker = registration.installing
        if (installingWorker) {
          installingWorker.addEventListener('statechange', handleStateChange)
        }
      }
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      registration = reg

      if (reg.waiting) {
        setUpdateAvailable(true)
      }

      reg.addEventListener('updatefound', handleUpdateFound)
      
      // If there's an installing worker right now, listen to its state change
      if (reg.installing) {
        installingWorker = reg.installing
        installingWorker.addEventListener('statechange', handleStateChange)
      }
    })

    const handleControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', handleUpdateFound)
      }
      if (installingWorker) {
        installingWorker.removeEventListener('statechange', handleStateChange)
      }
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [])

  const update = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg?.waiting) {
      localStorage.setItem('pwa_updated', 'true')
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      // Fallback reload if worker is not found
      window.location.reload()
    }
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  return {
    updateAvailable: updateAvailable && !dismissed,
    update,
    dismiss,
  }
}
