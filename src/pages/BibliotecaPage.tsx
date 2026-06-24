import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterBar } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BibliotecaItemForm } from '@/components/forms/BibliotecaItemForm'
import { useToast } from '@/hooks/useToast'
import { useBibliotecaTecnica } from '@/hooks/useBibliotecaTecnica'
import {
  criarItemBiblioteca,
  atualizarItemBiblioteca,
  excluirItemBiblioteca,
  ativarItemBiblioteca,
  desativarItemBiblioteca,
} from '@/services/biblioteca-tecnica.service'
import { Plus, Pencil, Trash2, Power, PowerOff, FileText, AlertTriangle, Shield } from 'lucide-react'
import type { BibliotecaTecnicaItem, BibliotecaTecnicaCreateInput } from '@/types/biblioteca'

const categoriaIcon: Record<string, typeof FileText> = {
  'Normas Regulamentadoras': FileText,
  'Riscos Ocupacionais': AlertTriangle,
  'EPIs e EPCs': Shield,
  'Documentação Técnica': FileText,
}

export default function BibliotecaPage() {
  const { toast } = useToast()
  const { data: itens, status, error, refetch } = useBibliotecaTecnica()
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<BibliotecaTecnicaItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<BibliotecaTecnicaItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    let items = itens
    if (search.trim()) {
      const term = search.toLowerCase()
      items = items.filter(
        (i) =>
          i.titulo.toLowerCase().includes(term) ||
          (i.descricao ?? '').toLowerCase().includes(term) ||
          (i.perigo ?? '').toLowerCase().includes(term)
      )
    }
    if (filterCategoria) items = items.filter((i) => i.categoria === filterCategoria)
    return items
  }, [itens, search, filterCategoria])

  const categorias = useMemo(() => {
    const set = new Set(itens.map((i) => i.categoria).filter(Boolean))
    return [...set] as string[]
  }, [itens])

  const activeFilters = filterCategoria
    ? [{ label: `Categoria: ${filterCategoria}`, onRemove: () => setFilterCategoria('') }]
    : []

  const handleOpenNew = () => {
    setEditItem(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: BibliotecaTecnicaItem) => {
    setEditItem(item)
    setModalOpen(true)
  }

  const handleSubmit = async (data: BibliotecaTecnicaCreateInput) => {
    setSaving(true)
    if (editItem) {
      const result = await atualizarItemBiblioteca(editItem.id, data)
      setSaving(false)
      if (result.error) { toast(result.error, 'error'); return }
      toast('Item atualizado com sucesso', 'success')
    } else {
      const result = await criarItemBiblioteca(data)
      setSaving(false)
      if (result.error) { toast(result.error, 'error'); return }
      toast('Item adicionado com sucesso', 'success')
    }
    setModalOpen(false)
    setEditItem(null)
    refetch()
  }

  const handleToggleActive = async (item: BibliotecaTecnicaItem) => {
    const fn = item.ativo ? desativarItemBiblioteca : ativarItemBiblioteca
    const result = await fn(item.id)
    if (result.error) { toast(result.error, 'error'); return }
    toast(item.ativo ? 'Item desativado' : 'Item ativado', 'success')
    refetch()
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    const result = await excluirItemBiblioteca(deleteItem.id)
    setDeleting(false)
    setDeleteItem(null)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Item excluído com sucesso', 'success')
    refetch()
  }

  const columns = [
    { key: 'titulo' as keyof BibliotecaTecnicaItem, header: 'Título', sortable: true,
      render: (item: BibliotecaTecnicaItem) => (
        <div>
          <p className="font-medium text-text-primary">{item.titulo}</p>
          {item.descricao && <p className="text-xs text-text-muted truncate max-w-xs">{item.descricao}</p>}
        </div>
      )
    },
    { key: 'categoria' as keyof BibliotecaTecnicaItem, header: 'Categoria', sortable: true,
      render: (item: BibliotecaTecnicaItem) => {
        const Icon = (item.categoria ? categoriaIcon[item.categoria] : null) ?? FileText
        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Icon size={14} className="text-text-muted shrink-0" />
            {item.categoria ?? <span className="text-text-muted">—</span>}
          </span>
        )
      }
    },
    { key: 'tipo_risco' as keyof BibliotecaTecnicaItem, header: 'Tipo Risco', sortable: true,
      render: (item: BibliotecaTecnicaItem) => item.tipo_risco ? <Badge>{item.tipo_risco}</Badge> : <span className="text-text-muted">—</span>
    },
    { key: 'ativo' as keyof BibliotecaTecnicaItem, header: 'Status', sortable: true,
      render: (item: BibliotecaTecnicaItem) => item.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="muted">Inativo</Badge>
    },
    { key: 'actions' as string, header: 'Ações', sortable: false,
      render: (item: BibliotecaTecnicaItem) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(item)} aria-label={item.ativo ? 'Desativar' : 'Ativar'}>
            {item.ativo ? <PowerOff size={16} /> : <Power size={16} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} aria-label="Editar">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)} className="text-danger hover:text-danger" aria-label="Excluir">
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
      <Header title="Biblioteca Técnica" description="Consultas e referências" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Biblioteca Técnica"
            description="Consulte normas, riscos e documentação técnica"
            action={{
              label: 'Novo item',
              onClick: handleOpenNew,
              icon: <Plus size={16} />,
            }}
          />

          {status !== 'loading' && (
            <FilterBar
              activeFilters={activeFilters}
              onToggle={() => setShowFilters(!showFilters)}
            >
              <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar por título, descrição ou perigo…" className="max-w-md" />
            </FilterBar>
          )}

          {showFilters && status !== 'loading' && (
            <Card className="p-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Categoria</label>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border-light bg-white text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/70"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {status === 'loading' && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
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
              keyExtractor={(i) => i.id}
              emptyTitle="Nenhum item encontrado"
              emptyDescription={search || filterCategoria ? 'Tente alterar os filtros.' : 'A biblioteca ainda não possui itens cadastrados.'}
              emptyAction={!search && !filterCategoria ? { label: 'Novo item', onClick: handleOpenNew } : undefined}
            />
          )}
        </div>
      </MainContainer>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? 'Editar item' : 'Novo item'}
        description="Preencha as informações do item da biblioteca técnica"
        size="lg"
      >
        <BibliotecaItemForm
          initialData={editItem ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditItem(null) }}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Excluir item"
        description="Tem certeza que deseja excluir este item da biblioteca? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </>
  )
}
