import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants/app'
import { buscarEmpresaPorId } from '@/services/empresas.service'
import { listarSetoresPorEmpresa } from '@/services/setores.service'
import { buscarFormularioSetorialPorSetor, buscarLevantamentosPorEmpresa } from '@/services/levantamentos.service'
import { Pencil, ArrowLeft, Plus, Building2, MapPin, Phone, Mail, User, FileText, Shield, Globe, Layers, ClipboardList, FileSpreadsheet } from 'lucide-react'
import type { Empresa, Setor } from '@/types/empresa'
import type { Levantamento } from '@/types/levantamento'

export default function EmpresaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [levantamentos, setLevantamentos] = useState<Levantamento[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [formulariosSetoriais, setFormulariosSetoriais] = useState<Record<string, Levantamento | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    let mounted = true
    Promise.all([
      buscarEmpresaPorId(id),
      buscarLevantamentosPorEmpresa(id),
      listarSetoresPorEmpresa(id),
    ]).then(async ([empResult, levResult, setResult]) => {
      if (!mounted) return
      setLoading(false)
      if (empResult.error) {
        setError(empResult.error)
        return
      }
      if (empResult.data) setEmpresa(empResult.data)
      if (!levResult.error && levResult.data) setLevantamentos(levResult.data)
      if (!setResult.error && setResult.data) {
        setSetores(setResult.data)
        const formMap: Record<string, Levantamento | null> = {}
        for (const s of setResult.data) {
          const form = await buscarFormularioSetorialPorSetor(s.id)
          formMap[s.id] = form.data
        }
        if (mounted) setFormulariosSetoriais(formMap)
      }
    })
    return () => { mounted = false }
  }, [id])

  const statusBadge = (status: Levantamento['status']) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
      rascunho: 'muted',
      em_andamento: 'warning',
      concluido: 'success',
      arquivado: 'muted',
    }
    return <Badge variant={map[status] ?? 'default'}>{status.replace('_', ' ')}</Badge>
  }

  const getUltimoLevantamento = (setorId: string): Levantamento | undefined => {
    return levantamentos.filter(l => l.setor_id === setorId)
      .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())[0]
  }

  if (loading) {
    return (
      <>
        <Header title="Detalhe da empresa" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (error || !empresa) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{error ?? 'Empresa não encontrada'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.empresas)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </MainContainer>
      </>
    )
  }

  const infoItems = [
    { icon: Building2, label: 'Razão social', value: empresa.razao_social },
    { icon: Building2, label: 'Nome fantasia', value: empresa.nome_fantasia },
    { icon: FileText, label: 'CNPJ', value: empresa.cnpj },
    { icon: FileText, label: 'CNAE', value: empresa.cnae },
    { icon: Shield, label: 'Grau de risco', value: empresa.grau_risco ? `Grau ${empresa.grau_risco}` : null },
    { icon: MapPin, label: 'Endereço', value: [empresa.endereco, empresa.numero, empresa.bairro].filter(Boolean).join(', ') },
    { icon: Globe, label: 'Cidade/UF', value: [empresa.cidade, empresa.uf].filter(Boolean).join('/') },
    { icon: MapPin, label: 'CEP', value: empresa.cep },
    { icon: User, label: 'Responsável', value: empresa.responsavel },
    { icon: Phone, label: 'Telefone', value: empresa.telefone },
    { icon: Mail, label: 'E-mail', value: empresa.email },
  ]

  return (
    <>
      <Header title={empresa.razao_social} description={empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : undefined} />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={empresa.razao_social}
            description={empresa.nome_fantasia ?? undefined}
            breadcrumb={[
              { label: 'Empresas', href: ROUTES.empresas },
              { label: empresa.razao_social },
            ]}
            action={{
              label: 'Editar',
              onClick: () => navigate(ROUTES.empresasEditar.replace(':id', empresa.id)),
              icon: <Pencil size={16} />,
            }}
            secondaryActions={
              <>
                <Button variant="secondary" onClick={() => navigate(ROUTES.empresaConsolidado.replace(':empresaId', empresa.id))}>
                  <FileSpreadsheet size={16} /> Consolidar / Exportar
                </Button>
                <Button variant="secondary" onClick={() => navigate(ROUTES.empresas)}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
              </>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <CardTitle className="mb-4">Informações da empresa</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
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

            <Card className="p-5">
              <CardTitle className="mb-3">Resumo</CardTitle>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Total de levantamentos</p>
                  <p className="text-2xl font-bold text-text-primary">{levantamentos.length}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Concluídos</p>
                  <p className="text-2xl font-bold text-success">{levantamentos.filter((l) => l.status === 'concluido').length}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Em andamento</p>
                  <p className="text-2xl font-bold text-warning">{levantamentos.filter((l) => l.status !== 'concluido' && l.status !== 'arquivado').length}</p>
                </div>
              </div>
            </Card>
          </div>

          {empresa.observacoes && (
            <Card className="p-5">
              <CardTitle className="mb-2">Observações</CardTitle>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{empresa.observacoes}</p>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Setores</h3>
                <p className="text-xs text-text-muted">Setores cadastrados e status do formulário LPR + AEP</p>
              </div>
              <Button size="sm" onClick={() => navigate(ROUTES.setorNovoComEmpresa.replace(':empresaId', empresa.id))}>
                <Plus size={14} /> Adicionar Setor
              </Button>
            </div>
            {setores.length === 0 ? (
              <Card className="p-5">
                <p className="text-sm text-text-muted">Nenhum setor cadastrado para esta empresa.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {setores.map((s) => {
                  const form = formulariosSetoriais[s.id]
                  const ultimoLev = getUltimoLevantamento(s.id)
                  const medicoesCount = form?.medicoes?.length ?? 0
                  return (
                    <Card
                      key={s.id}
                      className="p-4 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-shadow flex flex-col"
                      onClick={() => navigate(ROUTES.setorDetalhe.replace(':empresaId', id ?? '').replace(':setorId', s.id))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Layers size={16} className="text-text-muted shrink-0" />
                        <p className="font-medium text-text-primary text-sm">{s.nome}</p>
                      </div>
                      {s.descricao && (
                        <p className="text-xs text-text-secondary mb-2 line-clamp-2">{s.descricao}</p>
                      )}
                      {s.responsavel_local && (
                        <p className="text-xs text-text-muted mb-1">
                          <User size={12} className="inline mr-1" />
                          {s.responsavel_local}
                        </p>
                      )}
                      <div className="mt-auto space-y-1 pt-2 border-t border-border-light">
                        {form ? (
                          <>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">LPR + AEP</span>
                              <div className="flex items-center gap-1.5">
                                {statusBadge(form.status)}
                                <span className="text-text-muted">{form.percentual}%</span>
                              </div>
                            </div>
                            {medicoesCount > 0 && (
                              <p className="text-xs text-text-muted">{medicoesCount} medição(ões)</p>
                            )}
                          </>
                        ) : (
                          <Badge variant="muted">Pendente</Badge>
                        )}
                        {ultimoLev && (
                          <p className="text-[10px] text-text-muted">
                            Última atualização: {new Date(ultimoLev.updated_at ?? '').toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {levantamentos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Levantamentos</h3>
                  <p className="text-xs text-text-muted">Levantamentos de risco desta empresa</p>
                </div>
              </div>
              <div className="space-y-2">
                {levantamentos.map((lev) => (
                  <Card
                    key={lev.id}
                    className="p-4 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-shadow"
                    onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', lev.id))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={14} className="text-text-muted shrink-0" />
                        <div>
                          <p className="font-medium text-text-primary text-sm">{lev.codigo ?? 'Sem código'}</p>
                          <p className="text-xs text-text-secondary">{lev.setor_nome ?? ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">{lev.percentual}%</span>
                        {statusBadge(lev.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </MainContainer>
    </>
  )
}