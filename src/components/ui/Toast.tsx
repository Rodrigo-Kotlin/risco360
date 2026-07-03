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
  success: <CheckCircle size={16} aria-hidden="true" />,
  error:   <AlertCircle size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  info:    <Info size={16} aria-hidden="true" />,
}

/**
 * MD3 Toast / Snackbar:
 *
 * — Posicionamento: bottom-center em mobile (como Snackbar do Android)
 *   e bottom-right em desktop — padrão Google
 * — Compacto: py-2.5 px-4 — evita parecer um popup gigante
 * — Máximo de 3 toasts visíveis simultaneamente
 * — Backdrop transparente — toast não bloqueia interação
 */
const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-[#1E4620] text-white border-none',
  error:   'bg-[#5F2120] text-white border-none',
  warning: 'bg-[#4E2600] text-white border-none',
  info:    'bg-[#1A237E] text-white border-none',
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
    // Limita a 3 toasts visíveis
    setToasts((prev) => [...prev.slice(-2), { id, message, variant, persistent }])

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
      {/* 
        Mobile: bottom-center (Snackbar Android MD3)
        Desktop: bottom-right
        Ambos ficam acima do bottom navigation bar (bottom-20 em mobile)
      */}
      <div
        className="fixed z-[100] flex flex-col gap-2 pointer-events-none
          bottom-20 left-4 right-4
          sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:max-w-[360px]"
        aria-live="polite"
        aria-label="Notificações"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3',
              'px-4 py-3 rounded-lg shadow-lg',
              'text-body-medium font-medium animate-slide-up',
              'min-h-[48px]',
              variantStyles[t.variant]
            )}
            role="alert"
          >
            <span className="shrink-0">{iconMap[t.variant]}</span>
            <p className="flex-1 text-body-small font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className={cn(
                'shrink-0 -mr-1 p-2 rounded-md',
                'opacity-80 hover:opacity-100 transition-opacity',
                'min-w-[36px] min-h-[36px] flex items-center justify-center'
              )}
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
