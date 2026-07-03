import { InputHTMLAttributes, forwardRef, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  debounce?: number
  placeholder?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value = '', onChange, debounce = 300, placeholder = 'Pesquisar\u2026', className, ...props }, ref) => {
    const [local, setLocal] = useState(value)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const mountedRef = useRef(false)

    useEffect(() => {
      if (mountedRef.current) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          onChange?.(local)
        }, debounce)
        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
      }
    }, [local, debounce, onChange])

    useEffect(() => {
      setLocal(value)
    }, [value])

    useEffect(() => {
      mountedRef.current = true
    }, [])

    const handleClear = () => {
      setLocal('')
      onChange?.('')
    }

    return (
      <div role="search" className={cn('relative', className)}>
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-12 pl-10 rounded-xl border border-border-light bg-white text-body-medium',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
            'transition-colors duration-150',
            'hover:border-text-muted/60',
            local ? 'pr-10' : 'pr-3.5',
          )}
          {...props}
        />
        {local && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2',
              'w-9 h-9 flex items-center justify-center',
              'text-text-muted hover:text-text-primary transition-colors',
              'rounded-lg hover:bg-surface-muted'
            )}
            aria-label="Limpar pesquisa"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'