import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ROUTES } from '@/constants/app'
import { buscarSetorPorId, excluirSetor } from '@/services/setores.service'
import { abrirOuCriarFormularioSetorial, listarLevantamentosPorSetor, buscarFormularioSetorialPorSetor } from '@/services/levantamentos.service'
import { buscarEmpresaPorId } from '@/services/empresas.service'
import { useToast } from '@/hooks/useToast'
import { SyncStatusChip } from '@/components/ui/SyncStatusChip'
import { ArrowLeft, ClipboardList, Plus, AlertTriangle, CheckCircle2, Building2, User, MapPin, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Setor } from '@/types/empresa'
import type { Empresa } from '@/types/empresa'
import type { Levantamento } from '@/types/levantamento'

export default function SetorDetalhePage() {
  const { empresaId, setorId } = useParams<{ empresaId: string; setorId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [setor, setSetor] = useState<Setor | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [levantamentos, setLevantamentos] = useState<Levantamento[]>([])
  const [formularioSetorial, setFormularioSetorial] = useState<Levantamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!setorId) return
    let mounted = true

    Promise.all([
      buscarSetorPorId(setorId),
      listarLevantamentosPorSetor(setorId),
      buscarFormularioSetorialPorSetor(setorId),
    ]).then(async ([setorResult, levResult, formResult]) => {
      if (!mounted) return
      setError(null)
      setLoading(false)
      if (setorResult.error) { setError(setorResult.error); return }
      if (setorResult.data) {
        setSetor(setorResult.data)
        const empResult = await buscarEmpresaPorId(setorResult.data.empresa_id)
        if (mounted && !empResult.error && empResult.data) setEmpresa(empResult.data)
      }
      if (!levResult.error && levResult.data) setLevantamentos(levResult.data)
      if (!formResult.error) setFormularioSetorial(formResult.data)
    })

    return () => { mounted = false }
  }, [setorId])

  const statusBadge = (s: Levantamento['status']) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'info' | 'muted'> = {
      rascunho: 'muted', em_andamento: 'warning',
      concluido: 'success', arquivado: 'muted',
    }
    return <Badge variant={map[s] ?? 'default'}>{s.replace('_', ' ')}</Badge>
  }

  const handleCriarOuContinuar = async () => {
    if (!setorId || !setor) return
    const effectiveEmpresaId = empresa?.id ?? setor.empresa_id ?? empresaId
    if (!effectiveEmpresaId) return
    if (formularioSetorial) {
      navigate(ROUTES.levantamentosEditar.replace(':id', formularioSetorial.id))
      return
    }
    setCreating(true)
    const result = await abrirOuCriarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: setorId,
      setor_nome: setor.nome,
      empresa_id: effectiveEmpresaId,
    })
    setCreating(false)
    if (result.error) { toast(result.error, 'error'); return }
    if (result.data) {
      setFormularioSetorial(result.data)
      navigate(ROUTES.levantamentosEditar.replace(':id', result.data.id))
    }
  }

  const handleDelete = async () => {
    if (!setorId) return
    setDeleting(true)
    const result = await excluirSetor(setorId)
    setDeleting(false)
    setDeleteOpen(false)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Setor excluído com sucesso', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.setores.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    navigate(empresa ? ROUTES.empresasDetalhe.replace(':id', empresa.id) : ROUTES.setores)
  }

  if (loading) {
    return (
      <>
        <Header title="Detalhe do setor" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (error || !setor) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{error ?? 'Setor não encontrado'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.empresasDetalhe.replace(':id', empresaId ?? ''))}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </MainContainer>
      </>
    )
  }

  const riscosCount = formularioSetorial?.riscos?.length ?? 0
  const pendentesCount = formularioSetorial?.controles?.filter(c => c.status === 'pendente' || c.status === 'em_andamento').length ?? 0

  return (
    <>
      <Header title={setor.nome} description={empresa?.razao_social ?? ''} />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={setor.nome}
            description={`${empresa?.razao_social ?? 'Empresa'} — ${setor.descricao ?? ''}`}
            breadcrumb={[
              { label: 'Empresas', href: ROUTES.empresas },
              ...(empresa ? [{ label: empresa.razao_social, href: ROUTES.empresasDetalhe.replace(':id', empresa.id) }] : []),
              { label: setor.nome },
            ]}
            secondaryActions={
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => navigate(ROUTES.setoresEditar.replace(':setorId', setor.id))}>
                  <Pencil size={16} /> Editar
                </Button>
                <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={16} /> Excluir
                </Button>
                <Button variant="secondary" onClick={() => navigate(empresa ? ROUTES.empresasDetalhe.replace(':id', empresa.id) : ROUTES.setores)}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <CardTitle className="mb-4">Novo Levantamento</CardTitle>
              {formularioSetorial ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-text-muted">Código</p>
                      <p className="text-sm font-medium text-text-primary">{formularioSetorial.codigo ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Status</p>
                      {statusBadge(formularioSetorial.status)}
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Progresso</p>
                      <p className="text-sm font-medium">{formularioSetorial.percentual}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Última atualização</p>
                      <p className="text-sm text-text-primary">{formularioSetorial.updated_at ? new Date(formularioSetorial.updated_at).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <AlertTriangle size={14} /> {riscosCount} risco(s)
                    </span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      <CheckCircle2 size={14} /> {pendentesCount} aç(ão/ões) pendente(s)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleCriarOuContinuar}>
                      <ClipboardList size={14} /> Continuar Levantamento
                    </Button>
                    <Button size="sm" onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', formularioSetorial.id))}>
                      <Eye size={14} /> Ver detalhes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">Nenhum levantamento em andamento para este setor.</p>
                  <Button onClick={handleCriarOuContinuar} disabled={creating}>
                    <Plus size={16} /> Novo Levantamento
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <CardTitle className="mb-3">Informações do setor</CardTitle>
              <div className="space-y-3 text-sm">
                {empresa && (
                  <div className="flex items-start gap-2">
                    <Building2 size={14} className="shrink-0 mt-0.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Empresa</p>
                      <p className="text-text-primary">{empresa.razao_social}</p>
                    </div>
                  </div>
                )}
                {setor.responsavel_local && (
                  <div className="flex items-start gap-2">
                    <User size={14} className="shrink-0 mt-0.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Responsável local</p>
                      <p className="text-text-primary">{setor.responsavel_local}</p>
                    </div>
                  </div>
                )}
                {setor.localizacao && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="shrink-0 mt-0.5 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Localização</p>
                      <p className="text-text-primary">{setor.localizacao}</p>
                    </div>
                  </div>
                )}
                {setor.descricao && (
                  <div>
                    <p className="text-xs text-text-muted">Descrição</p>
                    <p className="text-text-secondary">{setor.descricao}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Levantamentos deste setor</h3>
            {levantamentos.length === 0 ? (
              <Card className="p-5">
                <p className="text-sm text-text-muted">Nenhum levantamento registrado para este setor.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {levantamentos.map((lev) => (
                  <Card
                    key={lev.id}
                    className="p-4 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-shadow"
                    onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', lev.id))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">{lev.codigo ?? 'Sem código'}</p>
                        <p className="text-xs text-text-secondary">LPR + AEP — {lev.empresa_nome ?? ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted">{lev.percentual}%</span>
                        {statusBadge(lev.status)}
                        <SyncStatusChip sync_status={lev.sync_status} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </MainContainer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir setor"
        description="Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}