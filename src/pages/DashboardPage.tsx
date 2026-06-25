import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { APP_NAME, ROUTES } from '@/constants/app'
import { useEmpresas } from '@/hooks/useEmpresas'
import { useLevantamentos } from '@/hooks/useLevantamentos'
import { useRelatorios } from '@/hooks/useRelatorios'
import { listarSetores } from '@/services/setores.service'
import { contarItensPendentes } from '@/services/offline/sync-queue.service'
import {
  ClipboardList, Building2, FileText, Plus,
  AlertTriangle, BarChart3, Activity, Layers,
  Clock, CheckCircle2, CloudOff, Edit3,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: empresas, status: empresasStatus } = useEmpresas()
  const { data: levantamentos, status: levStatus } = useLevantamentos()
  const { data: relatorios, status: relStatus } = useRelatorios()
  const [totalSetores, setTotalSetores] = useState(0)
  const [setoresLoading, setSetoresLoading] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    listarSetores().then((r) => {
      setSetoresLoading(false)
      if (!r.error && r.data) setTotalSetores(r.data.length)
    })
    contarItensPendentes().then((count) => {
      setPendingSync(count)
    }).catch(() => setPendingSync(0))
  }, [])

  const setoresStatus = setoresLoading ? 'loading' : 'success'
  const loadingStats =
    empresasStatus === 'loading' ||
    levStatus === 'loading' ||
    relStatus === 'loading' ||
    setoresStatus === 'loading'

  const rascunhos = levStatus === 'success' ? levantamentos.filter((l) => l.status === 'rascunho').length : 0
  const emAndamento = levStatus === 'success' ? levantamentos.filter((l) => l.status === 'em_andamento').length : 0
  const concluidos = levStatus === 'success' ? levantamentos.filter((l) => l.status === 'concluido').length : 0
  const totalRiscos = levStatus === 'success' ? levantamentos.reduce((acc, l) => acc + (l.riscos?.length ?? 0), 0) : 0

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

          {/* Métricas principais */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                title="Empresas"
                value={empresasStatus === 'success' ? empresas.length : 0}
                description="Clientes cadastrados"
                icon={<Building2 size={20} />}
                variant="default"
                onClick={() => navigate(ROUTES.empresas)}
              />
              <StatCard
                title="Setores"
                value={totalSetores}
                description="Setores mapeados"
                icon={<Layers size={20} />}
                variant="default"
                onClick={() => navigate(ROUTES.setores)}
              />
              <StatCard
                title="Levantamentos"
                value={levStatus === 'success' ? levantamentos.length : 0}
                description="Total de formulários"
                icon={<ClipboardList size={20} />}
                variant="info"
                onClick={() => navigate(ROUTES.levantamentos)}
              />
              <StatCard
                title="Relatórios"
                value={relStatus === 'success' ? relatorios.length : 0}
                description="Documentos gerados"
                icon={<FileText size={20} />}
                variant="info"
                onClick={() => navigate(ROUTES.relatorios)}
              />
            </div>
          )}

          {/* Status operacional */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                title="Rascunhos"
                value={rascunhos}
                description="Aguardando edição"
                icon={<Edit3 size={20} />}
                variant="default"
              />
              <StatCard
                title="Em andamento"
                value={emAndamento}
                description="Em progresso"
                icon={<Clock size={20} />}
                variant="warning"
              />
              <StatCard
                title="Concluídos"
                value={concluidos}
                description="Finalizados"
                icon={<CheckCircle2 size={20} />}
                variant="success"
              />
              <StatCard
                title="Riscos mapeados"
                value={totalRiscos}
                description="Total identificados"
                icon={<AlertTriangle size={20} />}
                variant="danger"
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
              <CardTitle className="mb-4">Sincronização</CardTitle>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <CloudOff size={14} className="text-text-muted" />
                    Pendentes de sync
                  </span>
                  <span className={`text-xs font-semibold ${pendingSync > 0 ? 'text-warning' : 'text-success'}`}>
                    {pendingSync > 0 ? `${pendingSync} item${pendingSync > 1 ? 's' : ''}` : 'Em dia'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Edit3 size={14} className="text-text-muted" />
                    Rascunhos
                  </span>
                  <span className={`text-xs font-semibold ${rascunhos > 0 ? 'text-warning' : 'text-text-muted'}`}>
                    {loadingStats ? '—' : rascunhos}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <CheckCircle2 size={14} className="text-text-muted" />
                    Concluídos
                  </span>
                  <span className="text-xs font-semibold text-success">
                    {loadingStats ? '—' : concluidos}
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Levantamentos recentes */}
          {levStatus === 'success' && levantamentos.length === 0 && (
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

          {levStatus === 'success' && levantamentos.length > 0 && (
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