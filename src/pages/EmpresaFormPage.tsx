import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/ui/PageHeader'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { ROUTES } from '@/constants/app'
import { Button } from '@/components/ui/Button'
import { EmpresaForm } from '@/components/forms/EmpresaForm'
import { useToast } from '@/hooks/useToast'
import { buscarEmpresaPorId, criarEmpresa, atualizarEmpresa } from '@/services/empresas.service'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Empresa, EmpresaCreateInput, EmpresaUpdateInput } from '@/types/empresa'

export default function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const isEditing = !!id
  const [initialData, setInitialData] = useState<Empresa | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true)
    setFetchError(null)
    let mounted = true
    buscarEmpresaPorId(id).then((result) => {
      if (!mounted) return
      setFetching(false)
      if (result.error) {
        setFetchError(result.error)
        return
      }
      if (result.data) setInitialData(result.data)
    })
    return () => { mounted = false }
  }, [id])

  const handleSubmit = async (data: EmpresaCreateInput | EmpresaUpdateInput) => {
    setLoading(true)
    if (isEditing && id) {
      const result = await atualizarEmpresa(id, data as EmpresaUpdateInput)
      setLoading(false)
      if (result.error) {
        toast(result.error, 'error')
        return
      }
      toast('Empresa atualizada com sucesso', 'success')
      queryClient.invalidateQueries({ queryKey: queryKeys.empresas.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      navigate(ROUTES.empresasDetalhe.replace(':id', id))
    } else {
      const result = await criarEmpresa(data as EmpresaCreateInput)
      setLoading(false)
      if (result.error) {
        toast(result.error, 'error')
        return
      }
      toast('Empresa cadastrada com sucesso', 'success')
      queryClient.invalidateQueries({ queryKey: queryKeys.empresas.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      navigate(ROUTES.empresas)
    }
  }

  if (fetching) {
    return (
      <>
        <Header title={isEditing ? 'Editar empresa' : 'Nova empresa'} description="Carregando…" />
        <MainContainer>
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-text-muted" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (fetchError) {
    return (
      <>
        <Header title="Erro" description="Não foi possível carregar os dados" />
        <MainContainer>
          <div className="space-y-4">
            <p className="text-sm text-danger">{fetchError}</p>
            <Button variant="secondary" onClick={() => navigate(ROUTES.empresas)}>
              <ArrowLeft size={16} /> Voltar
            </Button>
          </div>
        </MainContainer>
      </>
    )
  }

  return (
    <>
      <Header title={isEditing ? 'Editar empresa' : 'Nova empresa'} description="Cadastro de empresa" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={isEditing ? 'Editar empresa' : 'Nova empresa'}
            description="Preencha os dados da empresa"
            breadcrumb={[
              { label: 'Empresas', href: ROUTES.empresas },
              { label: isEditing ? 'Editar' : 'Nova' },
            ]}
            secondaryActions={
              <Button variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            }
          />

          <EmpresaForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            loading={loading}
          />
        </div>
      </MainContainer>
    </>
  )
}
