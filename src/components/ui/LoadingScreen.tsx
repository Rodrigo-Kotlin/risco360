import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export function LoadingScreen({ message = 'Carregando Risco360…', className }: LoadingScreenProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-screen gap-5 bg-surface-alt animate-fade-in',
      className
    )}>
      <div className="relative" role="status" aria-label="Carregando">
        <Shield size={40} className="text-primary-500/20" aria-hidden="true" />
        <div className="absolute inset-0 w-10 h-10 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-title-medium font-semibold text-text-primary">{message}</p>
        <p className="text-body-small text-text-muted animate-pulse">Aguarde um momento…</p>
      </div>
    </div>
  )
}
