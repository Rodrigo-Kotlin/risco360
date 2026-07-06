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
import { listarCnaesNR4, pesquisarCnaeNR4, obterDescricaoGrauRiscoNR4, validarBaseNR4Service } from '@/services/nr4.service'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Plus, Pencil, Trash2, Power, PowerOff, FileText, AlertTriangle, Shield, Scale } from 'lucide-react'
import type { BibliotecaTecnicaItem, BibliotecaTecnicaCreateInput } from '@/types/biblioteca'
import type { NR4CnaeGrauRiscoItem } from '@/data/nr4-cnae-grau-risco'

type TabId = 'perigos_riscos' | 'nr4'

const TABS: { id: TabId; label: string }[] = [
  { id: 'perigos_riscos', label: 'Perigos e Riscos' },
  { id: 'nr4', label: 'NR-4 CNAE × Grau de Risco' },
]

const categoriaIcon: Record<string, typeof FileText> = {
  'Normas Regulamentadoras': FileText,
  'Riscos Ocupacionais': AlertTriangle,
  'EPIs e EPCs': Shield,
  'Documentação Técnica': FileText,
}

const grauRiscoColor: Record<number, 'riskLow' | 'riskMedium' | 'riskHigh' | 'danger'> = {
  1: 'riskLow',
  2: 'riskMedium',
  3: 'riskHigh',
  4: 'danger',
}

export default function BibliotecaPage() {
  const [tab, setTab] = useState<TabId>('perigos_riscos')

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

  const [nr4Search, setNr4Search] = useState('')
  const [nr4FilterGrau, setNr4FilterGrau] = useState<number | null>(null)

  const baseValidation = useMemo(() => validarBaseNR4Service(), [])

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

  const nr4Items = useMemo(() => {
    let items: NR4CnaeGrauRiscoItem[]
    if (nr4Search.trim()) {
      items = pesquisarCnaeNR4(nr4Search)
    } else {
      items = listarCnaesNR4()
    }
    if (nr4FilterGrau !== null) {
      items = items.filter((i) => i.grauRisco === nr4FilterGrau)
    }
    return items
  }, [nr4Search, nr4FilterGrau])

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
          {item.descricao && <p className="text-body-small text-text-muted truncate max-w-xs">{item.descricao}</p>}
        </div>
      )
    },
    { key: 'categoria' as keyof BibliotecaTecnicaItem, header: 'Categoria', sortable: true,
      render: (item: BibliotecaTecnicaItem) => {
        const Icon = (item.categoria ? categoriaIcon[item.categoria] : null) ?? FileText
        return (
          <span className="inline-flex items-center gap-1.5 text-body-medium">
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
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(item)} aria-label={item.ativo ? 'Desativar' : 'Ativar'} className="w-12 h-12">
            {item.ativo ? <PowerOff size={16} /> : <Power size={16} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} aria-label="Editar" className="w-12 h-12">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)} className="w-12 h-12 text-danger hover:text-danger" aria-label="Excluir">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
      className: 'w-[120px] text-right',
      headerClassName: 'text-right',
    }
  ]

  const nr4Columns = [
    { key: 'cnae4' as keyof NR4CnaeGrauRiscoItem, header: 'CNAE (4 dígitos)', sortable: true,
      render: (item: NR4CnaeGrauRiscoItem) => (
        <code className="font-mono font-medium text-text-primary">{item.cnae4}</code>
      )
    },
    { key: 'descricao' as keyof NR4CnaeGrauRiscoItem, header: 'Descrição', sortable: true,
      render: (item: NR4CnaeGrauRiscoItem) => item.descricao ?? <span className="text-text-muted">—</span>
    },
    { key: 'grauRisco' as keyof NR4CnaeGrauRiscoItem, header: 'Grau de Risco', sortable: true,
      render: (item: NR4CnaeGrauRiscoItem) => (
        <Badge variant={grauRiscoColor[item.grauRisco] ?? 'default'}>
          {obterDescricaoGrauRiscoNR4(item.grauRisco)}
        </Badge>
      )
    },
    { key: 'fonte' as keyof NR4CnaeGrauRiscoItem, header: 'Fonte', sortable: false,
      render: () => <span className="text-body-small text-text-muted">NR-4</span>
    },
  ]

  return (
    <>
      <Header />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Biblioteca Técnica"
            description="Consulte normas, riscos e documentação técnica"
            action={tab === 'perigos_riscos' ? {
              label: 'Novo item',
              onClick: handleOpenNew,
              icon: <Plus size={16} />,
            } : undefined}
          />

          <div className="flex gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-label-large font-medium transition-colors border-b-2 -mb-px min-h-[44px] ${
                  tab === t.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-text-muted'
                }`}
              >
                {t.id === 'nr4' && <Scale size={16} className="inline mr-1.5 -mt-0.5" />}
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'perigos_riscos' && (
            <>
              {status !== 'loading' && (
                <FilterBar
                  activeFilters={activeFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                  isOpen={showFilters}
                >
                  <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar por título, descrição ou perigo…" className="max-w-md" />
                </FilterBar>
              )}

              {showFilters && status !== 'loading' && (
                <Card className="p-4">
                  <div>
                    <label htmlFor="filter-categoria" className="block text-label-medium font-medium text-text-secondary mb-1">Categoria</label>
                    <select
                      id="filter-categoria"
                      value={filterCategoria}
                      onChange={(e) => setFilterCategoria(e.target.value)}
                      className="w-full min-h-[48px] rounded-xl border border-border-light bg-white text-body-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/70"
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
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {status === 'error' && (
                <Card className="p-6">
                  <p className="text-body-medium text-danger mb-2">{error}</p>
                  <button type="button" onClick={refetch} className="min-h-[48px] text-label-large text-primary-600 hover:text-primary-700 underline">Tentar novamente</button>
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
            </>
          )}

          {tab === 'nr4' && (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-body-small text-text-muted">
                      Base normativa NR-4 — {baseValidation.total} registros · {baseValidation.valida ? 'Sem conflitos' : `${baseValidation.conflitos.length} conflito(s)`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <SearchInput value={nr4Search} onChange={setNr4Search} placeholder="Buscar por CNAE ou descrição…" className="max-w-md" />
                  </div>
                  <div className="w-full sm:w-48">
                    <select
                      value={nr4FilterGrau ?? ''}
                      onChange={(e) => setNr4FilterGrau(e.target.value ? Number(e.target.value) : null)}
                      className="w-full min-h-[48px] rounded-xl border border-border-light bg-white text-body-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/70"
                    >
                      <option value="">Todos os graus</option>
                      <option value="1">Grau 1 - Baixo</option>
                      <option value="2">Grau 2 - Médio</option>
                      <option value="3">Grau 3 - Alto</option>
                      <option value="4">Grau 4 - Muito Alto</option>
                    </select>
                  </div>
                </div>
              </Card>

              <DataTable
                columns={nr4Columns}
                data={nr4Items}
                keyExtractor={(i) => i.cnae4}
                emptyTitle="Nenhum registro encontrado"
                emptyDescription="Nenhum CNAE encontrado na base NR-4 para a busca realizada."
              />

              <Card className="p-4">
                <p className="text-label-medium text-text-muted">
                  Fonte: NR-4 — Quadro I: Dimensionamento do SESMT · Consulta baseada nos 4 primeiros dígitos do CNAE normalizado · Base offline.
                </p>
              </Card>
            </>
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
