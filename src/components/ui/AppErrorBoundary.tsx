import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, ArrowLeft, Building2 } from 'lucide-react'
import { ROUTES } from '@/constants/app'

export function AppErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const isDev = import.meta.env.DEV

  const technicalDetail = isDev && !isRouteErrorResponse(error)
    ? error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack?.split('\n').slice(0, 4).join('\n')}`
      : String(error)
    : null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-surface-alt">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle size={32} className="text-danger" />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-text-primary">
            Algo deu errado ao carregar esta página.
          </h1>
          <p className="text-sm text-text-secondary">
            Tente atualizar a página ou voltar para a tela anterior.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.empresas)}>
            <Building2 size={16} /> Ir para Empresas
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Recarregar página
          </Button>
        </div>

        {technicalDetail && (
          <details className="text-left mt-6">
            <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
              Detalhes técnicos (desenvolvimento)
            </summary>
            <pre className="mt-2 text-xs text-text-muted bg-surface-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
              {technicalDetail}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
