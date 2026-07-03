import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MainContainerProps {
  children: ReactNode
  className?: string
}

export function MainContainer({ children, className }: MainContainerProps) {
  return (
    <main
      className={cn(
        'flex-1 px-4 md:px-6 pb-24 lg:pb-6 pt-4 md:pt-6 max-w-7xl mx-auto w-full',
        className
      )}
    >
      {children}
    </main>
  )
}