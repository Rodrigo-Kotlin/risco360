import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/useToast'

const PWA_UPDATED_KEY = 'risco360_pwa_updated'
const UPDATE_IN_PROGRESS_KEY = 'risco360_update_in_progress'

export interface UsePWAUpdateReturn {
  updateAvailable: boolean
  update: () => Promise<void>
  dismiss: () => void
  checkForUpdates: () => Promise<void>
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const reloadingRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    const justUpdated = sessionStorage.getItem(PWA_UPDATED_KEY)
    if (justUpdated === 'true') {
      sessionStorage.removeItem(PWA_UPDATED_KEY)
      toast('Aplicação atualizada com sucesso', 'success')
    }
  }, [toast])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return

    let registration: ServiceWorkerRegistration | null = null
    let installingWorker: ServiceWorker | null = null

    const handleStateChange = () => {
      if (installingWorker && installingWorker.state === 'installed') {
        setUpdateAvailable(true)
      }
    }

    const handleUpdateFound = () => {
      if (installingWorker) {
        installingWorker.removeEventListener('statechange', handleStateChange)
      }
      installingWorker = registration?.installing ?? null
      if (installingWorker) {
        installingWorker.addEventListener('statechange', handleStateChange)
      }
    }

    const handleControllerChange = () => {
      if (sessionStorage.getItem(UPDATE_IN_PROGRESS_KEY) === 'true' && !reloadingRef.current) {
        reloadingRef.current = true
        sessionStorage.removeItem(UPDATE_IN_PROGRESS_KEY)
        sessionStorage.setItem(PWA_UPDATED_KEY, 'true')
        window.location.reload()
      }
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      registration = reg
      registrationRef.current = reg

      if (reg.waiting) {
        setUpdateAvailable(true)
      }

      reg.addEventListener('updatefound', handleUpdateFound)

      if (reg.installing) {
        installingWorker = reg.installing
        installingWorker.addEventListener('statechange', handleStateChange)
      }
    })

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
    const reg = registrationRef.current ?? await navigator.serviceWorker.getRegistration()
    if (reg?.waiting) {
      sessionStorage.setItem(UPDATE_IN_PROGRESS_KEY, 'true')
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  const checkForUpdates = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
      toast('Não foi possível verificar atualizações.', 'error')
      return
    }

    const reg = registrationRef.current ?? await navigator.serviceWorker.getRegistration()
    if (!reg) {
      toast('Não foi possível verificar atualizações.', 'error')
      return
    }

    if (reg.waiting) {
      setUpdateAvailable(true)
      setDismissed(false)
      toast('Nova versão disponível!', 'info')
      return
    }

    await reg.update()

    if (reg.waiting) {
      setUpdateAvailable(true)
      setDismissed(false)
    } else if (!reg.installing) {
      toast('Você já está usando a versão mais recente.', 'success')
    }
  }, [toast])

  return {
    updateAvailable: updateAvailable && !dismissed,
    update,
    dismiss,
    checkForUpdates,
  }
}
