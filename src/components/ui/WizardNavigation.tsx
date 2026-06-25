import { Button } from '@/components/ui/Button'
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardNavigationProps {
  saving: boolean
  onPrevious?: () => void
  onNext?: () => void
  onSave?: () => void
  isFirst?: boolean
  isLast?: boolean
  nextLabel?: string
  className?: string
}

/**
 * Componente de navegação padronizado para todos os steps do wizard.
 * Centraliza a lógica de "Anterior / Próximo / Salvar rascunho" em um
 * único lugar para garantir consistência visual entre etapas.
 */
export function WizardNavigation({
  saving,
  onPrevious,
  onNext,
  onSave,
  isFirst = false,
  isLast = false,
  nextLabel,
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn('space-y-2 pt-4 border-t border-border-light', className)}>
      <div className="flex gap-2">
        {!isFirst && (
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={saving || !onPrevious}
            className="flex-1"
            aria-label="Etapa anterior"
          >
            <ArrowLeft size={16} />
            Anterior
          </Button>
        )}
        {onNext && (
          <Button
            onClick={onNext}
            disabled={saving}
            className={cn('flex-1', isFirst && 'w-full')}
            aria-label={isLast ? 'Concluir levantamento' : 'Próxima etapa'}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {nextLabel ?? (isLast ? 'Concluir' : 'Próximo')}
          </Button>
        )}
      </div>

      {onSave && (
        <Button
          variant="secondary"
          onClick={onSave}
          disabled={saving}
          className="w-full"
          aria-label="Salvar rascunho"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar rascunho
        </Button>
      )}
    </div>
  )
}
