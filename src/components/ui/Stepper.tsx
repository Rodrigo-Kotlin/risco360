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

/**
 * MD3 Stepper — Horizontal Progress Indicator
 *
 * Marcador: w-8 h-8 (era w-7 h-7) para melhor presença visual
 * Linha conectora: h-[2px] (era h-px) — mais visível
 * Touch target: min-h-[44px] no botão (não 48px pois o stepper é denso por natureza)
 * Check icon: 15px para melhor leitura dentro do marcador 32px
 */
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
                  'flex items-center gap-2 text-label-medium min-h-[44px] transition-colors duration-150',
                  isCurrent && 'text-primary-500',
                  isCompleted && 'text-success',
                  !isCurrent && !isCompleted && 'text-text-muted',
                  isClickable && 'cursor-pointer hover:text-primary-600',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Marcador circular do passo */}
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    'text-label-medium font-bold border-2 transition-all duration-200 shrink-0',
                    isCurrent && 'border-primary-500 bg-primary-500 text-white shadow-sm',
                    isCompleted && 'border-success bg-success text-white',
                    !isCurrent && !isCompleted && 'border-border-light bg-white text-text-muted'
                  )}
                >
                  {isCompleted ? <Check size={15} strokeWidth={2.5} /> : step.number}
                </span>
                {/* Label — visível a partir de sm */}
                <span className="hidden md:inline text-label-medium font-medium truncate max-w-[7rem]">
                  {step.label}
                </span>
              </button>

              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-[2px] mx-2 rounded-full transition-colors duration-300',
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
