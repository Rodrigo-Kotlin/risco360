import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RefreshCw } from 'lucide-react'

interface PWAUpdateBannerProps {
  onUpdate: () => void
  onDismiss: () => void
}

export function PWAUpdateBanner({ onUpdate, onDismiss }: PWAUpdateBannerProps) {
  return (
    <Card className="mx-4 mt-3 mb-0" padding={false}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
            <RefreshCw size={20} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-title-small font-semibold text-text-primary">
              Nova versão disponível
            </h3>
            <p className="text-body-small text-text-secondary mt-0.5">
              Atualize para utilizar os recursos e correções mais recentes.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label="Atualizar depois"
          >
            Depois
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onUpdate}
            aria-label="Atualizar aplicativo agora"
          >
            Atualizar agora
          </Button>
        </div>
      </div>
    </Card>
  )
}
