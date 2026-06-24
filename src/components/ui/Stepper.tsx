import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
  number: number
}

interface StepperProps {
  steps: readonly Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <nav aria-label="Progresso do formulário" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isClickable = isCompleted && onStepClick

          return (
            <li key={step.id} className={cn('flex items-center flex-1', index === steps.length - 1 && 'flex-none')}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.number)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  isCurrent && 'text-primary-500',
                  isCompleted && 'text-success',
                  !isCurrent && !isCompleted && 'text-text-muted',
                  isClickable && 'cursor-pointer hover:text-primary-600',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors',
                    isCurrent && 'border-primary-500 bg-primary-50 text-primary-500',
                    isCompleted && 'border-success bg-success text-white',
                    !isCurrent && !isCompleted && 'border-border-light bg-white text-text-muted'
                  )}
                >
                  {isCompleted ? <Check size={14} /> : step.number}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-3',
                    step.number < currentStep ? 'bg-success' : 'bg-border-light'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
