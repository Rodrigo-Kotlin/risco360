import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
interface DropdownItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

function getEnabledIndexes(items: DropdownItem[]): number[] {
  return items.reduce<number[]>((acc, item, i) => {
    if (!item.disabled) acc.push(i)
    return acc
  }, [])
}

export function DropdownMenu({ trigger, items, align = 'left', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const enabledIndexes = getEnabledIndexes(items)

  const openMenu = useCallback(() => {
    setOpen(true)
    setFocusIndex(enabledIndexes[0] ?? -1)
  }, [enabledIndexes])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setFocusIndex(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeMenu])

  function focusEnabledItem(idx: number) {
    if (idx >= 0) {
      itemRefs.current[idx]?.focus()
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setFocusIndex((prev) => {
          const idx = enabledIndexes.indexOf(prev)
          const next = enabledIndexes[(idx + 1) % enabledIndexes.length] ?? prev
          focusEnabledItem(next)
          return next
        })
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setFocusIndex((prev) => {
          const idx = enabledIndexes.indexOf(prev)
          const next = enabledIndexes[(idx - 1 + enabledIndexes.length) % enabledIndexes.length] ?? prev
          focusEnabledItem(next)
          return next
        })
        break
      }
      case 'Home':
        e.preventDefault()
        setFocusIndex(enabledIndexes[0] ?? -1)
        focusEnabledItem(enabledIndexes[0])
        break
      case 'End':
        e.preventDefault()
        setFocusIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1)
        focusEnabledItem(enabledIndexes[enabledIndexes.length - 1])
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusIndex >= 0 && !items[focusIndex].disabled) {
          items[focusIndex].onClick()
          closeMenu()
        }
        break
      case 'Escape':
      case 'Tab':
        closeMenu()
        break
    }
  }

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
            if (!open) {
              e.preventDefault()
              openMenu()
            } else {
              e.preventDefault()
              const idx = e.key === 'ArrowUp' ? (enabledIndexes[enabledIndexes.length - 1] ?? -1) : (enabledIndexes[0] ?? -1)
              setFocusIndex(idx)
              focusEnabledItem(idx)
            }
          }
        }}
        className="inline-flex items-center gap-1 min-h-[48px]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 min-w-[180px] bg-card border border-border rounded-lg shadow-dropdown py-1 z-50 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el
                if (el && focusIndex === i) {
                  el.focus()
                }
              }}
              type="button"
              role="menuitem"
              tabIndex={focusIndex === i ? 0 : -1}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick()
                  closeMenu()
                }
              }}
              onMouseEnter={() => setFocusIndex(i)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-3 text-sm transition-colors text-left min-h-[48px]',
                item.variant === 'danger'
                  ? 'text-danger hover:bg-red-50'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
