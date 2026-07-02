import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Download } from 'lucide-react'

interface PWAInstallBannerProps {
  onInstall: () => void
  onDismiss: () => void
}

export function PWAInstallBanner({ onInstall, onDismiss }: PWAInstallBannerProps) {
  return (
    <Card className="mx-4 mt-3 mb-0" padding={false}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
          <Download size={20} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-title-small font-semibold text-text-primary">
            Instale o RISCO360
          </p>
          <p className="text-body-small text-text-secondary mt-0.5">
            Acesse mais rápido, mesmo sem internet.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Agora não">
            Agora não
          </Button>
          <Button variant="primary" size="sm" onClick={onInstall} aria-label="Instalar aplicativo">
            Instalar
          </Button>
        </div>
      </div>
    </Card>
  )
}
