import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { ROUTES } from '@/constants/app'
import { TIPOS_LEVANTAMENTO_SHORT_LABELS } from '@/constants/levantamentos'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { listarLevantamentos, excluirLevantamento } from '@/services/levantamentos.service'
import { SyncStatusChip } from '@/components/ui/SyncStatusChip'
import { Trash2, Eye, Copy, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Levantamento, TipoLevantamento, StatusLevantamento } from '@/types/levantamento'

const statusLabel: Record<string, string> = {
  rascunho: 'Rascunho',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

const statusBadge = (status: StatusLevantamento) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
    rascunho: 'muted',
    em_andamento: 'warning',
    concluido: 'success',
    arquivado: 'muted',
  }
  return <Badge variant={map[status] ?? 'default'}>{statusLabel[status] ?? status}</Badge>
}

export default function LevantamentosPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: levantamentos = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.levantamentos.all,
    queryFn: async () => {
      const result = await listarLevantamentos()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
  })
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterTipo, setFilterTipo] = useState<TipoLevantamento | ''>('')
  const [filterStatus, setFilterStatus] = useState<StatusLevantamento | ''>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = levantamentos
    if (search.trim()) {
      const term = search.toLowerCase()
      items = items.filter(
        (l) =>
          (l.codigo ?? '').toLowerCase().includes(term) ||
          (l.empresa_nome ?? '').toLowerCase().includes(term) ||
          (l.unidade ?? '').toLowerCase().includes(term)
      )
    }
    if (filterTipo) items = items.filter((l) => l.tipo === filterTipo)
    if (filterStatus) items = items.filter((l) => l.status === filterStatus)
    return items
  }, [levantamentos, search, filterTipo, filterStatus])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await excluirLevantamento(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Levantamento excluído com sucesso', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.levantamentos.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  }

  const handleDuplicate = async (id: string) => {
    setDuplicating(id)
    const { duplicarLevantamento } = await import('@/services/levantamentos.service')
    const result = await duplicarLevantamento(id)
    setDuplicating(null)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Levantamento duplicado com sucesso', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.levantamentos.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  }

  const activeFilters = [
    ...(filterTipo ? [{ label: `Tipo: ${filterTipo}`, onRemove: () => setFilterTipo('') }] : []),
    ...(filterStatus ? [{ label: `Status: ${statusLabel[filterStatus]}`, onRemove: () => setFilterStatus('') }] : []),
  ]

  const columns = [
    { key: 'codigo' as keyof Levantamento, header: 'Código', sortable: true,
      render: (item: Levantamento) => (
        <div>
          <p className="font-medium text-text-primary">{item.codigo ?? 'Sem código'}</p>
          {item.empresa_nome && <p className="text-body-small text-text-muted">{item.empresa_nome}</p>}
        </div>
      )
    },
    { key: 'tipo' as keyof Levantamento, header: 'Tipo', sortable: true,
      render: (item: Levantamento) => <Badge variant="info">{TIPOS_LEVANTAMENTO_SHORT_LABELS[item.tipo] ?? item.tipo}</Badge>
    },
    { key: 'status' as keyof Levantamento, header: 'Status', sortable: true,
      render: (item: Levantamento) => (
        <div className="flex items-center gap-2">
          {statusBadge(item.status)}
          <SyncStatusChip sync_status={item.sync_status} />
        </div>
      )
    },
    { key: 'percentual' as keyof Levantamento, header: '%', sortable: true,
      render: (item: Levantamento) => `${item.percentual}%`
    },
    { key: 'actions' as string, header: 'Ações', sortable: false,
      render: (item: Levantamento) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.levantamentosDetalhe.replace(':id', item.id))} aria-label="Visualizar">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(item.id)} disabled={duplicating === item.id} aria-label="Duplicar">
            <Copy size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-danger hover:text-danger" aria-label="Excluir">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      className: 'w-[120px] text-right',
      headerClassName: 'text-right',
    }
  ]

  return (
    <>
      <Header title="Levantamentos" description="Gerencie os levantamentos de risco" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Levantamentos"
            description="Acompanhe todos os levantamentos realizados"
            action={{
              label: 'Novo levantamento',
              onClick: () => navigate(ROUTES.levantamentosNovo),
              icon: <Plus size={16} />,
            }}
          />

          {!isLoading && (
            <FilterBar
              activeFilters={activeFilters}
              onToggle={() => setShowFilters(!showFilters)}
              isOpen={showFilters}
            >
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, empresa ou unidade…" className="max-w-md" />
            </FilterBar>
          )}

          {showFilters && !isLoading && (
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="filter-tipo" className="block text-label-medium font-medium text-text-secondary mb-1">Tipo</label>
                  <select
                    id="filter-tipo"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value as TipoLevantamento | '')}
                    className="w-full h-9 rounded-xl border border-border-light bg-white text-label-large px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/70"
                  >
                    <option value="">Todos</option>
                    <option value="LPR_AEP">LPR + AEP</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-status" className="block text-label-medium font-medium text-text-secondary mb-1">Status</label>
                  <select
                    id="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as StatusLevantamento | '')}
                    className="w-full h-9 rounded-xl border border-border-light bg-white text-label-large px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/70"
                  >
                    <option value="">Todos</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {isLoading && (
            <Card className="p-6">
              <Skeleton className="h-20 w-full rounded-lg" />
            </Card>
          )}

          {isError && (
            <Card className="p-6">
              <p className="text-body-medium text-danger mb-2" role="alert">{error instanceof Error ? error.message : 'Erro ao carregar levantamentos'}</p>
              <button type="button" onClick={() => refetch()} className="text-body-medium text-primary-600 hover:text-primary-700 underline">Tentar novamente</button>
            </Card>
          )}

          {!isLoading && !isError && (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(l) => l.id}
              onRowClick={(item) => navigate(ROUTES.levantamentosDetalhe.replace(':id', item.id))}
              emptyTitle="Nenhum levantamento encontrado"
              emptyDescription={search || filterTipo || filterStatus ? 'Tente alterar os filtros.' : 'Você ainda não possui levantamentos.'}
              emptyAction={!search && !filterTipo && !filterStatus ? { label: 'Ir para Empresas', onClick: () => navigate(ROUTES.empresas) } : undefined}
            />
          )}
        </div>
      </MainContainer>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir levantamento"
        description="Tem certeza que deseja excluir este levantamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}
