import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { ROUTES } from '@/constants/app'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { useEmpresas } from '@/hooks/useEmpresas'
import { excluirEmpresa } from '@/services/empresas.service'
import { SyncStatusChip } from '@/components/ui/SyncStatusChip'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import type { Empresa } from '@/types/empresa'

export default function EmpresasPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: empresas, status, error, refetch } = useEmpresas()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return empresas
    const term = search.toLowerCase()
    return empresas.filter(
      (e) =>
        e.razao_social.toLowerCase().includes(term) ||
        (e.nome_fantasia ?? '').toLowerCase().includes(term) ||
        (e.cnpj ?? '').includes(term)
    )
  }, [empresas, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await excluirEmpresa(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast(result.error, 'error')
      return
    }
    toast('Empresa excluída com sucesso', 'success')
    refetch()
  }

  const columns = [
    { key: 'razao_social' as keyof Empresa, header: 'Razão Social', sortable: true,
      render: (item: Empresa) => (
        <div>
          <p className="font-medium text-text-primary">{item.razao_social}</p>
          {item.nome_fantasia && <p className="text-xs text-text-muted">{item.nome_fantasia}</p>}
        </div>
      )
    },
    { key: 'cnpj' as keyof Empresa, header: 'CNPJ', sortable: true,
      render: (item: Empresa) => item.cnpj ?? <span className="text-text-muted">—</span>
    },
    { key: 'cidade' as keyof Empresa, header: 'Cidade', sortable: true,
      render: (item: Empresa) => item.cidade ? `${item.cidade}${item.uf ? `/${item.uf}` : ''}` : <span className="text-text-muted">—</span>
    },
    { key: 'sync_status' as string, header: 'Sync', sortable: false,
      render: (item: Empresa) => <SyncStatusChip sync_status={item.sync_status} />,
      className: 'w-[100px]',
    },
    { key: 'actions' as string, header: 'Ações', sortable: false,
      render: (item: Empresa) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.empresasDetalhe.replace(':id', item.id))} aria-label="Visualizar">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.empresasEditar.replace(':id', item.id))} aria-label="Editar">
            <Pencil size={16} />
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
      <Header title="Empresas" description="Gerencie as empresas cadastradas" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Empresas"
            description="Cadastro de empresas e clientes"
            action={{
              label: 'Nova empresa',
              onClick: () => navigate(ROUTES.empresasNova),
              icon: <Plus size={16} />,
            }}
          />

          {status !== 'loading' && (
            <div className="max-w-md">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, fantasia ou CNPJ…" />
            </div>
          )}

          {status === 'loading' && (
            <Card className="p-6">
              <Skeleton className="h-20 w-full rounded-lg" />
            </Card>
          )}

          {status === 'error' && (
            <Card className="p-6">
              <p className="text-sm text-danger mb-2">{error}</p>
              <button type="button" onClick={refetch} className="text-sm text-primary-600 hover:text-primary-700 underline">Tentar novamente</button>
            </Card>
          )}

          {status === 'success' && (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(e) => e.id}
              onRowClick={(item) => navigate(ROUTES.empresasDetalhe.replace(':id', item.id))}
              emptyTitle="Nenhuma empresa encontrada"
              emptyDescription={search ? 'Tente alterar o termo da busca.' : 'Você ainda não possui empresas cadastradas.'}
              emptyAction={!search ? { label: 'Nova empresa', onClick: () => navigate(ROUTES.empresasNova) } : undefined}
            />
          )}
        </div>
      </MainContainer>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir empresa"
        description="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}
