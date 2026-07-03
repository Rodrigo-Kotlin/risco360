import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, children, footer, className, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!contentRef.current) return []
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ]
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(selectors.join(', '))
    )
  }, [])

  useEffect(() => {
    if (!open) {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
      return
    }

    previousActiveElement.current = document.activeElement

    const focusable = getFocusableElements()
    if (focusable.length > 0) {
      focusable[0].focus()
    } else if (contentRef.current) {
      contentRef.current.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements()
        if (focusable.length < 2) {
          e.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const current = document.activeElement

        if (e.shiftKey) {
          if (current === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (current === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose, getFocusableElements])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-modal w-full',
          'animate-slide-up max-h-[90vh] sm:max-h-[85vh] flex flex-col',
          'outline-none',
          sizeStyles[size],
          'sm:mx-4',
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border-light shrink-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id="modal-title" className="text-title-medium font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-1 text-body-small text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'shrink-0 -mt-0.5 -mr-1',
              'w-9 h-9 flex items-center justify-center',
              'rounded-xl hover:bg-surface-muted transition-colors',
              'text-text-muted hover:text-text-primary'
            )}
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin flex-1 px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border-light shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}