import { useState, useEffect } from 'react'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ROUTES } from '@/constants/app'
import { useToast } from '@/hooks/useToast'
import { criarFormularioSetorial } from '@/services/levantamentos.service'
import { buscarEmpresaPorId, listarEmpresas } from '@/services/empresas.service'
import { buscarSetorPorId, listarSetoresPorEmpresa } from '@/services/setores.service'
import { ArrowLeft, Loader2, Building2, Layers } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Empresa, Setor } from '@/types/empresa'

export default function NovoLevantamentoPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const routeParams = useParams<{ empresaId?: string; setorId?: string }>()
  const [loading, setLoading] = useState(false)
  const [preloading, setPreloading] = useState(true)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [setor, setSetor] = useState<Setor | null>(null)

  const [empresas, setEmpresas] = useState<{ value: string; label: string }[]>([])
  const [setores, setSetores] = useState<{ value: string; label: string }[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('')
  const [selectedSetorId, setSelectedSetorId] = useState('')
  const [loadingSetores, setLoadingSetores] = useState(false)

  const empresaIdParam = routeParams.empresaId
  const setorIdParam = routeParams.setorId
  const hasParams = !!(empresaIdParam || setorIdParam)

  useEffect(() => {
    const load = async () => {
      if (setorIdParam) {
        const setorResult = await buscarSetorPorId(setorIdParam)
        if (!setorResult.error && setorResult.data) {
          setSetor(setorResult.data)
          setSelectedSetorId(setorResult.data.id)
          const empResult = await buscarEmpresaPorId(setorResult.data.empresa_id)
          if (!empResult.error && empResult.data) {
            setEmpresa(empResult.data)
            setSelectedEmpresaId(empResult.data.id)
          }
        }
      } else if (empresaIdParam) {
        const empResult = await buscarEmpresaPorId(empresaIdParam)
        if (!empResult.error && empResult.data) {
          setEmpresa(empResult.data)
          setSelectedEmpresaId(empResult.data.id)
        }
      } else {
        const result = await listarEmpresas()
        if (!result.error && result.data) {
          setEmpresas(result.data.map((e) => ({ value: e.id, label: `${e.razao_social}${e.cnpj ? ` (${e.cnpj})` : ''}` })))
        }
      }
      setPreloading(false)
    }
    load()
  }, [empresaIdParam, setorIdParam])

  useEffect(() => {
    if (!hasParams && selectedEmpresaId) {
      listarSetoresPorEmpresa(selectedEmpresaId).then((result) => {
        if (!result.error && result.data) {
          setSetores(result.data.map((s) => ({ value: s.id, label: s.nome })))
        }
      }).finally(() => setLoadingSetores(false))
    }
  }, [selectedEmpresaId, hasParams])

  const handleSubmit = async () => {
    const empresaId = empresa?.id || selectedEmpresaId
    const setorId = setor?.id || selectedSetorId
    const empresaNome = empresa?.razao_social || ''

    if (!setorId || !empresaId) {
      toast('Selecione uma empresa e um setor.', 'error')
      return
    }

    const setorNome = setor?.nome || setores.find((s) => s.value === setorId)?.label || ''
    setLoading(true)

    const result = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      empresa_id: empresaId,
      empresa_nome: empresaNome,
      cnpj: empresa?.cnpj ?? undefined,
      setor_id: setorId,
      setor_nome: setorNome,
      status: 'rascunho',
    })
    setLoading(false)
    if (result.error) {
      toast(result.error, 'error')
      return
    }
    toast('Novo Levantamento criado com sucesso!', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.levantamentos.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    navigate(ROUTES.levantamentosEditar.replace(':id', result.data!.id))
  }

  const backRoute = setorIdParam
    ? ROUTES.setoresDetalhe.replace(':setorId', setorIdParam)
    : empresaIdParam
    ? ROUTES.empresasDetalhe.replace(':id', empresaIdParam)
    : ROUTES.levantamentos

  return (
    <>
      <Header title="Novo levantamento" description="Criação inicial" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Novo Levantamento Setorial LPR + AEP"
            description="Preencha os dados iniciais para criar o formulário setorial integrado."
            breadcrumb={[
              { label: 'Levantamentos', href: ROUTES.levantamentos },
              { label: 'Novo' },
            ]}
            secondaryActions={
              <Button variant="secondary" onClick={() => navigate(backRoute)}>
                <ArrowLeft size={16} aria-hidden="true" /> Voltar
              </Button>
            }
          />

          {preloading ? (
            <Card className="p-5 flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-text-muted" aria-hidden="true" />
            </Card>
          ) : (
            <Card className="p-4 md:p-5">
              <div className="space-y-6">
                {!hasParams && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-title-small font-semibold text-text-primary">
                      <Building2 size={16} aria-hidden="true" /> Selecione empresa e setor
                    </h3>
                    <Select
                      label="Empresa"
                      value={selectedEmpresaId}
                      onChange={(e) => { setSelectedEmpresaId(e.target.value); setSelectedSetorId(''); setLoadingSetores(true) }}
                      options={empresas}
                      placeholder="Selecione uma empresa…"
                    />
                    {selectedEmpresaId && (
                      <Select
                        label="Setor"
                        value={selectedSetorId}
                        onChange={(e) => setSelectedSetorId(e.target.value)}
                        options={setores}
                        placeholder={loadingSetores ? 'Carregando setores…' : 'Selecione um setor…'}
                        disabled={loadingSetores}
                      />
                    )}
                  </div>
                )}

                <div className="bg-surface-muted rounded-lg p-4 space-y-3">
                  <h2 className="text-title-small font-semibold text-text-primary flex items-center gap-2">
                    <Layers size={16} aria-hidden="true" /> Dados do levantamento
                  </h2>
                  {(empresa || selectedEmpresaId) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-medium">
                      <div>
                        <p className="text-label-medium text-text-muted">Empresa</p>
                        <p className="font-medium text-text-primary">
                          {empresa?.razao_social ?? empresas.find((e) => e.value === selectedEmpresaId)?.label?.split(' (')[0] ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-label-medium text-text-muted">CNPJ</p>
                        <p className="text-text-primary">{empresa?.cnpj ?? '—'}</p>
                      </div>
                    </div>
                  )}
                  {(setor || selectedSetorId) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-medium">
                      <div>
                        <p className="text-label-medium text-text-muted">Setor</p>
                        <p className="font-medium text-text-primary">
                          {setor?.nome ?? setores.find((s) => s.value === selectedSetorId)?.label ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-label-medium text-text-muted">Tipo</p>
                        <p className="text-text-primary">LPR + AEP - Levantamento Setorial Integrado</p>
                      </div>
                    </div>
                  )}
                  {!hasParams && !selectedEmpresaId && (
                    <p className="text-body-medium text-text-muted">Selecione uma empresa e setor acima para continuar.</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button type="button" variant="secondary" onClick={() => navigate(backRoute)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !selectedSetorId}>
                    {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                    {loading ? 'Criando…' : 'Confirmar Novo Levantamento'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </MainContainer>
    </>
  )
}