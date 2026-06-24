import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/app'
import { useToast } from '@/hooks/useToast'
import { criarFormularioSetorial } from '@/services/levantamentos.service'
import { buscarEmpresaPorId } from '@/services/empresas.service'
import { buscarSetorPorId } from '@/services/setores.service'
import { ArrowLeft, Loader2 } from 'lucide-react'
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

  const empresaIdParam = routeParams.empresaId
  const setorIdParam = routeParams.setorId

  useEffect(() => {
    const load = async () => {
      if (setorIdParam) {
        const setorResult = await buscarSetorPorId(setorIdParam)
        if (!setorResult.error && setorResult.data) {
          setSetor(setorResult.data)
          const empResult = await buscarEmpresaPorId(setorResult.data.empresa_id)
          if (!empResult.error && empResult.data) setEmpresa(empResult.data)
        }
      } else if (empresaIdParam) {
        const empResult = await buscarEmpresaPorId(empresaIdParam)
        if (!empResult.error && empResult.data) setEmpresa(empResult.data)
      }
      setPreloading(false)
    }
    load()
  }, [empresaIdParam, setorIdParam])

  const handleSubmit = async () => {
    if (!setorIdParam || !setor || !empresa) {
      toast('Setor ou empresa não encontrados.', 'error')
      return
    }
    setLoading(true)

    const result = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      empresa_id: empresa.id,
      empresa_nome: empresa.razao_social,
      cnpj: empresa.cnpj ?? undefined,
      setor_id: setorIdParam,
      setor_nome: setor.nome,
      status: 'rascunho',
    })
    setLoading(false)
    if (result.error) {
      toast(result.error, 'error')
      return
    }
    toast('Novo Levantamento criado com sucesso!', 'success')
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
                <ArrowLeft size={16} /> Voltar
              </Button>
            }
          />

          {preloading ? (
            <Card className="p-5 flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-text-muted" />
            </Card>
          ) : (
            <Card className="p-4 md:p-5">
              <div className="space-y-6">
                <div className="bg-surface-muted rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-text-primary">Dados do levantamento</h4>
                  {empresa && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-text-muted">Empresa</p>
                        <p className="font-medium text-text-primary">{empresa.razao_social}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">CNPJ</p>
                        <p className="text-text-primary">{empresa.cnpj ?? '—'}</p>
                      </div>
                    </div>
                  )}
                  {setor && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-text-muted">Setor</p>
                        <p className="font-medium text-text-primary">{setor.nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Tipo</p>
                        <p className="text-text-primary">LPR + AEP - Levantamento Setorial Integrado</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button type="button" variant="secondary" onClick={() => navigate(backRoute)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !setor || !empresa}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
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