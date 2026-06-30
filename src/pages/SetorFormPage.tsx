import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { FormSection } from '@/components/ui/FormSection'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/app'
import { buscarSetorPorId, criarSetor, atualizarSetor } from '@/services/setores.service'
import { listarEmpresas } from '@/services/empresas.service'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import type { Empresa } from '@/types/empresa'
import type { SetorCreateInput, SetorUpdateInput } from '@/types/empresa'

export default function SetorFormPage() {
  const { setorId, empresaId: routeEmpresaId } = useParams<{ setorId: string; empresaId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const isEditing = !!setorId
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaId, setEmpresaId] = useState(routeEmpresaId ?? '')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [responsavelLocal, setResponsavelLocal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    listarEmpresas().then(r => {
      if (!r.error && r.data) setEmpresas(r.data)
    })
  }, [])

  useEffect(() => {
    if (!setorId) return
    let mounted = true
    buscarSetorPorId(setorId).then(result => {
      if (!mounted) return
      setFetchError(null)
      setFetching(false)
      if (result.error) { setFetchError(result.error); return }
      if (result.data) {
        setEmpresaId(result.data.empresa_id)
        setNome(result.data.nome)
        setDescricao(result.data.descricao ?? '')
        setLocalizacao(result.data.localizacao ?? '')
        setResponsavelLocal(result.data.responsavel_local ?? '')
        setObservacoes(result.data.observacoes ?? '')
      }
    })
    return () => { mounted = false }
  }, [setorId])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!empresaId) errs.empresaId = 'Empresa é obrigatória'
    if (!nome.trim()) errs.nome = 'Nome do setor é obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    if (isEditing && setorId) {
      const input: SetorUpdateInput = {
        empresa_id: empresaId,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        localizacao: localizacao.trim() || undefined,
        responsavel_local: responsavelLocal.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      }
      const result = await atualizarSetor(setorId, input)
      setLoading(false)
      if (result.error) { toast(result.error, 'error'); return }
      toast('Setor atualizado com sucesso', 'success')
      queryClient.invalidateQueries({ queryKey: queryKeys.setores.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      navigate(ROUTES.setoresDetalhe.replace(':setorId', setorId))
    } else {
      const input: SetorCreateInput = {
        empresa_id: empresaId,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        localizacao: localizacao.trim() || undefined,
        responsavel_local: responsavelLocal.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      }
      const result = await criarSetor(input)
      setLoading(false)
      if (result.error) { toast(result.error, 'error'); return }
      toast('Setor cadastrado com sucesso', 'success')
      queryClient.invalidateQueries({ queryKey: queryKeys.setores.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      navigate(ROUTES.setoresDetalhe.replace(':setorId', result.data!.id))
    }
  }

  if (fetching) {
    return (
      <>
        <Header title={isEditing ? 'Editar setor' : 'Novo setor'} description="Carregando…" />
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
        <Header title="Erro" />
        <MainContainer>
          <div className="space-y-4">
            <p className="text-sm text-danger">{fetchError}</p>
            <Button variant="secondary" onClick={() => navigate(ROUTES.setores)}>
              <ArrowLeft size={16} /> Voltar
            </Button>
          </div>
        </MainContainer>
      </>
    )
  }

  return (
    <>
      <Header title={isEditing ? 'Editar setor' : 'Novo setor'} description="Cadastro de setor" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={isEditing ? 'Editar setor' : 'Novo setor'}
            description="Preencha os dados do setor"
            breadcrumb={[
              { label: 'Setores', href: ROUTES.setores },
              { label: isEditing ? 'Editar' : 'Novo' },
            ]}
            secondaryActions={
              <Button variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            }
          />

          <Card className="p-4 md:p-5">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
              <FormSection title="Informações do setor" description="Dados principais do setor">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Empresa vinculada"
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    options={empresas.map(e => ({ value: e.id, label: e.razao_social }))}
                    placeholder="Selecione a empresa…"
                    error={errors.empresaId}
                    required
                  />
                  <Input
                    label="Nome do setor"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Administrativo"
                    error={errors.nome}
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Descrição"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descrição do setor (opcional)"
                    />
                  </div>
                  <Input
                    label="Localização / Unidade"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Ex: Prédio principal, 2° andar"
                  />
                  <Input
                    label="Responsável local"
                    value={responsavelLocal}
                    onChange={(e) => setResponsavelLocal(e.target.value)}
                    placeholder="Nome do responsável pelo setor"
                  />
                </div>
              </FormSection>

              <FormSection title="Observações">
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais…"
                  rows={3}
                />
              </FormSection>

              {(errors.nome || errors.empresaId) && (
                <div className="space-y-1">
                  {Object.entries(errors).map(([key, msg]) => (
                    <p key={key} className="text-xs text-danger">{msg}</p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isEditing ? 'Salvar alterações' : 'Criar setor'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </MainContainer>
    </>
  )
}
