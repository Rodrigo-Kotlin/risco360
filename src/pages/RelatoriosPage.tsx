import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { useRelatorios } from '@/hooks/useRelatorios'
import { excluirRelatorio } from '@/services/relatorios.service'
import { Download, Trash2 } from 'lucide-react'
import type { Relatorio, StatusRelatorio } from '@/types/relatorio'

const relStatusBadge = (s: StatusRelatorio) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
    gerado: 'info',
    baixado: 'warning',
    arquivado: 'muted',
    erro: 'danger',
  }
  return <Badge variant={map[s] ?? 'default'}>{s}</Badge>
}

const tipoLabel: Record<string, string> = {
  completo: 'Relatório Completo',
  executivo: 'Relatório Executivo',
  inventario_riscos: 'Inventário de Riscos',
  plano_acao: 'Plano de Ação',
}

export default function RelatoriosPage() {
  const { toast } = useToast()
  const { data: relatorios, status, error, refetch } = useRelatorios()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return relatorios
    const term = search.toLowerCase()
    return relatorios.filter(
      (r) =>
        (r.empresa_nome ?? '').toLowerCase().includes(term) ||
        tipoLabel[r.tipo]?.toLowerCase().includes(term) ||
        (r.modelo ?? '').toLowerCase().includes(term)
    )
  }, [relatorios, search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await excluirRelatorio(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Relatório excluído', 'success')
    refetch()
  }

  const formatoData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const columns = [
    { key: 'tipo' as keyof Relatorio, header: 'Tipo', sortable: true,
      render: (item: Relatorio) => (
        <div>
          <p className="font-medium text-text-primary">{tipoLabel[item.tipo] ?? item.tipo}</p>
          {item.empresa_nome && <p className="text-xs text-text-muted">{item.empresa_nome}</p>}
        </div>
      )
    },
    { key: 'modelo' as keyof Relatorio, header: 'Modelo', sortable: true,
      render: (item: Relatorio) => item.modelo ?? <span className="text-text-muted">—</span>
    },
    { key: 'status' as keyof Relatorio, header: 'Status', sortable: true,
      render: (item: Relatorio) => relStatusBadge(item.status)
    },
    { key: 'created_at' as keyof Relatorio, header: 'Criado em', sortable: true,
      render: (item: Relatorio) => formatoData(item.created_at)
    },
    { key: 'actions' as string, header: 'Ações', sortable: false,
      render: (item: Relatorio) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" disabled={!item.arquivo_url} aria-label="Download">
            <Download size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-danger hover:text-danger" aria-label="Excluir">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      className: 'w-[80px] text-right',
      headerClassName: 'text-right',
    }
  ]

  return (
    <>
      <Header title="Relatórios" description="Geração de documentos" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Relatórios"
            description="Acesse e gerencie relatórios dos levantamentos"
          />

          {status !== 'loading' && (
            <div className="max-w-md">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por empresa, tipo ou modelo…" />
            </div>
          )}

          {status === 'loading' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {status === 'success' && (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(r) => r.id}
              emptyTitle="Nenhum relatório encontrado"
              emptyDescription={search ? 'Tente alterar o termo da busca.' : 'Você ainda não possui relatórios gerados. Os relatórios são criados automaticamente a partir dos levantamentos.'}
            />
          )}

          {status === 'error' && (
            <Card className="p-6">
              <p className="text-sm text-danger mb-2">{error}</p>
              <button type="button" onClick={refetch} className="text-sm text-primary-600 hover:text-primary-700 underline">Tentar novamente</button>
            </Card>
          )}
        </div>
      </MainContainer>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir relatório"
        description="Tem certeza que deseja excluir este relatório?"
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}
