import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { APP_NAME, ROUTES } from '@/constants/app'
import { useEmpresas } from '@/hooks/useEmpresas'
import { useLevantamentos } from '@/hooks/useLevantamentos'
import { useRelatorios } from '@/hooks/useRelatorios'
import { listarSetores } from '@/services/setores.service'
import {
  ClipboardList, Building2, FileText, Plus,
  AlertTriangle, BarChart3, Activity, Layers
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: empresas, status: empresasStatus } = useEmpresas()
  const { data: levantamentos, status: levStatus } = useLevantamentos()
  const { data: relatorios, status: relStatus } = useRelatorios()
  const [totalSetores, setTotalSetores] = useState(0)
  const [setoresLoading, setSetoresLoading] = useState(true)

  useEffect(() => {
    listarSetores().then((r) => {
      setSetoresLoading(false)
      if (!r.error && r.data) setTotalSetores(r.data.length)
    })
  }, [])

  const setoresStatus = setoresLoading ? 'loading' : 'success'

  const loadingStats = empresasStatus === 'loading' || levStatus === 'loading' || relStatus === 'loading' || setoresStatus === 'loading'

  const formulariosSetoriais = levStatus === 'success' ? levantamentos.filter((l) => l.tipo === 'LPR_AEP').length : 0
  const rascunhos = levStatus === 'success' ? levantamentos.filter((l) => l.status === 'rascunho').length : 0
  const concluidos = levStatus === 'success' ? levantamentos.filter((l) => l.status === 'concluido').length : 0
  const totalRiscos = levStatus === 'success' ? levantamentos.reduce((acc, l) => acc + (l.riscos?.length ?? 0), 0) : 0


  return (
    <>
      <Header title="Dashboard" description="Visão geral do sistema" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Dashboard"
            description={`Bem-vindo ao ${APP_NAME}`}
            action={{
              label: 'Novo levantamento',
              onClick: () => navigate(ROUTES.levantamentosNovo),
              icon: <Plus size={16} />,
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Empresas"
              value={empresasStatus === 'success' ? empresas.length : 0}
              description="Empresas cadastradas"
              icon={<Building2 size={20} />}
            />
            <StatCard
              title="Setores"
              value={totalSetores}
              description="Setores cadastrados"
              icon={<Layers size={20} />}
            />
            <StatCard
              title="Formulários Setoriais"
              value={formulariosSetoriais}
              description="LPR + AEP integrados"
              icon={<ClipboardList size={20} />}
            />
            <StatCard
              title="Riscos Identificados"
              value={totalRiscos}
              description="Riscos mapeados"
              icon={<AlertTriangle size={20} />}
              variant="info"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Levantamentos"
              value={levStatus === 'success' ? levantamentos.length : 0}
              description="Total realizados"
              icon={<ClipboardList size={20} />}
            />
            <StatCard
              title="Relatórios"
              value={relStatus === 'success' ? relatorios.length : 0}
              description="Relatórios gerados"
              icon={<FileText size={20} />}
              variant="info"
            />
            <StatCard
              title="Rascunhos"
              value={rascunhos}
              description="Em edição"
              variant="default"
              icon={<AlertTriangle size={20} />}
            />
            <StatCard
              title="Concluídos"
              value={concluidos}
              description="Finalizados"
              variant="success"
              icon={<FileText size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardTitle className="mb-3">Ações rápidas</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => navigate(ROUTES.empresasNova)}
                >
                  <Building2 size={16} /> Nova empresa
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => navigate(ROUTES.levantamentosNovo)}
                >
                  <ClipboardList size={16} /> Novo levantamento
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => navigate(ROUTES.relatorios)}
                >
                  <BarChart3 size={16} /> Ver relatórios
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => navigate(ROUTES.empresas)}
                >
                  <Building2 size={16} /> Gerenciar empresas
                </Button>
              </div>
            </Card>

            <Card>
              <CardTitle className="mb-3">Status do sistema</CardTitle>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Supabase</span>
                  <span className="text-xs text-success">Conectado</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Auth</span>
                  <span className="text-xs text-success">Ativo</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">PWA</span>
                  <span className="text-xs text-success">Ativo</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-text-secondary">Versão</span>
                  <span className="text-xs text-text-muted">0.1.0</span>
                </li>
              </ul>
            </Card>
          </div>

          {loadingStats && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}

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
              <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Activity size={16} />
                Últimos levantamentos
              </h3>
              {levantamentos.slice(0, 5).map((lev) => (
                <Card
                  key={lev.id}
                  className="p-4 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-shadow"
                  onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', lev.id))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{lev.codigo ?? 'Sem código'}</p>
                      <p className="text-xs text-text-secondary">{lev.empresa_nome ?? 'Sem empresa'}</p>
                    </div>
                    <span className="text-xs text-text-muted capitalize">{lev.status}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainContainer>
    </>
  )
}