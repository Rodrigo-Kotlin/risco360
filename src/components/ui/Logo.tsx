import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'
import { APP_NAME } from '@/constants/app'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { box: 'w-8 h-8', icon: 18, text: 'text-sm' },
  md: { box: 'w-10 h-10', icon: 22, text: 'text-base' },
  lg: { box: 'w-14 h-14', icon: 28, text: 'text-2xl' },
}

export function Logo({ size = 'sm', showText = true, className }: LogoProps) {
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          s.box,
          'rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm shrink-0'
        )}
        aria-hidden="true"
      >
        <ShieldCheck size={s.icon} />
      </div>
      {showText && (
        <span className={cn('font-bold text-text-primary', s.text)}>{APP_NAME}</span>
      )}
    </div>
  )
}
