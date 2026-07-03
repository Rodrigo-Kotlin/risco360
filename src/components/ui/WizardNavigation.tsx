import { Button } from './Button'
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
 * WizardNavigation — Navegação padronizada do Wizard
 *
 * Mobile: botões em colunas únicas (full-width) para melhor toque
 * Desktop: botões lado a lado
 *
 * Layout mobile (< sm):
 * — [Próximo / Concluir] — primário, largura total
 * — [Anterior] — secundário, largura total (abaixo)
 * — [Salvar rascunho] — ghost/outline, largura total (abaixo)
 *
 * Layout desktop (>= sm):
 * — [Anterior] [Próximo / Concluir] na mesma linha
 * — [Salvar rascunho] abaixo
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
    <div className={cn('pt-4 border-t border-border-light space-y-2', className)}>
      {/* Principal: Anterior + Próximo */}
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        {!isFirst && (
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={saving || !onPrevious}
            className="sm:flex-1"
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
            className={cn(isFirst ? 'w-full' : 'sm:flex-1')}
            aria-label={isLast ? 'Concluir levantamento' : 'Próxima etapa'}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin shrink-0" />
            ) : (
              <ArrowRight size={16} className="shrink-0" />
            )}
            {nextLabel ?? (isLast ? 'Concluir' : 'Próximo')}
          </Button>
        )}
      </div>

      {/* Secundário: Salvar rascunho */}
      {onSave && (
        <Button
          variant="ghost"
          onClick={onSave}
          disabled={saving}
          className="w-full text-text-secondary"
          aria-label="Salvar rascunho"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin shrink-0" />
          ) : (
            <Save size={15} className="shrink-0" />
          )}
          Salvar rascunho
        </Button>
      )}
    </div>
  )
}
