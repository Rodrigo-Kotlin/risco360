import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { NivelRiscoBadge } from '@/components/forms/NivelRiscoBadge'
import { ROUTES } from '@/constants/app'
import { TIPOS_LEVANTAMENTO_SHORT_LABELS } from '@/constants/levantamentos'
import { buscarLevantamentoPorId, atualizarStatusLevantamento } from '@/services/levantamentos.service'
import { listarRelatoriosPorLevantamento } from '@/services/relatorios.service'
import { useToast } from '@/hooks/useToast'
import { SyncStatusChip } from '@/components/ui/SyncStatusChip'
import { ArrowLeft, CheckCircle2, Loader2, Building2, User, Calendar, Hash, Info, Edit, AlertTriangle } from 'lucide-react'
import type { Levantamento, StatusLevantamento } from '@/types/levantamento'
import { getProximoStatusLevantamento } from '@/lib/levantamento-status'
import type { Relatorio } from '@/types/relatorio'

const statusLabel: Record<string, string> = {
  rascunho: 'Rascunho', em_andamento: 'Em andamento',
  concluido: 'Concluído', arquivado: 'Arquivado',
}

const statusBadge = (s: StatusLevantamento) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'info' | 'muted'> = {
    rascunho: 'muted', em_andamento: 'warning',
    concluido: 'success', arquivado: 'muted',
  }
  return <Badge variant={map[s] ?? 'default'}>{statusLabel[s] ?? s}</Badge>
}

const nextStatusLabel: Record<string, string> = {
  rascunho: 'Iniciar levantamento',
  em_andamento: 'Concluir levantamento',
}

