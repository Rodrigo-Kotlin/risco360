import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/app'
import { listarSetores, excluirSetor } from '@/services/setores.service'
import { listarEmpresas } from '@/services/empresas.service'
import { SyncStatusChip } from '@/components/ui/SyncStatusChip'
import {
  Plus, Pencil, Trash2, Layers, Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SetoresPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const setoresQuery = useQuery({
    queryKey: queryKeys.setores.all,
    queryFn: async () => {
      const result = await listarSetores()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
  })

  const empresasQuery = useQuery({
    queryKey: queryKeys.empresas.all,
    queryFn: async () => {
      const result = await listarEmpresas()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
  })

  const isLoading = setoresQuery.isLoading
  const isError = setoresQuery.isError
  const error = setoresQuery.error

  const empresas: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    for (const e of empresasQuery.data ?? []) {
      map[e.id] = e.razao_social
    }
    return map
  }, [empresasQuery.data])

  const [search, setSearch] = useState('')
  const [empresaFiltro, setEmpresaFiltro] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const empresaOptions = useMemo(() => {
    const setores = setoresQuery.data ?? []
    const unique = [...new Set(setores.map(s => s.empresa_id))]
    return unique.map(id => ({ value: id, label: empresas[id] ?? id }))
  }, [setoresQuery.data, empresas])

  const filtered = useMemo(() => {
    let result = setoresQuery.data ?? []
    if (empresaFiltro) {
      result = result.filter(s => s.empresa_id === empresaFiltro)
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        s => s.nome.toLowerCase().includes(term) ||
          (s.descricao ?? '').toLowerCase().includes(term)
      )
    }
    return result
  }, [setoresQuery.data, search, empresaFiltro])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await excluirSetor(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast(result.error, 'error')
      return
    }
    toast('Setor excluído com sucesso', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.setores.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  }

  if (isLoading) {
    return (
      <>
        <Header title="Setores" description="Carregando…" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{error instanceof Error ? error.message : 'Erro ao carregar setores'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => setoresQuery.refetch()}>
            Tentar novamente
          </Button>
        </MainContainer>
      </>
    )
  }

  return (
    <>
      <Header title="Setores" description="Gerencie os setores cadastrados" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Setores"
            description="Cadastro de setores por empresa"
            action={{
              label: 'Novo setor',
              onClick: () => navigate(ROUTES.setoresNovo),
              icon: <Plus size={16} />,
            }}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-md">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome do setor…" />
            </div>
            {empresaOptions.length > 1 && (
              <select
                value={empresaFiltro}
                onChange={(e) => setEmpresaFiltro(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-text-primary"
              >
                <option value="">Todas as empresas</option>
                {empresaOptions.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-text-muted">
                {search || empresaFiltro
                  ? 'Nenhum setor encontrado com os filtros atuais.'
                  : 'Nenhum setor cadastrado.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((setor) => (
                <Card
                  key={setor.id}
                  className="p-4 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-shadow flex flex-col"
                  onClick={() => navigate(ROUTES.setoresDetalhe.replace(':setorId', setor.id))}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-text-muted shrink-0" />
                      <CardTitle className="text-sm">{setor.nome}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <SyncStatusChip sync_status={setor.sync_status} />
                      <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.setoresEditar.replace(':setorId', setor.id))} aria-label="Editar">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(setor.id)} className="text-danger hover:text-danger" aria-label="Excluir">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  {setor.descricao && (
                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">{setor.descricao}</p>
                  )}
                  <div className="mt-auto flex items-center gap-1.5 text-xs text-text-muted">
                    <Building2 size={12} />
                    <span className="truncate">{empresas[setor.empresa_id] ?? 'Empresa'}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainContainer>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
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
