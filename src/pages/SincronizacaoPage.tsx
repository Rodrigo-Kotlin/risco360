import { useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import {
  CheckCircle2, CloudOff, AlertTriangle, RefreshCw,
  Clock, Loader2,
} from 'lucide-react'

export default function SincronizacaoPage() {
  const { data: metrics } = useSyncMetrics()
  const { isSyncing, lastSyncMessage, triggerSync } = useSyncQueue()

  useEffect(() => {
    document.title = 'Sincronização — Risco360'
  }, [])

  return (
    <>
      <Header title="Sincronização" description="Diagnóstico da fila de sincronização offline" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Status da Sincronização"
            description="Acompanhe o estado da fila de dados offline"
          />

          {/* Resumo geral */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {!metrics ? (
              <>
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </>
            ) : (
              <>
                <Card className="p-4 text-center">
                  <p className="text-label-medium font-medium text-text-secondary uppercase tracking-wide">Sincronizados</p>
                  <p className="mt-1 text-headline-small font-bold text-success">{metrics.synced}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-label-medium font-medium text-text-secondary uppercase tracking-wide">Pendentes</p>
                  <p className={`mt-1 text-headline-small font-bold ${metrics.pending > 0 ? 'text-warning' : 'text-text-muted'}`}>
                    {metrics.pending}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-label-medium font-medium text-text-secondary uppercase tracking-wide">Falhas</p>
                  <p className={`mt-1 text-headline-small font-bold ${metrics.failed > 0 ? 'text-danger' : 'text-text-muted'}`}>
                    {metrics.failed}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-label-medium font-medium text-text-secondary uppercase tracking-wide">Conflitos</p>
                  <p className={`mt-1 text-headline-small font-bold ${metrics.conflicts > 0 ? 'text-warning' : 'text-text-muted'}`}>
                    {metrics.conflicts}
                  </p>
                </Card>
              </>
            )}
          </div>

          {/* Última sincronização + ação */}
          {!metrics ? (
            <SkeletonCard />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-text-muted" />
                  <CardTitle>Registro de atividade</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className="min-h-[48px] inline-flex items-center gap-1.5 text-label-medium font-medium text-primary-500 hover:text-primary-600 disabled:text-text-muted transition-colors"
                >
                  {isSyncing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
                </button>
              </CardHeader>
              <div className="px-5 pb-5 space-y-2">
                {metrics.lastSyncAt ? (
                    <p className="text-body-medium text-text-secondary">
                    Última sincronização:{' '}
                    <span className="font-medium">
                      {new Date(metrics.lastSyncAt).toLocaleString('pt-BR')}
                    </span>
                  </p>
                ) : (
                  <p className="text-body-medium text-text-muted">Nenhuma sincronização registrada ainda.</p>
                )}
                {isSyncing && lastSyncMessage && (
                  <p className="text-body-small text-primary-500 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    {lastSyncMessage}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Itens com erro */}
          {!metrics ? (
            <SkeletonTable rows={3} />
          ) : metrics.failedItems.length > 0 ? (
            <Card variant="danger">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-danger" />
                  <CardTitle>Itens com erro ({metrics.failedItems.length})</CardTitle>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-body-small text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-2 font-medium text-text-secondary">Entidade</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Operação</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Tentativas</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Erro</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.failedItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-2">
                          <Badge variant={item.status === 'conflict' ? 'warning' : 'danger'}>
                            {item.entity}
                          </Badge>
                        </td>
                        <td className="px-5 py-2 text-text-secondary">{item.operation}</td>
                        <td className="px-5 py-2 text-text-secondary">{item.attempts}/5</td>
                        <td className="px-5 py-2 text-text-secondary max-w-xs truncate" title={item.last_error ?? ''}>
                          {item.last_error ?? '—'}
                        </td>
                        <td className="px-5 py-2 text-text-secondary whitespace-nowrap">
                          {new Date(item.updated_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {/* Fila completa */}
          {!metrics ? (
            <SkeletonTable rows={4} />
          ) : metrics.allItems.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CloudOff size={16} className="text-text-muted" />
                  <CardTitle>Fila completa ({metrics.allItems.length} itens)</CardTitle>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-body-small text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-2 font-medium text-text-secondary">Entidade</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Operação</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Status</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Tentativas</th>
                      <th className="px-5 py-2 font-medium text-text-secondary">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.allItems.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-2 font-medium">{item.entity}</td>
                        <td className="px-5 py-2 text-text-secondary">{item.operation}</td>
                        <td className="px-5 py-2">
                          <Badge variant={
                            item.status === 'synced' ? 'success' :
                            item.status === 'pending' ? 'warning' :
                            item.status === 'syncing' ? 'info' :
                            item.status === 'conflict' ? 'warning' :
                            'danger'
                          }>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-2 text-text-secondary">{item.attempts}/5</td>
                        <td className="px-5 py-2 text-text-secondary whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {/* Estado vazio */}
          {metrics && metrics.allItems.length === 0 && (
            <Card className="p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-success mb-2" />
              <p className="text-title-small font-medium text-text-primary">Fila vazia</p>
              <p className="text-body-small text-text-muted mt-1">Nenhum item aguardando sincronização.</p>
            </Card>
          )}
        </div>
      </MainContainer>
    </>
  )
}