export default function LevantamentoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [levantamento, setLevantamento] = useState<Levantamento | null>(null)
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    let mounted = true
    Promise.all([
      buscarLevantamentoPorId(id),
      listarRelatoriosPorLevantamento(id),
    ]).then(([levResult, relResult]) => {
      if (!mounted) return
      setLoading(false)
      if (levResult.error) { setError(levResult.error); return }
      if (levResult.data) setLevantamento(levResult.data)
      if (!relResult.error && relResult.data) setRelatorios(relResult.data)
    })
    return () => { mounted = false }
  }, [id])

  const handleAdvanceStatus = async () => {
    if (!levantamento) return
    const next = getProximoStatusLevantamento(levantamento.status)
    if (!next) {
      toast('Não há próximo status disponível para este levantamento.', 'info')
      return
    }
    setUpdatingStatus(true)
    const result = await atualizarStatusLevantamento(levantamento.id, next)
    setUpdatingStatus(false)
    if (result.error) { toast(result.error, 'error'); return }
    toast(`Status atualizado para "${statusLabel[next]}"`, 'success')
    load()
  }

  const load = async () => {
    if (!id) return
    setLoading(true)
    const result = await buscarLevantamentoPorId(id)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    if (result.data) setLevantamento(result.data)
  }

  const formatoData = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : null

  if (loading) {
    return (
      <>
        <Header title="Detalhe do levantamento" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (error || !levantamento) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{error ?? 'Levantamento não encontrado'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.levantamentos)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </MainContainer>
      </>
    )
  }

  const canAdvance = getProximoStatusLevantamento(levantamento.status) !== null

  const infoItems = [
    { icon: Building2, label: 'Empresa', value: levantamento.empresa_nome },
    { icon: Info, label: 'Tipo', value: TIPOS_LEVANTAMENTO_SHORT_LABELS[levantamento.tipo] ?? levantamento.tipo },
    { icon: Calendar, label: 'Data do levantamento', value: formatoData(levantamento.data_levantamento) },
    { icon: Calendar, label: 'Lançamento SGG', value: formatoData(levantamento.data_lancamento_sgg) },
    { icon: User, label: 'Auditor técnico', value: levantamento.auditor_tecnico },
    { icon: User, label: 'Responsável empresa', value: levantamento.responsavel_empresa },
    { icon: Hash, label: 'Registro MTE', value: levantamento.registro_mte },
    { icon: Building2, label: 'Setor', value: levantamento.setor_nome ?? levantamento.setor },
  ]

  const relColumns = [
    { key: 'tipo' as keyof Relatorio, header: 'Tipo', sortable: true },
    { key: 'status' as keyof Relatorio, header: 'Status', sortable: true,
      render: (item: Relatorio) => <Badge variant={item.status === 'gerado' ? 'success' : item.status === 'baixado' ? 'info' : 'muted'}>{item.status}</Badge>
    },
    { key: 'created_at' as keyof Relatorio, header: 'Criado em', sortable: true,
      render: (item: Relatorio) => formatoData(item.created_at) ?? '—'
    },
  ]

  const riscos = levantamento.riscos ?? []
  const criticos = riscos.filter((r) => r.nivel_risco === 'critico').length
  const altos = riscos.filter((r) => r.nivel_risco === 'alto').length
  const medicoes = (levantamento.pontos_medicao ?? []).length > 0 ? levantamento.pontos_medicao : (levantamento.medicoes ?? [])
  const colaboradores = levantamento.colaboradores ?? []
  const controles = ((levantamento.plano_acao ?? []).length > 0 ? levantamento.plano_acao : (levantamento.controles ?? [])) ?? []

  return (
    <>
      <Header title={`Levantamento ${levantamento.codigo ?? ''}`} description={levantamento.empresa_nome ?? undefined} />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={levantamento.codigo ?? 'Levantamento'}
            description={levantamento.empresa_nome ?? undefined}
            breadcrumb={[
              { label: 'Levantamentos', href: ROUTES.levantamentos },
              { label: levantamento.codigo ?? 'Detalhe' },
            ]}
            secondaryActions={
              <>
                <Button variant="secondary" onClick={() => navigate(ROUTES.levantamentos)}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
                <Button variant="secondary" onClick={() => navigate(ROUTES.levantamentosEditar.replace(':id', levantamento.id))}>
                  <Edit size={16} /> Continuar preenchimento
                </Button>
                {canAdvance && !levantamento.status.startsWith('conclu') && (
                  <Button onClick={handleAdvanceStatus} disabled={updatingStatus}>
                    {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {nextStatusLabel[levantamento.status] ?? 'Avançar status'}
                  </Button>
                )}
              </>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-text-muted mb-1">Status</p>
              <div className="flex items-center gap-2">
                {statusBadge(levantamento.status)}
                <SyncStatusChip sync_status={levantamento.sync_status} />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted mb-1">Progresso</p>
              <div className="flex items-center gap-2">
                <ProgressBar value={levantamento.percentual} className="flex-1" />
                <span className="text-sm font-medium text-text-primary">{levantamento.percentual}%</span>
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted mb-1">Tipo</p>
              <p className="text-sm font-medium text-text-primary">{levantamento.tipo}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-muted mb-1">Relatórios</p>
              <p className="text-sm font-medium text-text-primary">{relatorios.length}</p>
            </Card>
          </div>

          <Card className="p-5">
            <CardTitle className="mb-4">Informações do levantamento</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon size={16} className="shrink-0 mt-0.5 text-text-muted" />
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-sm text-text-primary truncate">{value ?? <span className="text-text-muted">—</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {riscos.length > 0 && (
            <Card className="p-5">
              <CardTitle className="mb-4">Resumo técnico</CardTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-surface-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-primary">{riscos.length}</p>
                  <p className="text-xs text-text-muted">Riscos</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-danger">{criticos}</p>
                  <p className="text-xs text-danger">Críticos</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-700">{altos}</p>
                  <p className="text-xs text-orange-700">Altos</p>
                </div>
                <div className="p-3 bg-surface-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-primary">{controles.length}</p>
                  <p className="text-xs text-text-muted">Ações</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="p-3 bg-surface-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-primary">{medicoes.length}</p>
                  <p className="text-xs text-text-muted">Medições</p>
                </div>
                <div className="p-3 bg-surface-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-text-primary">{colaboradores.length}</p>
                  <p className="text-xs text-text-muted">Colaboradores</p>
                </div>
                <div className="p-3 bg-surface-muted rounded-lg text-center col-span-2">
                  <p className="text-xs text-text-muted">Resumo dos riscos identificados</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {riscos.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle size={14} className="shrink-0 text-text-muted" />
                      <span className="truncate text-text-primary">{r.agente}</span>
                    </div>
                    <NivelRiscoBadge nivel={r.nivel_risco} />
                  </div>
                ))}
                {riscos.length > 10 && (
                  <p className="text-xs text-text-muted mt-1">+ {riscos.length - 10} riscos adicionais</p>
                )}
              </div>
            </Card>
          )}

          {levantamento.observacoes && (
            <Card className="p-5">
              <CardTitle className="mb-2">Observações</CardTitle>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{levantamento.observacoes}</p>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Relatórios</h3>
                <p className="text-xs text-text-muted">Relatórios gerados para este levantamento</p>
              </div>
            </div>
            <DataTable
              columns={relColumns}
              data={relatorios}
              keyExtractor={(r) => r.id}
              emptyTitle="Nenhum relatório gerado"
              emptyDescription="Os relatórios são gerados automaticamente após a conclusão."
            />
          </div>
        </div>
      </MainContainer>
    </>
  )
}
