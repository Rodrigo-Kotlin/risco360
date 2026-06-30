import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'

import { APP_NAME, ROUTES } from '@/constants/app'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
import {
  ClipboardList, Building2, FileText, Plus,
  BarChart3, Activity,
  Clock, CheckCircle2, CloudOff,
  AlertTriangle, RefreshCw, ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useDashboardData()

  const empresas = data?.empresas ?? []
  const levantamentos = data?.levantamentos ?? []
  const relatorios = data?.relatorios ?? []
  const emAndamento = levantamentos.filter((l) => l.status === 'em_andamento').length
  const concluidos = levantamentos.filter((l) => l.status === 'concluido').length

  return (
    <>
      <Header title="Dashboard" description="Visão geral do sistema" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={`Bem-vindo ao ${APP_NAME}`}
            description="Visão executiva dos seus projetos de SST"
            action={{
              label: 'Novo levantamento',
              onClick: () => navigate(ROUTES.levantamentosNovo),
              icon: <Plus size={16} />,
            }}
          />

          {isError && (
            <Card className="p-4">
              <p className="text-sm text-danger">{error instanceof Error ? error.message : 'Erro ao carregar dados'}</p>
            </Card>
          )}

          {/* Métricas principais */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                title="Empresas"
                value={empresas.length}
                description="Clientes cadastrados"
                icon={<Building2 size={20} />}
                variant="default"
                onClick={() => navigate(ROUTES.empresas)}
              />
              <StatCard
                title="Em andamento"
                value={emAndamento}
                description="Levantamentos em progresso"
                icon={<Clock size={20} />}
                variant="warning"
              />
              <StatCard
                title="Concluídos"
                value={concluidos}
                description="Levantamentos finalizados"
                icon={<CheckCircle2 size={20} />}
                variant="success"
              />
              <StatCard
                title="Relatórios"
                value={relatorios.length}
                description="Documentos gerados"
                icon={<FileText size={20} />}
                variant="info"
                onClick={() => navigate(ROUTES.relatorios)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ações rápidas */}
            <Card className="lg:col-span-2">
              <CardTitle className="mb-4">Ações rápidas</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => navigate(ROUTES.levantamentosNovo)}
                >
                  <ClipboardList size={16} className="shrink-0" />
                  <span>
                    <span className="block font-medium">Novo levantamento</span>
                    <span className="block text-xs text-text-muted font-normal">Iniciar formulário LPR + AEP</span>
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => navigate(ROUTES.empresasNova)}
                >
                  <Building2 size={16} className="shrink-0" />
                  <span>
                    <span className="block font-medium">Nova empresa</span>
                    <span className="block text-xs text-text-muted font-normal">Cadastrar cliente</span>
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => navigate(ROUTES.levantamentos)}
                >
                  <Activity size={16} className="shrink-0" />
                  <span>
                    <span className="block font-medium">Meus levantamentos</span>
                    <span className="block text-xs text-text-muted font-normal">Ver todos os formulários</span>
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => navigate(ROUTES.relatorios)}
                >
                  <BarChart3 size={16} className="shrink-0" />
                  <span>
                    <span className="block font-medium">Relatórios</span>
                    <span className="block text-xs text-text-muted font-normal">Acessar documentos gerados</span>
                  </span>
                </Button>
              </div>
            </Card>

            {/* Painel de sincronização */}
            <Card>
              <CardTitle className="mb-4">Status da Sincronização</CardTitle>
              <SyncStatusContent />
              <div className="mt-3 pt-3 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.configuracoes)}
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Ver detalhes <ArrowRight size={12} />
                </button>
              </div>
            </Card>
          </div>

          {/* Levantamentos recentes */}
          {!isLoading && !isError && levantamentos.length === 0 && (
            <Card className="p-0">
              <EmptyState
                title="Nenhum levantamento encontrado"
                description="Você ainda não possui levantamentos de risco registrados."
                action={{
                  label: 'Novo levantamento',
                  onClick: () => navigate(ROUTES.levantamentosNovo),
                }}
                secondaryAction={{
                  label: 'Ver empresas',
                  onClick: () => navigate(ROUTES.empresas),
                }}
              />
            </Card>
          )}

          {!isLoading && !isError && levantamentos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Activity size={16} />
                  Levantamentos recentes
                </h2>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.levantamentos)}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-2">
                {levantamentos.slice(0, 5).map((lev) => {
                  const statusColors: Record<string, string> = {
                    rascunho: 'text-text-muted bg-surface-muted',
                    em_andamento: 'text-warning bg-warning-50',
                    concluido: 'text-success bg-success-50',
                    arquivado: 'text-text-muted bg-surface-muted',
                  }
                  const statusLabels: Record<string, string> = {
                    rascunho: 'Rascunho',
                    em_andamento: 'Em andamento',
                    concluido: 'Concluído',
                    arquivado: 'Arquivado',
                  }
                  return (
                    <Card
                      key={lev.id}
                      className="p-4 cursor-pointer hover:border-primary-200 hover:shadow-md transition-all"
                      onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', lev.id))}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-text-primary truncate">{lev.codigo ?? 'Sem código'}</p>
                          <p className="text-xs text-text-secondary truncate">{lev.empresa_nome ?? 'Sem empresa'}{lev.setor_nome ? ` — ${lev.setor_nome}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="hidden sm:flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${lev.percentual ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted tabular-nums">{lev.percentual ?? 0}%</span>
                          </div>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[lev.status] ?? 'text-text-muted bg-surface-muted'}`}>
                            {statusLabels[lev.status] ?? lev.status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </MainContainer>
    </>
  )
}

function SyncStatusContent() {
  const { data: metrics, isLoading } = useSyncMetrics()

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    )
  }

  const hasIssues = (metrics?.failed ?? 0) > 0 || (metrics?.conflicts ?? 0) > 0
  const isPending = (metrics?.pending ?? 0) > 0
  const hasSynced = (metrics?.synced ?? 0) > 0

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-text-secondary">
          <CheckCircle2 size={14} className="text-success" />
          Sincronizados
        </span>
        <span className="text-sm font-semibold text-success">{metrics?.synced ?? 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-text-secondary">
          <CloudOff size={14} className={isPending ? 'text-warning' : 'text-text-muted'} />
          Pendentes
        </span>
        <span className={`text-sm font-semibold ${isPending ? 'text-warning' : 'text-text-muted'}`}>
          {metrics?.pending ?? 0}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-text-secondary">
          <AlertTriangle size={14} className={hasIssues ? 'text-danger' : 'text-text-muted'} />
          Falhas
        </span>
        <span className={`text-sm font-semibold ${hasIssues ? 'text-danger' : 'text-text-muted'}`}>
          {(metrics?.failed ?? 0) + (metrics?.conflicts ?? 0)}
        </span>
      </div>
      {hasIssues && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-text-secondary">
            <RefreshCw size={14} className="text-warning" />
            Conflitos
          </span>
          <span className="text-sm font-semibold text-warning">{metrics?.conflicts ?? 0}</span>
        </div>
      )}
      {metrics?.lastSyncAt && (
        <div className="pt-2 mt-2 border-t border-border-light">
          <p className="text-[11px] text-text-muted">
            Última sincronização:{' '}
            {new Date(metrics.lastSyncAt).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
      {!metrics?.lastSyncAt && hasSynced && (
        <div className="pt-2 mt-2 border-t border-border-light">
          <p className="text-[11px] text-text-muted">Nenhuma sincronização registrada</p>
        </div>
      )}
    </div>
  )
}