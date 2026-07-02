import { useState, useCallback, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { ToastContext, type ToastOptions } from '@/hooks/useToast'
import type { ToastVariant } from '@/types/ui'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  persistent: boolean
}

const iconMap: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={18} aria-hidden="true" />,
  error:   <AlertCircle size={18} aria-hidden="true" />,
  warning: <AlertTriangle size={18} aria-hidden="true" />,
  info:    <Info size={18} aria-hidden="true" />,
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-success text-white',
  error:   'bg-danger text-white',
  warning: 'bg-warning text-white',
  info:    'bg-info text-white',
}

const defaultVariantDuration: Partial<Record<ToastVariant, number>> = {
  error: 6000,
  warning: 6000,
}

interface ToastProviderProps {
  children: ReactNode
  duration?: number
  variantDurations?: Partial<Record<ToastVariant, number>>
}

export function ToastProvider({
  children,
  duration: defaultDuration = 4500,
  variantDurations = defaultVariantDuration,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const scheduleRemove = useCallback((id: string, ms: number) => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timersRef.current.delete(id)
    }, ms)
    timersRef.current.set(id, timer)
  }, [])

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', options?: ToastOptions) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const persistent = options?.persistent ?? false
    setToasts((prev) => [...prev, { id, message, variant, persistent }])

    if (!persistent) {
      const duration = options?.duration ?? variantDurations[variant] ?? defaultDuration
      scheduleRemove(id, duration)
    }
  }, [defaultDuration, variantDurations, scheduleRemove])

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none" aria-live="polite" aria-label="Notificações">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-dropdown text-body-medium font-medium animate-slide-up',
              variantStyles[t.variant]
            )}
            role="alert"
          >
            <span className="shrink-0 mt-0.5">{iconMap[t.variant]}</span>
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 min-w-[48px] min-h-[48px] opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
