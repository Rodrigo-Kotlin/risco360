import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export function LoadingScreen({ message = 'Carregando Risco360…', className }: LoadingScreenProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-screen gap-4 bg-surface-alt',
      className
    )}>
      <div className="w-10 h-10 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Carregando" />
      <p className="text-body-medium text-text-secondary">{message}</p>
    </div>
  )
}
