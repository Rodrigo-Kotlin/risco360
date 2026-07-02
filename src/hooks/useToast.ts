import { createContext, useContext } from 'react'
import type { ToastVariant } from '@/types/ui'

export interface ToastOptions {
  duration?: number
  persistent?: boolean
}

export interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
